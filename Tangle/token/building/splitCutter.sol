// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

/// @notice SplitCutter storage for Tangle
/// @dev This is a Diamond Storage implementation described in EIP-2535.
library SLib {

    enum SplitCutAction {Add, Replace, Remove}
    struct S {
        address splitsId;
    }
    struct Split {
        address address_;
        uint16 numerator;
        uint16 denominator;
    }
    struct SplitCut_ {
        SplitCutAction action;
        Split split;
    }
    /// @notice Records all split changes
    event SplitCut(SplitCut_[] splitCuts);

    function getS() internal pure returns (S storage s) {
        bytes32 storagePosition = keccak256("Tangle.SplitCutter");
        assembly { s.slot := storagePosition }
    }
    function getSSplits(string memory id) internal pure returns (S storage s) {
        bytes32 storagePosition = keccak256(bytes(id));
        assembly { s.slot := storagePosition }
    }

}

/// @title SplitCutter for Tangle
/// @author Brad Brown
/// @notice ALlows creation, deletion, and alteration of tax splits.
contract SplitCutter {

    mapping(bytes4 => address) private _0;
    address private owner;

    function addSplit(SLib.Split memory split) internal {
        SLib.S storage s = SLib.getSSplits(SLib.getS().splitsId);
        require(!splitExists(split.address_), "split add");
        s.addressIndex[split.address_] = s.addresses.length;
        s.addresses.push(split.address_);
        s.splits[split.address_] = split;
    }

    function removeSplit(SLib.Split memory split) internal {
        SLib.S storage s = SLib.getSSplits(SLib.getS().splitsId);
        require(splitExists(split.address_), "split remove");
        address lastAddress = s.addresses[s.addresses.length - 1];
        if (lastAddress != split.address_) {
            s.addressIndex[lastAddress] = s.addressIndex[split.address_];
            s.addresses[s.addressIndex[split.address_]] = lastAddress;
        }
        s.addresses.pop();
        s.addressIndex[split.address_] = 0;
        s.splits[split.address_] = SLib.Split(address(0),0,0);
    }

    function replaceSplit(SLib.Split memory split) internal {
        SLib.S storage s = SLib.getSSplits(SLib.getS().splitsId);
        SLib.Split memory currentSplit = s.splits[split.address_];
        bool numsEqual = split.numerator == currentSplit.numerator;
        bool denomsEqual = split.denominator == currentSplit.denominator;
        require(
            splitExists(split.address_) &&
            (!numsEqual || !denomsEqual),
            "split replace"
        );
        s.splits[split.address_] = split;
    }

    function splitExists(address  address_) internal view returns (bool) {
        SLib.S storage s = SLib.getSSplits(SLib.getS().splitsId);
        if (s.addresses.length == 0)
            return false;
        if (
            s.addressIndex[address_] > 0 ||
            s.addresses[0] == address_
        )
            return true;
        return false;
    }

    /// @notice Add/change/remove any number of splits
    /// @param splitCuts Contains the splits and which add/change/remove
    /// action will be used
    function splitCut(SLib.SplitCut_[] calldata splitCuts) external {
        //require(msg.sender == owner, "splitCut");
        bool changesMade = false;
        for (uint i = 0; i < splitCuts.length; i++) {
            SLib.SplitCut_ memory splitCut_ = splitCuts[i];
            SLib.Split memory split = splitCut_.split;
            if (splitCut_.action == SLib.SplitCutAction.Add) {
                addSplit(split);
                if (!changesMade) changesMade = true;
            }
            if (splitCut_.action == SLib.SplitCutAction.Replace) {
                replaceSplit(split);
                if (!changesMade) changesMade = true;
            }
            if (splitCut_.action == SLib.SplitCutAction.Remove) {
                removeSplit(split);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.SplitCut(splitCuts);
    }

    /// @notice Changes the ID of the splits storage used by the SplitCutter
    /// @param splitsId The new balances storage ID
    function changeSplitsId(string memory splitsId) internal {
        SLib.S storage s = SLib.getS();
        s.splitsId = splitsId;
        emit SLib.SplitsIdChange(splitsId);
    }

}
