/**
 * @since 2019-06-20 16:18
 * @author vivaxy
 */
var FileAccessOfComputedAndConstantMembers;
(function (FileAccessOfComputedAndConstantMembers) {
    // constant members
    FileAccessOfComputedAndConstantMembers[FileAccessOfComputedAndConstantMembers["None"] = 0] = "None";
    FileAccessOfComputedAndConstantMembers[FileAccessOfComputedAndConstantMembers["Read"] = 2] = "Read";
    FileAccessOfComputedAndConstantMembers[FileAccessOfComputedAndConstantMembers["Write"] = 4] = "Write";
    FileAccessOfComputedAndConstantMembers[FileAccessOfComputedAndConstantMembers["ReadWrite"] = 6] = "ReadWrite";
    FileAccessOfComputedAndConstantMembers[FileAccessOfComputedAndConstantMembers["All"] = 7] = "All";
    // computed member
    FileAccessOfComputedAndConstantMembers[FileAccessOfComputedAndConstantMembers["G"] = '123'.length] = "G";
    FileAccessOfComputedAndConstantMembers[FileAccessOfComputedAndConstantMembers["H"] = getValue()] = "H";
})(FileAccessOfComputedAndConstantMembers || (FileAccessOfComputedAndConstantMembers = {}));
function getValue() {
    return 0;
}
