// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

/// @notice Storage for the Tangle and Reflector Contract
/// @dev This is a Diamond Storage implementation described in EIP-2535.
/// IMPORTANT: If a new Tangle contract needs to be implemented, you MUST
/// change the name in the storagePosition declaration line. This is
/// because the storage contains a mapping which cannot easily be cleared.
/// All external implementations using a Tangle mapping must
/// also be redeployed if Tangle needs to be redeployed (to update storage).
library SLib {

    enum NoReflectCutAction { Add, Remove }
    enum ReflectCutAction { Add, Remove }
    struct S {
        bytes32 initHash;
        address[] noReflects;
        mapping(address => uint) noReflectIndex;
        mapping(address => bool) noReflectExists;
        address[] reflects;
        mapping(address => uint) reflectIndex;
        mapping(address => bool) reflectExists;
    }
    struct NoReflectCut {
        NoReflectCutAction action;
        address address_;
    }
    struct ReflectCut {
        ReflectCutAction action;
        address address_;
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
        PTH[] pths;
        mapping(string => uint) pthIndex;
        mapping(string => bool) pthExists;
        bytes32 initHash;
    }
    struct PTH {
        string signature;
        uint8 forwardNumber;
    }
    /// @notice Records all reflections
    event Reflection(address from_, uint amount);
    /// @notice Records all noReflects changes (addresses whose funds don't
    /// receive reflections
    event NoReflectCut_(NoReflectCut[] noReflectCut);
    /// @notice Records all reflects changes (addresses whose funds are
    /// reflected
    event ReflectCut_(ReflectCut[] reflectCut);

    function getS() internal pure returns (S storage s) {
        string memory id = "Brain.Tangle0.Reflector0";
        bytes32 storagePosition = keccak256(bytes(id));
        assembly {s.slot := storagePosition}
    }

    function getSTangle() internal pure returns (STangle storage s) {
        bytes32 storagePosition = keccak256("Brain.Tangle0");
        assembly {s.slot := storagePosition}
    }

}

/// @title Reflector, reflects tokens from certain addresses to all
/// other addresses
/// @author Brad Brown
/// @notice Reflects tokens from certain addresses to all other
/// addresses
contract Reflector {

    mapping(bytes4 => address) private selectorToAddress;
    address private owner;

    /// @notice Initializes all Reflector variables
    /// @dev Initialization can only run once, when the id is not set to the
    /// hash of the current ValueTransformerTax implementation address
    function initReflector() external {
        SLib.S storage s = SLib.getS();
        bytes32 id = keccak256(abi.encodePacked(selectorToAddress[msg.sig]));
        require(s.initHash != id, "already initialized");
        delete s.noReflects;
        delete s.reflects;
        s.initHash = id;
    }

    /// @notice Reflects all tokens from each address in the reflects list
    /// to everyone except the addresses in the noReflects list
    function reflect() external {
        //require(msg.sender == address(this), "internal");
        SLib.S storage s = SLib.getS();
        SLib.STangle storage sTangle = SLib.getSTangle();
        uint totalNoReflectBalance;
        for (uint i = 0; i < s.noReflects.length; i++) {
            totalNoReflectBalance += sTangle.balanceOf[s.noReflects[i]];
        }
        uint totalReflectBalance;
        for (uint i = 0; i < s.reflects.length; i++) {
            if (sTangle.balanceOf[s.reflects[i]] > 0) {
                totalReflectBalance += sTangle.balanceOf[s.reflects[i]];
                emit SLib.Reflection(s.reflects[i], sTangle.balanceOf[s.reflects[i]] / sTangle.piecesPerUnit);
                sTangle.balanceOf[s.reflects[i]] = 0;
            }
        }
        uint totalSupply = sTangle.totalSupply;
        uint TIP = totalSupply * sTangle.piecesPerUnit - totalNoReflectBalance; // ITP: total included pieces
        uint TUP = TIP - totalReflectBalance; // TUP: total unaffected pieces
        uint newPiecesPerUnit = sTangle.piecesPerUnit * TUP / TIP;
        sTangle.piecesPerUnit = newPiecesPerUnit;
        if (sTangle.piecesPerUnit < 1)
            sTangle.piecesPerUnit = 1;
        for (uint i = 0; i < s.noReflects.length; i++) {
            uint nrBalance = sTangle.balanceOf[s.noReflects[i]];
            sTangle.balanceOf[s.noReflects[i]] = nrBalance * TUP / TIP;
        }
    }

    function addNoReflect(address noReflect) internal {
        SLib.S storage s = SLib.getS();
        bool noReflectExists = s.noReflectExists[noReflect];
        require(!noReflectExists, "noReflect add");
        s.noReflectExists[noReflect] = true;
        s.noReflectIndex[noReflect] = s.noReflects.length;
        s.noReflects.push(noReflect);
    }

    function addReflect(address reflect_) internal {
        SLib.S storage s = SLib.getS();
        bool reflectExists = s.reflectExists[reflect_];
        require(!reflectExists, "reflect add");
        s.reflectExists[reflect_] = true;
        s.reflectIndex[reflect_] = s.reflects.length;
        s.reflects.push(reflect_);
    }

    function removeNoReflect(address noReflect) internal {
        SLib.S storage s = SLib.getS();
        bool noReflectExists = s.noReflectExists[noReflect];
        require(noReflectExists, "noReflect remove");
        address lastNoReflect = s.noReflects[s.noReflects.length - 1];
        if (lastNoReflect != noReflect) {
            s.noReflectIndex[lastNoReflect] = s.noReflectIndex[noReflect];
            s.noReflects[s.noReflectIndex[noReflect]] = lastNoReflect;
        }
        s.noReflects.pop();
        s.noReflectIndex[noReflect] = 0;
        s.noReflectExists[noReflect] = false;
    }

    function removeReflect(address reflect_) internal {
        SLib.S storage s = SLib.getS();
        bool reflectExists = s.reflectExists[reflect_];
        require(reflectExists, "reflect remove");
        address lastReflect = s.noReflects[s.reflects.length - 1];
        if (lastReflect != reflect_) {
            s.reflectIndex[lastReflect] = s.reflectIndex[reflect_];
            s.reflects[s.reflectIndex[reflect_]] = lastReflect;
        }
        s.reflects.pop();
        s.reflectIndex[reflect_] = 0;
        s.reflectExists[reflect_] = false;
    }

    /// @notice Add/remove any number of addresses that won't receive
    /// reflections
    /// @param noReflectCuts NoReflectCut[]
    function noReflectCut(
        SLib.NoReflectCut[] calldata noReflectCuts
    ) external {
        require(msg.sender == owner, "not owner");
        bool changesMade = false;
        for (uint i = 0; i < noReflectCuts.length; i++) {
            SLib.NoReflectCut memory noReflectCut_ = noReflectCuts[i];
            if (noReflectCut_.action == SLib.NoReflectCutAction.Add) {
                addNoReflect(noReflectCut_.address_);
                if (!changesMade) changesMade = true;
            }
            if (noReflectCut_.action == SLib.NoReflectCutAction.Remove) {
                removeNoReflect(noReflectCut_.address_);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.NoReflectCut_(noReflectCuts);
    }

    /// @notice Add/remove any number of addresses whose funds get reflected
    /// @param reflectCuts ReflectCut[]
    function reflectCut(
        SLib.ReflectCut[] calldata reflectCuts
    ) external {
        require(msg.sender == owner, "not owner");
        bool changesMade = false;
        for (uint i = 0; i < reflectCuts.length; i++) {
            SLib.ReflectCut memory reflectCut_ = reflectCuts[i];
            if (reflectCut_.action == SLib.ReflectCutAction.Add) {
                addReflect(reflectCut_.address_);
                if (!changesMade) changesMade = true;
            }
            if (reflectCut_.action == SLib.ReflectCutAction.Remove) {
                removeReflect(reflectCut_.address_);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.ReflectCut_(reflectCuts);
    }

    /// @notice Gets all addresses that don't receive reflections
    /// @return noReflects_ All addresses that don't receive reflections
    function noReflects()
        external
        view
        returns (address[] memory noReflects_)
    {
        return SLib.getS().noReflects;
    }

    /// @notice Gets all addresses whose funds get reflected
    /// @return reflects_ All addresses whose funds are reflected
    function reflects()
        external
        view
        returns (address[] memory reflects_)
    {
        return SLib.getS().reflects;
    }

}
