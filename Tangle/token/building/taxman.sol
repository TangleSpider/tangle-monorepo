// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

/// @notice Storage for the Tangle Contract
/// @dev This is a Diamond Storage implementation described in EIP-2535.
library SLib {

    function getS() internal pure returns (S storage s) {
        string memory id = "Brain.Tangle0.TransferValueTransformerTax0";
        bytes32 storagePosition = keccak256(bytes(id));
        assembly {s.slot := storagePosition}
    }

    function getSTangle() internal pure returns (STangle storage s) {
        bytes32 storagePosition = keccak256("Brain.Tangle0");
        assembly {s.slot := storagePosition}
    }

}

/// @title ValueTransformerTax, transforms a Tangle transfer value
/// @author Brad Brown
/// @notice Transforms a Tangle transfer value after the balance of the
/// sender has been deducted, routes taxes
contract TaxMan {

    /// @notice Transforms a Tangle transfer value, routes taxes and
    /// reduces value by each tax amount routed
    /// @param value The value of Tangle being transferred
    /// @return The transformed transfer value
    function tax(address from, uint value)
        external
        returns (uint)
    {
        require(msg.sender == address(this), "internal");
        uint preTaxValue = value;
        if (value == 0) return value;
        SLib.S storage s = SLib.getS();
        SLib.STangle storage sTangle = SLib.getSTangle();
        for (uint i = 0; i < s.splits.length; i++) {
            SLib.Split memory split = s.splits[i];
            uint numerator = split.numerator;
            uint denominator = split.denominator;
            uint splitAmount = preTaxValue * numerator / denominator;
            sTangle.balanceOf[split.to] += unitsToPieces(splitAmount);
            value -= splitAmount;
            emit Transfer(from, split.to, splitAmount);
        }
        return value;
    }

    function unitsToPieces(uint units) internal view returns (uint) {
        return units * SLib.getSTangle().piecesPerUnit;
    }

}
