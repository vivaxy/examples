# Mini Transformer

A minimal character-level language model with self-attention, trained from
scratch in a single file: [`train.py`](train.py) (PyTorch only, every line of
code is commented).

## Run

```bash
uv run train.py
```

`uv` reads the inline dependency block at the top of `train.py` and installs
`torch` automatically. Without `uv`:

```bash
pip install torch
python train.py
```

On an Apple Silicon Mac (MPS) training takes about 1 minute.

## Training data

[`input.txt`](input.txt) is Tiny Shakespeare (~1.1 MB, 65 unique characters),
the dataset used by [char-rnn](https://github.com/karpathy/char-rnn) and
[nanoGPT](https://github.com/karpathy/nanoGPT). Replace it with any plain text
file to train on something else.

## How it works

1. **Tokenize**: every unique character is one token (vocab size 65).
2. **Batch**: sample random chunks of 64 characters; the target is the same
   chunk shifted left by one, so every position learns to predict the next
   character.
3. **Model** (0.82M parameters):
   - token embedding + position embedding
   - 4 Transformer blocks, each:
     `x + SelfAttention(LayerNorm(x))` then `x + MLP(LayerNorm(x))`
   - self-attention: 4 heads, causal mask so a token only sees earlier tokens
   - final LayerNorm + linear layer -> logits over the vocabulary
4. **Train**: cross-entropy loss on next-character prediction, AdamW, 3000
   steps.
5. **Generate**: feed a newline, sample the next character from the softmax
   probabilities, append it, repeat.

## Example output

```
step 0: train loss 4.4192, val loss 4.4112
step 1500: train loss 1.5406, val loss 1.7161
step 3000: train loss 1.3938, val loss 1.6134

BUCKINGHAM:
Ho! Rangard, that is castly
Heirture did furn and given the handlengeness favous.
Thou!

QUEEN MARGARET:
And now the king thy schurbish breath your winged?
```

The initial loss 4.41 is close to ln(65) ≈ 4.17, i.e. random guessing; by the
end the model has learned spelling, word shapes and the play's speaker/line
format.

## Reference

Based on Andrej Karpathy's
[Let's build GPT](https://github.com/karpathy/ng-video-lecture) lecture code.
