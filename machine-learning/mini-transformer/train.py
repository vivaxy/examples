# /// script
# requires-python = ">=3.10"
# dependencies = ["torch"]
# ///

# Minimal character-level Transformer language model.
# Trains on Tiny Shakespeare (input.txt), then generates new text.
# Pipeline: text -> token ids -> Transformer -> next-token probabilities.

# Path builds the path to input.txt relative to this file.
from pathlib import Path

# PyTorch: tensors, automatic gradients and GPU support.
import torch

# Neural network building blocks (layers, Module base class).
import torch.nn as nn

# Stateless functions such as softmax and cross_entropy.
from torch.nn import functional as F

# --- Hyperparameters ---------------------------------------------------

# Number of independent text chunks processed in one training step.
batch_size = 32
# Context length: how many previous characters the model can look at.
block_size = 64
# Size of the vector that represents each token inside the model.
n_embd = 128
# Number of attention heads; each head works on n_embd / n_head dimensions.
n_head = 4
# Number of stacked Transformer blocks.
n_layer = 4
# Total number of training steps.
max_iters = 3000
# Print train/val loss every this many steps.
eval_interval = 300
# Number of batches averaged when estimating the loss.
eval_iters = 50
# Step size of the optimizer.
learning_rate = 1e-3
# Use an NVIDIA GPU (cuda), else an Apple GPU (mps), else the CPU.
device = (
    'cuda'
    if torch.cuda.is_available()
    else 'mps' if torch.backends.mps.is_available() else 'cpu'
)

# Fix the random seed so every run produces the same result.
torch.manual_seed(1337)

# --- Data --------------------------------------------------------------

# Read the whole training text into one string.
text = (Path(__file__).parent / 'input.txt').read_text(encoding='utf-8')

# Character-level tokenizer: every unique character is one token.
# All unique characters in the text, sorted so the ids are stable.
chars = sorted(set(text))
# Number of distinct tokens the model can read and predict.
vocab_size = len(chars)
# Map each character to its integer id ("string to integer").
stoi = {ch: i for i, ch in enumerate(chars)}
# Map each integer id back to its character ("integer to string").
itos = {i: ch for i, ch in enumerate(chars)}


# Turn a string into a list of token ids.
def encode(s):
    # Look up the id of every character.
    return [stoi[c] for c in s]


# Turn a list of token ids back into a string.
def decode(ids):
    # Look up the character of every id and join them.
    return ''.join(itos[i] for i in ids)


# Encode the whole text as one long 1-D tensor of token ids.
data = torch.tensor(encode(text), dtype=torch.long)
# Split point: first 90% for training, rest for validation.
n = int(0.9 * len(data))
# Training split: the model learns from this part.
train_data = data[:n]
# Validation split: never trained on, used to check generalization.
val_data = data[n:]


# Random chunks of text. Target y is input x shifted left by one token,
# so at every position the model learns to predict the next character.
def get_batch(split):
    # Pick the split to sample from.
    data = train_data if split == 'train' else val_data
    # batch_size random start positions, leaving room for a full chunk.
    ix = torch.randint(len(data) - block_size, (batch_size,))
    # Inputs: block_size tokens from each start position, shape (B, T).
    x = torch.stack([data[i : i + block_size] for i in ix])
    # Targets: the same chunks shifted one token to the right, shape (B, T).
    y = torch.stack([data[i + 1 : i + block_size + 1] for i in ix])
    # Move both tensors to the device the model runs on.
    return x.to(device), y.to(device)


# --- Model -------------------------------------------------------------


# Multi-head causal self-attention: each token gathers information from
# itself and earlier tokens.
class SelfAttention(nn.Module):
    # Create the layers used by attention.
    def __init__(self):
        # Initialize nn.Module so parameters are registered.
        super().__init__()
        # One linear layer computes query, key and value for all heads at once.
        self.qkv = nn.Linear(n_embd, 3 * n_embd)
        # Output projection that mixes the results of all heads.
        self.proj = nn.Linear(n_embd, n_embd)
        # Lower-triangular matrix of ones: row t has ones for columns <= t.
        mask = torch.tril(torch.ones(block_size, block_size))
        # Store the mask on the module (moves with .to(device), not trained).
        self.register_buffer('mask', mask)

    # x: (B, T, C) = (batch, time steps, embedding channels).
    def forward(self, x):
        # Read the batch size, sequence length and embedding size.
        B, T, C = x.shape
        # Compute q, k, v and split them along the last dimension.
        q, k, v = self.qkv(x).split(n_embd, dim=2)
        # Split channels into heads: (B, T, C) -> (B, n_head, T, head_size).
        q, k, v = (
            t.view(B, T, n_head, C // n_head).transpose(1, 2) for t in (q, k, v)
        )
        # Scores of how much each token attends to every other token, scaled
        # by sqrt(head_size) to keep softmax stable: (B, n_head, T, T).
        att = q @ k.transpose(-2, -1) / k.size(-1) ** 0.5
        # Causal mask: a token can only look at itself and earlier tokens.
        att = att.masked_fill(self.mask[:T, :T] == 0, float('-inf'))
        # Turn scores into weights that sum to 1 across each row.
        att = F.softmax(att, dim=-1)
        # Weighted sum of values: (B, n_head, T, head_size).
        y = att @ v
        # Merge heads back: (B, n_head, T, head_size) -> (B, T, C).
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        # Mix the heads' outputs with the output projection.
        return self.proj(y)


# Transformer block: attention (tokens communicate), then MLP (each token
# computes on its own).
class Block(nn.Module):
    # Create the sub-layers of one block.
    def __init__(self):
        # Initialize nn.Module so parameters are registered.
        super().__init__()
        # Normalizes each token vector before attention.
        self.ln1 = nn.LayerNorm(n_embd)
        # Self-attention layer.
        self.attn = SelfAttention()
        # Normalizes each token vector before the MLP.
        self.ln2 = nn.LayerNorm(n_embd)
        # Feed-forward network applied to every token independently.
        self.mlp = nn.Sequential(
            # Expand to 4x the embedding size.
            nn.Linear(n_embd, 4 * n_embd),
            # Non-linearity, so the network can learn more than linear maps.
            nn.GELU(),
            # Project back to the embedding size.
            nn.Linear(4 * n_embd, n_embd),
        )

    # x: (B, T, C).
    def forward(self, x):
        # Attention with a residual connection: add the result to the input.
        x = x + self.attn(self.ln1(x))
        # MLP with a residual connection.
        x = x + self.mlp(self.ln2(x))
        # Same shape as the input: (B, T, C).
        return x


# The full language model: token ids in, next-token logits out.
class GPT(nn.Module):
    # Create all layers of the model.
    def __init__(self):
        # Initialize nn.Module so parameters are registered.
        super().__init__()
        # Lookup table: token id -> learned vector of size n_embd.
        self.token_embedding = nn.Embedding(vocab_size, n_embd)
        # Lookup table: position 0..block_size-1 -> learned vector.
        self.position_embedding = nn.Embedding(block_size, n_embd)
        # n_layer Transformer blocks applied one after another.
        self.blocks = nn.Sequential(*[Block() for _ in range(n_layer)])
        # Final normalization after the last block.
        self.ln_f = nn.LayerNorm(n_embd)
        # Maps each token vector to one score (logit) per vocabulary token.
        self.lm_head = nn.Linear(n_embd, vocab_size)

    # idx: token ids (B, T); targets: next-token ids (B, T) or None.
    def forward(self, idx, targets=None):
        # Sequence length of this input.
        T = idx.shape[1]
        # Positions 0, 1, ..., T-1 on the same device as the input.
        pos = torch.arange(T, device=idx.device)
        # Each token's vector = what the token is + where it is: (B, T, C).
        x = self.token_embedding(idx) + self.position_embedding(pos)
        # Run through all Transformer blocks: (B, T, C).
        x = self.blocks(x)
        # Normalize, then score every vocabulary token: (B, T, vocab_size).
        logits = self.lm_head(self.ln_f(x))
        # During generation there are no targets, so no loss.
        if targets is None:
            # Return only the logits.
            return logits, None
        # Flatten (B, T) positions and compare predictions with the targets.
        loss = F.cross_entropy(logits.view(-1, vocab_size), targets.view(-1))
        # Return the logits and the loss to minimize.
        return logits, loss

    # Disable gradient tracking: generation does not train the model.
    @torch.no_grad()
    # Extend idx (B, T) by max_new_tokens sampled tokens.
    def generate(self, idx, max_new_tokens):
        # Produce one new token per iteration.
        for _ in range(max_new_tokens):
            # Feed at most the last block_size tokens (position table limit).
            logits, _ = self(idx[:, -block_size:])
            # Probabilities for the token after the last position only.
            probs = F.softmax(logits[:, -1, :], dim=-1)
            # Randomly pick one token according to those probabilities.
            next_id = torch.multinomial(probs, num_samples=1)
            # Append the picked token to the sequence.
            idx = torch.cat((idx, next_id), dim=1)
        # Return the original tokens plus the generated ones.
        return idx


# --- Training ----------------------------------------------------------


# Disable gradient tracking: evaluation does not update the model.
@torch.no_grad()
# Average loss over several batches, less noisy than a single batch.
def estimate_loss():
    # Switch to evaluation mode.
    model.eval()
    # Holds the mean loss of each split.
    out = {}
    # Evaluate both splits.
    for split in ['train', 'val']:
        # Room for eval_iters loss values.
        losses = torch.zeros(eval_iters)
        # Measure the loss on eval_iters random batches.
        for k in range(eval_iters):
            # Run the model on one batch and keep the loss.
            _, loss = model(*get_batch(split))
            # Store the loss as a plain Python number.
            losses[k] = loss.item()
        # Mean loss of this split.
        out[split] = losses.mean()
    # Switch back to training mode.
    model.train()
    # Return {'train': ..., 'val': ...}.
    return out


# Create the model and move its parameters to the device.
model = GPT().to(device)
# Print the total number of trainable numbers, in millions.
print(f'{sum(p.numel() for p in model.parameters()) / 1e6:.2f}M parameters')
# Print the vocabulary size and the device in use.
print(f'vocab size {vocab_size}, device {device}')

# AdamW optimizer updates every parameter using its gradient.
optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)

# Training loop; the extra final step only evaluates.
for step in range(max_iters + 1):
    # Every eval_interval steps, report progress.
    if step % eval_interval == 0:
        # Measure the current train and validation loss.
        losses = estimate_loss()
        # Print both losses; they should go down as training goes on.
        print(
            f"step {step}: train loss {losses['train']:.4f}, "
            f"val loss {losses['val']:.4f}"
        )
    # Stop after the final evaluation.
    if step == max_iters:
        # Leave the training loop.
        break
    # Forward pass: predict next tokens for a batch and compute the loss.
    _, loss = model(*get_batch('train'))
    # Clear the gradients from the previous step.
    optimizer.zero_grad(set_to_none=True)
    # Backward pass: compute the gradient of the loss for every parameter.
    loss.backward()
    # Update the parameters a small step against their gradients.
    optimizer.step()

# --- Generation --------------------------------------------------------

# Start generation from a single newline character, shape (1, 1).
context = torch.tensor([encode('\n')], device=device)
# Generate 500 characters, convert the ids to text and print it.
print(decode(model.generate(context, max_new_tokens=500)[0].tolist()))
