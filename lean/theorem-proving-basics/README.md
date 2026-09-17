# Theorem Proving Basics

A minimal [Lean 4](https://lean-lang.org/) project showing how to state
and prove theorems. It uses only Lean core, with no Mathlib.

All proofs are in
[`TheoremProvingBasics.lean`](./TheoremProvingBasics.lean):

1. **Propositions as types**: `p ∧ q → q ∧ p`, proved once as a term and
   once with tactics.
2. **Natural numbers from scratch**: `MyNat` with `add`, proving `add_zero`,
   `zero_add`, `succ_add`, `add_comm` and `add_assoc` by induction.
3. **Lists from scratch**: `MyList` with `append` and `reverse`, proving
   `append_nil`, `append_assoc`, `reverse_append` and `reverse_reverse`.
4. **Automation on built-in `Nat`**: `decide` and `omega` close goals that
   would otherwise need manual proofs.

## Tactics used

| Tactic      | What it does                                                  |
| ----------- | ------------------------------------------------------------- |
| `rfl`       | Closes `a = a`, including when both sides reduce to the same term |
| `intro`     | Moves a hypothesis of `p → q` into the context                |
| `obtain`    | Destructures a hypothesis, e.g. `⟨hp, hq⟩` from `p ∧ q`       |
| `constructor` | Splits a goal like `p ∧ q` into its parts                   |
| `exact`     | Closes the goal with a given term                             |
| `rw`        | Rewrites the goal using an equation                           |
| `induction` | Splits the goal into a base case and an inductive step        |
| `simp`      | Rewrites repeatedly with `@[simp]` lemmas and given equations |
| `decide`    | Evaluates a decidable proposition                             |
| `omega`     | Solves linear arithmetic over `Nat` and `Int`                 |

## Run

```bash
# Install elan, the Lean toolchain manager
curl https://elan.lean-lang.org/elan-init.sh -sSf | sh

# Check every proof (uses the version pinned in lean-toolchain)
lake build
```

`lake build` succeeds only if every proof checks. Break one, e.g. change
`2 ^ 10 = 1024` to `2 ^ 10 = 1023`, and the build fails:

```
error: TheoremProvingBasics.lean:115:42: Tactic `decide` proved that the proposition
  2 ^ 10 = 1023
is false
```
