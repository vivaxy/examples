enum FileAccessOfComputedAndConstantMembers {
  // constant members
  None,
  Read = 1 << 1,
  Write = 1 << 2,
  ReadWrite = Read | Write,
  All,
  // computed member
  G = '123'.length,
  H = getValue(),
}

function getValue() {
  return 0;
}
