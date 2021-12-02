// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

/// @notice Farms storage for Tangle
/// @dev This is a Diamond Storage implementation described in EIP-2535.
library SLib {

    enum BlacklistCutAction { Add, Remove }
    struct S {
        address[] blacklist;
        mapping(address => uint) blacklistIndex;
        uint cropDustAmount;
    }
    struct SInfo {
        string _0;
        string _1;
        uint8 _2;
        uint _3;
        uint piecesPerUnit;
    }
    struct SFarms {
        address liquidityAddress;
        uint wc;
        uint last;
        string[] names;
        mapping(string => uint) nameIndex;
        mapping(string => Farm) farms;
        mapping(address => mapping(string => uint)) points;
        mapping(address => mapping(string => uint)) rewards;
        mapping(address => mapping(string => uint)) wcInits;
        mapping(address => mapping(string => uint)) propSumInits;
    }
    struct Farm {
        uint C;
        uint N;
        uint D;
        uint max;
        uint last;
        uint start;
        uint elapsed;
        uint propSum;
        uint points;
        string name;
    }
    struct SBalances {
        mapping(address => uint) balances;
        bool _0;
    }
    struct BlacklistCut_ {
        BlacklistCutAction action;
        address address_;
    }
    /// @notice Records all airdropping point changes
    event AirdroppingPointChange(address from_, uint amount);
    /// @notice Records all blacklist changes
    event BlacklistCut(BlacklistCut_[] blacklistCuts);
    /// @notice Records all transfers
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    function getS() internal pure returns (S storage s) {
        bytes32 storagePosition = keccak256("Tangle.Airdropping0");
        assembly {s.slot := storagePosition}
    }

    function getSInfo() internal pure returns (SInfo storage s) {
        bytes32 storagePosition = keccak256("Tangle.Info");
        assembly { s.slot := storagePosition }
    }

    function getSFarms(
        string memory id
    ) internal pure returns (SFarms storage s) {
        bytes32 storagePosition = keccak256(bytes(id));
        assembly { s.slot := storagePosition }
    }

    function getSBalances(
        string memory id
    ) internal pure returns (SBalances storage s) {
        bytes32 storagePosition = keccak256(bytes(id));
        assembly { s.slot := storagePosition }
    }

}

/// @title Airdropping, handles airdropping interactions and provides
/// airdropping position details
/// @author Brad Brown
/// @notice Gives airdropping info and handles airdropping interactions
contract Airdropping {

    mapping(bytes4 => address) private _0;
    address private owner;

    function getMappingId(string memory name)
        internal
        view
        returns (string memory id)
    {
        (bool success, bytes memory result) = address(this).staticcall(
            abi.encodeWithSignature(
                "getId(string)",
                name
            )
        );
        require(success, "getMappingId staticdelegate");
        assembly { id := add(result, 0x40) }
    }



    /// @notice Transfers a constant amount of Tangle set by owner to each address
    /// in a list of addresses
    /// @param addresses A list of addresses
    function cropDust(address[] memory addresses) external {
        SLib.S storage s = SLib.getS();
        SLib.SBalances storage sBalances = SLib.getSBalances(getMappingId("balances"));
        uint viableAddresses = addresses.length;
        for (uint i = 0; i < addresses.length; i++) {
            if (sBalances.balances[addresses[i]] > 0) {
                viableAddresses--;
                continue;
            }
            sBalances.balances[addresses[i]] += unitsToPieces(s.cropDustAmount);
            emit SLib.Transfer(msg.sender, addresses[i], s.cropDustAmount);
        }
        sBalances.balances[msg.sender] -= unitsToPieces(s.cropDustAmount) * viableAddresses;
        _addAirdroppingPoints(msg.sender, viableAddresses);
    }

    /// @notice Adds airdropping points to an address, internal only
    /// @param address_ The address receiving airdropping points
    /// @param amount The amount of points to be added
    function addAirdroppingPoints(address address_, uint amount) external {
        require(msg.sender == address(this), "internal");
        _addAirdroppingPoints(address_, amount);
    }

    function _addAirdroppingPoints(address address_, uint amount) internal {
        if (addressExists(address_)) return;
        SLib.SFarms storage sFarms = SLib.getSFarms(getMappingId("farms"));
        SLib.Farm storage farm = sFarms.farms["airdropping"];
        if (farm.start == 0) farm.start = block.timestamp;
        uint rewards = _availableRewards(address_, "airdropping");
        if (rewards > 0)
            sFarms.rewards[address_]["airdropping"] = rewards;
        sFarms.propSumInits[address_]["airdropping"] = farm.propSum;
        sFarms.wcInits[address_]["airdropping"] = sFarms.wc;
        sFarms.points[address_]["airdropping"] += amount;
        farm.points += amount;
    }

    function _availableRewards(
        address address_,
        string memory name
    ) internal view returns (uint) {
        SLib.SBalances storage sBalances = SLib.getSBalances(getMappingId("balances"));
        SLib.SFarms storage sFarms = SLib.getSFarms(getMappingId("farms"));
        SLib.Farm memory farm = sFarms.farms[name];
        if (farm.D == 0) return 0;
        farm.max += (sBalances.balances[address(this)] - sFarms.last) * farm.N / farm.D;
        uint _wc = sFarms.wc;
        uint _propSum = farm.propSum;
        uint d = block.timestamp - farm.start + farm.C - farm.elapsed;
        if (d == 0) return 0;
        uint add = farm.max - (farm.max - farm.last) * farm.C / d - farm.last;
        if (farm.points != 0) {
            while (add > 0 && add * _wc / farm.points < 1e9) {
                _wc *= 2;
                _propSum *= 2;
            }
            _propSum += add * _wc / farm.points;
        }
        if (sFarms.wcInits[address_][name] == 0 || _wc == 0) return 0;
        uint available = sFarms.rewards[address_][name] + sFarms.points[address_][name] * (_propSum - sFarms.propSumInits[address_][name] * _wc / sFarms.wcInits[address_][name]) / _wc;
        return available;
    }

    function _distribute(
        string memory name
    ) internal {
        SLib.SBalances storage sBalances = SLib.getSBalances(getMappingId("balances"));
        SLib.SFarms storage sFarms = SLib.getSFarms(getMappingId("farms"));
        SLib.Farm storage farm = sFarms.farms[name];
        if (sBalances.balances[address(this)] != sFarms.last) {
            for (uint i = 0; i < sFarms.names.length; i++) {
                SLib.Farm storage farm_ = sFarms.farms[sFarms.names[i]];
                if (farm_.D == 0) continue;
                farm_.max += (sBalances.balances[address(this)] - sFarms.last) * farm_.N / farm_.D;
            }
            sFarms.last = sBalances.balances[address(this)];
        }
        uint d = block.timestamp - farm.start + farm.C - farm.elapsed;
        if (d == 0) return;
        uint rewardTheoretical = farm.max - (farm.max - farm.last) * farm.C / d;
        uint add = rewardTheoretical - farm.last;
        if (farm.points != 0) {
            while (add > 0 && add * sFarms.wc / farm.points < 1e9) {
                sFarms.wc *= 2;
                for (uint i = 0; i < sFarms.names.length; i++)
                    sFarms.farms[sFarms.names[i]].propSum *= 2;
            }
            farm.propSum += add * sFarms.wc / farm.points;
        }
        farm.last = rewardTheoretical;
        farm.elapsed = block.timestamp - farm.start;
    }

    function unitsToPieces(uint units) internal view returns (uint) {
        return units * SLib.getSInfo().piecesPerUnit;
    }

    function piecesToUnits(uint pieces) internal view returns (uint) {
        return pieces / SLib.getSInfo().piecesPerUnit;
    }

    function addAddress(address address_) internal {
        SLib.S storage s = SLib.getS();
        require(!addressExists(address_), "address add");
        s.blacklistIndex[address_] = s.blacklist.length;
        s.blacklist.push(address_);
    }

    function removeAddress(address address_) internal {
        SLib.S storage s = SLib.getS();
        require(addressExists(address_), "address remove");
        address lastAddress = s.blacklist[s.blacklist.length - 1];
        if (lastAddress != address_) {
            s.blacklistIndex[lastAddress] = s.blacklistIndex[address_];
            s.blacklist[s.blacklistIndex[address_]] = lastAddress;
        }
        s.blacklist.pop();
        s.blacklistIndex[address_] = 0;
    }

    function addressExists(address address_) internal view returns (bool) {
        SLib.S storage s = SLib.getS();
        if (s.blacklist.length == 0)
            return false;
        if (s.blacklistIndex[address_] > 0 || s.blacklist[0] == address_)
            return true;
        return false;
    }

    /// @notice Add/remove any number of addresses who are blacklisted
    /// from receiving airdropping rewards
    /// @param blacklistCuts BlacklistCut_[]
    function blacklistCut(
        SLib.BlacklistCut_[] calldata blacklistCuts
    ) external {
        require(msg.sender == owner, "not owner");
        bool changesMade = false;
        for (uint i = 0; i < blacklistCuts.length; i++) {
            SLib.BlacklistCut_ memory blacklistCut_ = blacklistCuts[i];
            if (blacklistCut_.action == SLib.BlacklistCutAction.Add) {
                addAddress(blacklistCut_.address_);
                if (!changesMade) changesMade = true;
            }
            if (blacklistCut_.action == SLib.BlacklistCutAction.Remove) {
                removeAddress(blacklistCut_.address_);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.BlacklistCut(blacklistCuts);
    }

    /// @notice Gets all addresses are blacklisted
    /// from receiving airdropping rewards
    /// @return blacklist_ All addresses that are blacklisted
    /// from receiving airdropping rewards
    function blacklist()
        external
        view
        returns (address[] memory blacklist_)
    {
        return SLib.getS().blacklist;
    }

    function changeCropDustAmount(uint newCropDustAmount) external {
        require(msg.sender == owner, "owner");
        SLib.getS().cropDustAmount = newCropDustAmount;
    }

}
