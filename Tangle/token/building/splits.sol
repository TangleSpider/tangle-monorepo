// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

/// @notice Splits storage for Tangle
/// @dev This is a Diamond Storage implementation described in EIP-2535.
/// This is in a separate contract with a numbered ID because mappings cannot
/// be cleared. In the event the balances need to be reset, a new Splits
/// contract can be created without needing to redeploy other contracts.
library SLib {

    struct S {
        address[] addresses;
        mapping(address => uint) addressIndex;
        mapping(address => Split) splits;
    }
    struct Split {
        address address_;
        uint16 numerator;
        uint16 denominator;
    }
    /// @notice Records all splitsId changes
    event SplitsIdChange(string splitsId);

    function getS() internal pure returns (S storage s) {
        bytes32 storagePosition = keccak256("Tangle.Splits0");
        assembly { s.slot := storagePosition }
    }

}

/// @title Splits for Tangle
/// @author Brad Brown
/// @notice Stores and provides split information. A split is a tax, or a
/// splitting of each transfer value to go to a certain address.
contract Splits {

    /// @notice Gets all splits and their address, numerator, and denominator
    /// @return All splits and their address, numerator, and denominator
    function splits() external view returns (SLib.Split[] memory) {
        SLib.S storage s = SLib.getS();
        SLib.Split[] memory splits_ = new SLib.Split[](s.addresses.length);
        for (uint i = 0; i < s.addresses.length; i++) {
            splits_[i] = s.splits[s.addresses[i]];
        }
        return splits_;
    }

}
