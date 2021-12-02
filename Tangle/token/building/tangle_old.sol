// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;


/// @notice Storage for the Tangle Contract
/// @dev This is a Diamond Storage implementation described in EIP-2535.
/// IMPORTANT: If a new Tangle contract needs to be implemented, you MUST
/// change the name in the storagePosition declaration line. This is
/// because the storage contains a mapping which cannot easily be cleared.
/// All external implementations using a Tangle mapping must
/// also be redeployed if Tangle needs to be redeployed (to update storage).
/// PTH stands for Post-Transfer Hook.
library SLib {

    enum PTHCutAction {Add, Remove}
    struct S {
        string name;
        string symbol;
        uint8 decimals;
        uint totalSupply;
        uint totalPieces;
        uint piecesPerUnit;
        mapping(address => uint) balanceOf;
        mapping(address => mapping(address => uint)) allowance;
        PTH[] pths;
        mapping(string => uint) pthIndex;
        mapping(string => bool) pthExists;
        bytes32 initHash;
    }
    /// @dev Post-Transfer Hook structure. Signature is the signature of the
    /// function called by the hook. forwardNumber is a number 0-7 that
    /// indicates which paramters of the transfer are being forwarded in the
    /// call. Bits to parameters
    /// (from most to least significant bit, 1-indexed):
    /// 1-sender, 2-receiver, 3-value. For example, a forwardNumber of 7
    /// indicates that all parameters are sent (in order). A forwardNumber of
    /// 6 indicates that the receiver and value parameters are sent.
    struct PTH {
        string signature;
        uint8 forwardNumber;
    }
    struct PTHCut {
        PTHCutAction action;
        PTH pth;
    }
    /// @notice Records all transfers
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    /// @notice Records all Post-Transfer Hook changes;
    event PTHCut_(PTHCut[] pthCut);
    /// @notice Records all approvals
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

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
    address private owner;

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
        emit SLib.Transfer(address(0), msg.sender, s.totalSupply);
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
        (bool successPre, bytes memory resultPre) = address(this).staticcall(
            abi.encodeWithSignature(
                "transferValueTransformPre(address,uint256)",
                msg.sender,
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
        emit SLib.Transfer(msg.sender, _to, value);
        executePostTransferHooks(msg.sender, _to, value);
        return true;
    }

    /// @notice Transfers Tangle from one holder to another, may implement a
    /// variable number of taxes and may modify the amount transferred. Can be
    /// initiated by an approved 3rd party
    /// @dev Modifies the value transferred according to the ValueTransformer,
    /// an external implementation.
    /// @param _from The address Tangle will be sent from
    /// @param _to The address Tangle will be sent to
    /// @param value The amount of Tangle sent
    /// @return Whether or not the transfer was successful
    function transferFrom(address _from, address _to, uint value)
        external
        returns
    (bool) {
        (bool successPre, bytes memory resultPre) = address(this).staticcall(
            abi.encodeWithSignature(
                "transferValueTransformPre(address,uint256)",
                _from,
                value
            )
        );
        if (successPre) value = uint(bytes32(resultPre));
        SLib.S storage s = SLib.getS();
        s.allowance[_from][_to] -= value;
        s.balanceOf[_from] -= unitsToPieces(value);
        (bool successTax, bytes memory resultTax) = address(this).call(
            abi.encodeWithSignature(
                "transferValueTransformTax(address,uint256)",
                _from,
                value
            )
        );
        if (successTax) value = uint(bytes32(resultTax));
        s.balanceOf[_to] += unitsToPieces(value);
        emit SLib.Transfer(_from, _to, value);
        executePostTransferHooks(_from, _to, value);
        return true;
    }

    /// @notice Approves a spender to spend an amount of Tangle
    /// @param _spender The address of the spender
    /// @param _value The amount that the spender can spend
    /// @return Whether or not the approval was successful
    function approve(address _spender, uint _value) external returns (bool) {
        SLib.S storage s = SLib.getS();
        s.allowance[msg.sender][_spender] = _value;
        emit SLib.Approval(msg.sender, _spender, _value);
        return true;
    }

    function unitsToPieces(uint units) internal view returns (uint) {
        return units * SLib.getS().piecesPerUnit;
    }

    function piecesToUnits(uint pieces) internal view returns (uint) {
        return pieces / SLib.getS().piecesPerUnit;
    }

    function addPTH(SLib.PTH memory pth) internal {
        SLib.S storage s = SLib.getS();
        bool pthExists = s.pthExists[pth.signature];
        require(!pthExists, "pth add");
        s.pthExists[pth.signature] = true;
        s.pthIndex[pth.signature] = s.pths.length;
        s.pths.push(pth);
    }

    function removePTH(SLib.PTH memory pth) internal {
        SLib.S storage s = SLib.getS();
        bool pthExists = s.pthExists[pth.signature];
        require(pthExists, "pth remove");
        SLib.PTH memory lastPTH = s.pths[s.pths.length - 1];
        bytes32 lastPTHSigHash = keccak256(bytes(lastPTH.signature));
        bytes32 pthSigHash = keccak256(bytes(pth.signature));
        if (lastPTHSigHash != pthSigHash) {
            s.pthIndex[lastPTH.signature] = s.pthIndex[pth.signature];
            s.pths[s.pthIndex[pth.signature]] = lastPTH;
        }
        s.pths.pop();
        s.pthIndex[pth.signature] = 0;
        s.pthExists[pth.signature] = false;
    }

    /// @notice Add/replace/remove any number of Post-Transfer Hooks
    /// @param pthCuts_ Contains an array of Post-Transfer Hook cuts
    function pthCut(SLib.PTHCut[] calldata pthCuts_) external {
        require(msg.sender == owner, "not owner");
        bool changesMade = false;
        for (uint i = 0; i < pthCuts_.length; i++) {
            SLib.PTHCut memory pthCut_ = pthCuts_[i];
            SLib.PTH memory pth = pthCut_.pth;
            if (pthCut_.action == SLib.PTHCutAction.Add) {
                addPTH(pth);
                if (!changesMade) changesMade = true;
            }
            if (pthCut_.action == SLib.PTHCutAction.Remove) {
                removePTH(pth);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.PTHCut_(pthCuts_);
    }

    /// @notice Gets all pths and their signature and forwardNumber
    /// @return All pths and their signature and forwardNumber
    function pths() external view returns (SLib.PTH[] memory) {
        SLib.S storage s = SLib.getS();
        return s.pths;
    }

    /// @notice Executes all Post-Transfer Hooks.
    /// @param sender The sender of the transfer
    /// @param receiver The receiver of the transfer
    /// @param value The value of the transfer
    function executePostTransferHooks(
        address sender,
        address receiver,
        uint value
    ) internal {
        SLib.S storage s = SLib.getS();
        for (uint i = 0; i < s.pths.length; i++) {
            SLib.PTH memory pth = s.pths[i];
            uint forwardNumber = pth.forwardNumber;
            string memory sig = pth.signature;
            assembly {
                let len := 0x4
                let ptr := mload(0x40)
                mstore(ptr, keccak256(add(sig, 0x20), mload(sig)))
                if and(forwardNumber, 1) {
                    mstore(add(ptr, len), sender)
                    len := add(len, 0x20)
                }
                if and(forwardNumber, 2) {
                    mstore(add(ptr, len), receiver)
                    len := add(len, 0x20)
                }
                if and(forwardNumber, 4) {
                    mstore(add(ptr, len), value)
                    len := add(len, 0x20)
                }
                mstore(0x40, add(ptr, len))
                let result := call(gas(), address(), 0, ptr, len, 0, 0)
                returndatacopy(0, 0, returndatasize())
                switch result
                    case 0 {}
                    default {}
            }
        }
    }

}
