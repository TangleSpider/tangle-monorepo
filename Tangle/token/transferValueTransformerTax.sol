// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

/// @notice Storage for the Tangle Contract
/// @dev This is a Diamond Storage implementation described in EIP-2535.
/// IMPORTANT: If a new Tangle contract needs to be implemented, you MUST
/// change the name in the storagePosition declaration line. This is
/// because the storage contains a mapping which cannot easily be cleared.
/// All external implementations using a Tangle mapping must
/// also be redeployed if Tangle needs to be redeployed (to update storage).
library SLib {

    struct S {
        Split[] splits;
        mapping(address => uint) splitIndex;
        bytes32 initHash;
    }
    struct Split {
        address to;
        uint16 numerator;
        uint16 denominator;
    }
    struct STangle {
        string name;
        string symbol;
        uint8 decimals;
        uint totalSupply;
        uint totalPieces;
        uint piecesPerUnit;
        mapping(address => uint) balanceOf;
        mapping(address => mapping(address => uint)) allowance;
        bytes32 initHash;
    }

    function getS() internal pure returns (S storage s) {
        string memory id = "Brain.Tangle.TransferValueTransformerTax";
        bytes32 storagePosition = keccak256(bytes(id));
        assembly {s.slot := storagePosition}
    }

    function getSTangle() internal pure returns (STangle storage s) {
        bytes32 storagePosition = keccak256("Brain.Tangle_0.1");
        assembly {s.slot := storagePosition}
    }

}

/// @title ValueTransformerTax, transforms a Tangle transfer value
/// @author Brad Brown
/// @notice Transforms a Tangle transfer value after the balance of the
/// sender has been deducted, routes taxes
contract TransferValueTransformerTax {

    mapping(bytes4 => address) private selectorToAddress;

    /// @notice Records all transfers
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /// @notice Initializes all ValueTransformerTax variables
    /// @dev Initialization can only run once, when the id is not set to the
    /// hash of the current ValueTransformerTax implementation address
    function initTransferValueTransformerTax() external {
        SLib.S storage s = SLib.getS();
        bytes32 id = keccak256(abi.encodePacked(selectorToAddress[msg.sig]));
        require(s.initHash != id, "already initialized");
        delete s.splits;
        s.splits.push(SLib.Split(address(1),1,100));
        s.initHash = id;
    }

    /// @notice Transforms a Tangle transfer value, routes taxes and
    /// reduces value by each tax amount routed
    /// @param value The value of Tangle being transferred
    /// @return The transformed transfer value
    function transferValueTransformTax(address from, uint value)
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
