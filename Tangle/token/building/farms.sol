// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface ERC20 {
    function transfer(address _to, uint value) external returns (bool);
    function transferFrom(address _from, address _to, uint value)
        external
        returns (bool);
}

/// @notice Farms storage for Tangle
/// @dev This is a Diamond Storage implementation described in EIP-2535.
library SLib {

    enum FarmCutAction {Add, Replace, Remove}
    struct S {
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
    struct FarmCut_ {
        FarmCutAction action;
        Farm farm;
    }
    struct SInfo {
        string _0;
        string _1;
        uint8 _2;
        uint _3;
        uint piecesPerUnit;
    }
    struct SBalances {
        mapping(address => uint) balances;
        bool _0;
    }
    /// @notice Records all farm changes
    event FarmCut(FarmCut_[] farmCuts);

    function getS() internal pure returns (S storage s) {
        bytes32 storagePosition = keccak256("Tangle.Farms7");
        assembly { s.slot := storagePosition }
    }

    function getSBalances(
        string memory id
    ) internal pure returns (SBalances storage s) {
        bytes32 storagePosition = keccak256(bytes(id));
        assembly { s.slot := storagePosition }
    }

    function getSInfo() internal pure returns (SInfo storage s) {
        bytes32 storagePosition = keccak256("Tangle.Info");
        assembly { s.slot := storagePosition }
    }

}

/// @title Farms, stores Tangle farm information, provides
/// farm reward withdrawals, and provides information on farms
/// @author Brad Brown
/// @notice Gives farm information, reward withdrawal access,
/// reward estimation, controls farm parameters, and stores
/// farm data.
contract Farms {

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

    function _availableRewards(
        address address_,
        string memory name
    ) internal view returns (uint) {
        SLib.SBalances storage sBalances = SLib.getSBalances(getMappingId("balances"));
        SLib.S storage s = SLib.getS();
        SLib.Farm memory farm = s.farms[name];
        if (farm.D == 0) return 0;
        farm.max += (sBalances.balances[address(this)] - s.last) * farm.N / farm.D;
        uint _wc = s.wc;
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
        if (s.wcInits[address_][name] == 0 || _wc == 0) return 0;
        uint available = s.rewards[address_][name] + s.points[address_][name] * (_propSum - s.propSumInits[address_][name] * _wc / s.wcInits[address_][name]) / _wc;
        return available;
    }

    function _distribute(
        string memory name
    ) internal {
        SLib.SBalances storage sBalances = SLib.getSBalances(getMappingId("balances"));
        SLib.S storage s = SLib.getS();
        SLib.Farm storage farm = s.farms[name];
        if (sBalances.balances[address(this)] != s.last) {
            for (uint i = 0; i < s.names.length; i++) {
                SLib.Farm storage farm_ = s.farms[s.names[i]];
                if (farm_.D == 0) continue;
                farm_.max += (sBalances.balances[address(this)] - s.last) * farm_.N / farm_.D;
            }
            s.last = sBalances.balances[address(this)];
        }
        uint d = block.timestamp - farm.start + farm.C - farm.elapsed;
        if (d == 0) return;
        uint rewardTheoretical = farm.max - (farm.max - farm.last) * farm.C / d;
        uint add = rewardTheoretical - farm.last;
        if (farm.points != 0) {
            while (add > 0 && add * s.wc / farm.points < 1e9) {
                s.wc *= 2;
                for (uint i = 0; i < s.names.length; i++)
                    s.farms[s.names[i]].propSum *= 2;
            }
            farm.propSum += add * s.wc / farm.points;
        }
        farm.last = rewardTheoretical;
        farm.elapsed = block.timestamp - farm.start;
    }

    /// @notice Gets all available rewards from all farms
    /// @param address_ The address whose rewards info will be returned
    /// @return Each individual farm's rewards and the combined total rewards
    function availableRewards(
        address address_
    ) external view returns (string[] memory, uint[] memory) {
        SLib.S storage s = SLib.getS();
        uint[] memory rewards = new uint[](s.names.length + 1);
        uint totalRewards = 0;
        for (uint i = 0; i < s.names.length; i++) {
            rewards[i] = piecesToUnits(_availableRewards(address_, s.names[i]));
            totalRewards += rewards[i];
        }
        rewards[s.names.length] = totalRewards;
        return (s.names, rewards);
    }

    /// @notice Gets available rewards from one specifc farm
    /// @param address_ The address whose reward info will be returned
    /// @param name The name of the farm whose rewards will be returned
    /// @return The specified addresses' available rewards from the specified
    /// farm
    function availableRewards(
        address address_,
        string memory name
    ) external view returns (uint) {
        return piecesToUnits(_availableRewards(address_, name));
    }


    function _withdrawRewards(
        address _address,
        string memory name
    ) internal {
        SLib.S storage s = SLib.getS();
        SLib.Farm storage farm = s.farms[name];
        _distribute(name);
        if (s.wcInits[_address][name] == 0 || s.wc == 0) return;
        uint available = s.rewards[_address][name] + s.points[_address][name] * (farm.propSum - s.propSumInits[_address][name] * s.wc / s.wcInits[_address][name]) / s.wc;
        s.rewards[_address][farm.name] = 0;
        s.propSumInits[_address][farm.name] = farm.propSum;
        s.wcInits[_address][farm.name] = s.wc;
        s.last -= available;
        transfer(_address, piecesToUnits(available));
    }

    /// @notice Withdraw rewards from all yield farms for an address
    /// @param _address The address whose rewards will be withdrawn
    function withdrawRewards(address _address) external {
        SLib.S storage s = SLib.getS();
        for (uint i = 0; i < s.names.length; i++) {
            _withdrawRewards(_address, s.names[i]);
        }
    }

    /// @notice Withdraw rewards from a specific yield farm for an address
    /// @param _address The address whose rewards will be withdrawn
    /// @param name The farm the rewards will be withdrawn from
    function withdrawRewards(
        address _address,
        string memory name
    ) external {
        _withdrawRewards(_address, name);
    }

    /// @notice Withdraw rewards from a list of specified yield farms
    /// for an address
    /// @param _address The address whose rewards will be withdrawn
    /// @param names The farms the rewards will be withdrawn from
    function withdrawRewards(
        address _address,
        string[] memory names
    ) external {
        for (uint i = 0; i < names.length; i++)
            _withdrawRewards(_address, names[i]);
    }

    function addFarm(SLib.Farm memory farm) internal {
        SLib.S storage s = SLib.getS();
        require(!farmExists(farm.name), "farm add");
        s.nameIndex[farm.name] = s.names.length;
        s.names.push(farm.name);
        s.farms[farm.name] = farm;
    }

    function removeFarm(SLib.Farm memory farm) internal {
        SLib.S storage s = SLib.getS();
        require(farmExists(farm.name), "farm remove");
        string memory lastName = s.names[s.names.length - 1];
        bytes32 lastNameBytes = keccak256(bytes(lastName));
        bytes32 nameBytes = keccak256(bytes(farm.name));
        if (lastNameBytes != nameBytes) {
            s.nameIndex[lastName] = s.nameIndex[farm.name];
            s.names[s.nameIndex[farm.name]] = lastName;
        }
        s.names.pop();
        s.nameIndex[farm.name] = 0;
        SLib.Farm memory blankFarm;
        s.farms[farm.name] = blankFarm;
    }

    function replaceFarm(SLib.Farm memory farm) internal {
        SLib.S storage s = SLib.getS();
        SLib.Farm memory currentFarm = s.farms[farm.name];
        require(
            farmExists(farm.name) &&
            (farm.C != currentFarm.C ||
            farm.N != currentFarm.N ||
            farm.D != currentFarm.D),
            "farm replace"
        );
        s.farms[farm.name].C = farm.C;
    }

    function farmExists(
        string memory name
    ) internal view returns (bool) {
        SLib.S storage s = SLib.getS();
        if (s.names.length == 0)
            return false;
        if (
            s.nameIndex[name] > 0 ||
            keccak256(bytes(s.names[0])) == keccak256(bytes(name))
        )
            return true;
        return false;
    }

    /// @notice Add/change/remove any number of farms
    /// @param farmCuts Contains the farms and which add/change/remove
    /// action will be used
    function farmCut(SLib.FarmCut_[] calldata farmCuts) external {
        require(msg.sender == owner, "farmCut");
        SLib.S storage s = SLib.getS();
        if (s.wc == 0) s.wc = 1;
        bool changesMade = false;
        for (uint i = 0; i < farmCuts.length; i++) {
            SLib.FarmCut_ memory farmCut_ = farmCuts[i];
            SLib.Farm memory farm = farmCut_.farm;
            if (farmCut_.action == SLib.FarmCutAction.Add) {
                addFarm(farm);
                if (!changesMade) changesMade = true;
            }
            if (farmCut_.action == SLib.FarmCutAction.Replace) {
                replaceFarm(farm);
                if (!changesMade) changesMade = true;
            }
            if (farmCut_.action == SLib.FarmCutAction.Remove) {
                removeFarm(farm);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.FarmCut(farmCuts);
    }

    /// @notice Gets all farms and their details
    /// @return All farms and their details
    function farms() external view returns (uint, uint, SLib.Farm[] memory) {
        SLib.S storage s = SLib.getS();
        SLib.Farm[] memory farms_ = new SLib.Farm[](s.names.length);
        for (uint i = 0; i < s.names.length; i++) {
            farms_[i] = s.farms[s.names[i]];
            farms_[i].max = piecesToUnits(farms_[i].max);
            farms_[i].last = piecesToUnits(farms_[i].last);
            farms_[i].propSum = farms_[i].propSum;
        }
        return (SLib.getSInfo().piecesPerUnit, s.wc, farms_);
    }

    function transfer(
        address receiver,
        uint value
    ) internal {
        (bool success,) = address(this).call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                receiver,
                value
            )
        );
        require(success, "transfer");
    }

    function unitsToPieces(uint units) internal view returns (uint) {
        return units * SLib.getSInfo().piecesPerUnit;
    }

    function piecesToUnits(uint pieces) internal view returns (uint) {
        return pieces / SLib.getSInfo().piecesPerUnit;
    }

    function points(string memory name) external view returns (uint) {
        SLib.S storage s = SLib.getS();
        return s.points[msg.sender][name];
    }

}
