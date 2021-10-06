// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

/// @notice Storage for the Tangle Contract
/// @dev This is a Diamond Storage implementation described in EIP-2535
library SLib {

    struct S {
        uint minHoldAmount;
        bytes32 initHash;
    }

    function getS() internal pure returns (S storage s) {
        bytes32 storagePosition = keccak256("Brain.Tangle.ValueTransformer");
        assembly {s.slot := storagePosition}
    }

}

/// @title ValueTransformer, transforms a Tangle transfer value
/// @author Brad Brown
/// @notice Transforms a Tangle transfer value
contract ValueTransformer {

    mapping(bytes4 => address) private selectorToAddress;

    /// @notice Initializes all ValueTransformer variables
    /// @dev Initialization can only run once, when the id is not set to the
    /// hash of the current ValueTransformer implementation address
    function initValueTransformer() external {
        SLib.S storage s = SLib.getS();
        bytes32 id = keccak256(abi.encodePacked(selectorToAddress[msg.sig]));
        require(s.initHash != id, "already initialized");
        s.minHoldAmount = 1;
        s.initHash = id;
    }

    /// @notice Transforms a Tangle transfer value, ensures that a transfer
    /// cannot leave a holder's balance below 0.000000001 Tangle
    /// @param owner The address the Tangle is being transferred from
    /// @param value The amount of Tangle being transferred
    /// @return The transformed transfer value
    function valueTransform(address owner, uint value)
        external
        view
        returns (uint)
    {
        (bool success, bytes memory result) = address(this).staticcall(
            abi.encodeWithSignature(
                "balanceOf(address)",
                owner
            )
        );
        require(success, "staticdelegate failed");
        uint balance = uint(bytes32(result));
        if (value > balance) revert();
        uint minHoldAmount = SLib.getS().minHoldAmount;
        if (balance - value < minHoldAmount)
            value = balance - minHoldAmount;
        return value;
    }

}
