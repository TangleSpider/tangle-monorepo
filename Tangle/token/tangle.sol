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
        bytes32 storagePosition = keccak256("Brain.Tangle0");
        assembly {s.slot := storagePosition}
    }

}

/// @title Tangle, the Self-Marketing Token
/// @author Brad Brown
/// @notice This is an infinitely upgradeable token which incentivizes users
/// to promote its own attractiveness
contract Tangle {

    mapping(bytes4 => address) private selectorToAddress;

    /// @notice Records all transfers
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    /// @notice Records all approvals
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    /// @notice Initializes all Tangle variables
    /// @dev Initialization can only run once, when the id is not set to the
    /// hash of the current Tangle implementation address
    function initTangle() external {
        SLib.S storage s = SLib.getS();
        bytes32 id = keccak256(abi.encodePacked(selectorToAddress[msg.sig]));
        require(s.initHash != id, "already initialized");
        s.name = "Tangle";
        s.symbol = "TNGL";
        s.decimals = 9;
        s.totalSupply = 1e18;
        uint uintMax = type(uint128).max;
        s.totalPieces = uintMax - (uintMax % s.totalSupply);
        s.piecesPerUnit = s.totalPieces / s.totalSupply;
        s.balanceOf[msg.sender] = unitsToPieces(s.totalSupply);
        emit Transfer(address(0), msg.sender, s.totalSupply);
        s.initHash = id;
    }

    /// @notice Returns the name of the Tangle token
    /// @return The name of the Tangle token (ex. "Tangle")
    function name() external view returns (string memory) {
        return SLib.getS().name;
    }

    /// @notice Returns the symbol of the Tangle token
    /// @return The symbol of the Tangle token (ex. "TNGL")
    function symbol() external view returns (string memory) {
        return SLib.getS().symbol;
    }

    /// @notice Returns the decimals of the Tangle token
    /// @return The decimals of the Tangle token (ex. 9)
    function decimals() external view returns (uint8) {
        return SLib.getS().decimals;
    }

    /// @notice Returns the total supply of the Tangle token
    /// @return The total supply of the Tangle token
    /// (ex. 1,000,000,000.000000000)
    function totalSupply() external view returns (uint) {
        return SLib.getS().totalSupply;
    }

    /// @notice Returns the balance of a Tangle token holder
    /// @param _owner The Tangle token holder's address
    /// @return The balance of a holder
    function balanceOf(address _owner) external view returns (uint) {
        return piecesToUnits(SLib.getS().balanceOf[_owner]);
    }

    /// @notice Returns the amount of a Tangle holder's Tangle a spender is
    /// allowed to spend
    /// @param _owner The Tangle token holder's address
    /// @param _spender The spender's address
    /// @return The amount that can be spent
    function allowance(address _owner, address _spender)
        external
        view
        returns
        (uint)
    {
        return SLib.getS().allowance[_owner][_spender];
    }

    /// @notice Transfers Tangle from one holder to another, may implement a
    /// variable number of taxes and may modify the amount transferred
    /// @dev Modifies the value transferred according to the pre and tax
    /// ValueTransformers (external implementations)
    /// @param _to The address Tangle will be sent to
    /// @param value The amount of Tangle sent
    /// @return Whether or not the transfer was successful
    function transfer(address _to, uint value) external returns (bool) {
        (bool successPre, bytes memory resultPre) = address(this).staticcall(     // figure out how to compress this pattern after contract is mostly complete
            abi.encodeWithSignature(
                "transferValueTransformPre(address,uint256)",
                _to,
                value
            )
        );
        if (successPre) value = uint(bytes32(resultPre));
        SLib.S storage s = SLib.getS();
        s.balanceOf[msg.sender] -= unitsToPieces(value);
        (bool successTax, bytes memory resultTax) = address(this).call(
            abi.encodeWithSignature(
                "transferValueTransformTax(address,uint256)",
                msg.sender,
                value
            )
        );
        if (successTax) value = uint(bytes32(resultTax));
        s.balanceOf[_to] += unitsToPieces(value);
        emit Transfer(msg.sender, _to, value);
        return true;
    }

    /// @notice Transfers Tangle from one holder to another, may implement a
    /// variable number of taxes and may modify the amount transferred. Can be
    /// initiated by an approved 3rd party
    /// @dev Modifies the value transferred according to the ValueTransformer,
    /// an external implementation
    /// @param _from The address Tangle will be sent from
    /// @param _to The address Tangle will be sent to
    /// @param value The amount of Tangle sent
    /// @return Whether or not the transfer was successful
    function transferFrom(address _from, address _to, uint value)
        external
        returns
    (bool) {
        (bool success, bytes memory result) = address(this).staticcall(
            abi.encodeWithSignature(
                "valueTransform(bytes)",
                _to,
                value
            )
        );
        require(success, "staticdelegate failed");
        value = uint(bytes32(result));
        SLib.S storage s = SLib.getS();
        s.allowance[_from][_to] -= value;
        s.balanceOf[_from] -= unitsToPieces(value);
        (bool successTax, bytes memory resultTax) = address(this).call(
            abi.encodeWithSignature(
                "transferValueTransformTax(address,uint256)",
                msg.sender,
                value
            )
        );
        if (successTax) value = uint(bytes32(resultTax));
        s.balanceOf[_to] += unitsToPieces(value);
        emit Transfer(_from, _to, value);
        return true;
    }

    /// @notice Approves a spender to spend an amount of Tangle
    /// @param _spender The address of the spender
    /// @param _value The amount that the spender can spend
    /// @return Whether or not the approval was successful
    function approve(address _spender, uint _value) external returns (bool) {
        SLib.S storage s = SLib.getS();
        s.allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function unitsToPieces(uint units) internal view returns (uint) {
        return units * SLib.getS().piecesPerUnit;
    }

    function piecesToUnits(uint pieces) internal view returns (uint) {
        return pieces / SLib.getS().piecesPerUnit;
    }

}
