/-
# Theorem Proving Basics

Every `theorem` below is checked by the Lean kernel during `lake build`.
If a proof is wrong, the build fails.
-/

/-! ## 1. Propositions as types

A proof of `p ∧ q → q ∧ p` is a function that turns a proof of `p ∧ q`
into a proof of `q ∧ p`. -/

-- Term-mode proof: write the function directly.
theorem and_swap (p q : Prop) : p ∧ q → q ∧ p :=
  fun ⟨hp, hq⟩ => ⟨hq, hp⟩

-- Tactic-mode proof: build the same term step by step.
theorem and_swap' (p q : Prop) : p ∧ q → q ∧ p := by
  intro h
  obtain ⟨hp, hq⟩ := h
  constructor
  · exact hq
  · exact hp

/-! ## 2. Natural numbers from scratch -/

inductive MyNat where
  | zero : MyNat
  | succ : MyNat → MyNat

namespace MyNat

-- Recursion on the second argument.
def add : MyNat → MyNat → MyNat
  | n, zero => n
  | n, succ m => succ (add n m)

instance : Add MyNat := ⟨add⟩
instance : OfNat MyNat 0 := ⟨zero⟩

@[simp] theorem add_zero_def (n : MyNat) : n + zero = n := rfl
@[simp] theorem add_succ_def (n m : MyNat) : n + succ m = succ (n + m) := rfl

-- Holds by definition: `add` recurses on the second argument.
theorem add_zero (n : MyNat) : n + 0 = n := rfl

-- Not definitional: needs induction on `n`.
theorem zero_add (n : MyNat) : 0 + n = n := by
  induction n with
  | zero => rfl
  | succ n ih => rw [add_succ_def, ih]

theorem succ_add (n m : MyNat) : succ n + m = succ (n + m) := by
  induction m with
  | zero => rfl
  | succ m ih => rw [add_succ_def, add_succ_def, ih]

theorem add_comm (n m : MyNat) : n + m = m + n := by
  induction m with
  | zero => rw [add_zero_def]; exact (zero_add n).symm
  | succ m ih => rw [add_succ_def, succ_add, ih]

theorem add_assoc (a b c : MyNat) : a + b + c = a + (b + c) := by
  induction c with
  | zero => rfl
  | succ c ih => simp only [add_succ_def, ih]

end MyNat

/-! ## 3. Lists from scratch -/

inductive MyList (α : Type) where
  | nil : MyList α
  | cons : α → MyList α → MyList α

namespace MyList

variable {α : Type}

def append : MyList α → MyList α → MyList α
  | nil, ys => ys
  | cons x xs, ys => cons x (append xs ys)

def reverse : MyList α → MyList α
  | nil => nil
  | cons x xs => append (reverse xs) (cons x nil)

@[simp] theorem append_nil (xs : MyList α) : append xs nil = xs := by
  induction xs with
  | nil => rfl
  | cons x xs ih => simp [append, ih]

@[simp] theorem append_assoc (xs ys zs : MyList α) :
    append (append xs ys) zs = append xs (append ys zs) := by
  induction xs with
  | nil => rfl
  | cons x xs ih => simp [append, ih]

theorem reverse_append (xs ys : MyList α) :
    reverse (append xs ys) = append (reverse ys) (reverse xs) := by
  induction xs with
  | nil => simp [append, reverse]
  | cons x xs ih => simp [append, reverse, ih]

theorem reverse_reverse (xs : MyList α) : reverse (reverse xs) = xs := by
  induction xs with
  | nil => rfl
  | cons x xs ih => simp [reverse, reverse_append, ih, append]

end MyList

/-! ## 4. Automation on the built-in `Nat` -/

-- `decide` evaluates a decidable proposition.
theorem two_pow_ten : 2 ^ 10 = 1024 := by decide

-- `omega` solves linear arithmetic over `Nat` and `Int`.
theorem lt_of_add_lt (a b c : Nat) (h : a + b < c) : a < c := by omega
