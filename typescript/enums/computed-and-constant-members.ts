/**
 * @since 2019-06-20 16:18
 * @author vivaxy
 */
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
