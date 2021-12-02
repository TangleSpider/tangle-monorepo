// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface ERC20 {
    function transfer(address _to, uint value) external returns (bool);
    function transferFrom(address _from, address _to, uint value)
        external
        returns (bool);
}

/// @notice Info Storage for Tangle
/// @dev This is a Diamond Storage implementation described in EIP-2535.
library SLib {

    struct S {
        bool minted;
        uint8 decimals;
        address liquidityAddress;
        uint wc;
        uint last;
        uint totalSupply;
        uint piecesPerUnit;
        uint minHoldAmount;
        uint cropDustAmount;
        string name;
        string symbol;
        string[] names;
        address[] addresses;
        address[] blacklist;
        string[] farmsNames;
        Reflect_[] reflects;
        mapping(address => uint) balances;
        mapping(address => uint) addressIndex;
        mapping(address => uint) reflectIndex;
        mapping(address => uint) blacklistIndex;
        mapping(address => Split) splits;
        mapping(string => uint) nameIndex;
        mapping(string => uint) farmsNameIndex;
        mapping(string => string) ids;
        mapping(string => Farm) farms;
        mapping(address => mapping(address => uint)) allowances;
        mapping(address => mapping(string => uint)) points;
        mapping(address => mapping(string => uint)) rewards;
        mapping(address => mapping(string => uint)) wcInits;
        mapping(address => mapping(string => uint)) propSumInits;
    }
    function getS() internal pure returns (SInfo storage sInfo) {
        bytes32 storagePosition = keccak256(bytes32("0"));
        assembly { sInfo.slot := storagePosition }
    }
    struct MappingIDCut_ {
        uint8 action;
        string name;
        string id;
    }
    struct Split {
        uint16 numerator;
        uint16 denominator;
        address to;
    }
    struct SplitCut_ {
        uint8 action;
        Split split;
    }
    struct Reflect_ {
        address address_;
        bool flag;
    }
    struct ReflectCut_ {
        uint8 action;
        Reflect_ reflect_;
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
    struct BlacklistCut_ {
        uint8 action;
        address address_;
    }
    /// @notice Records all transfers
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    /// @notice Records all mappingId changes
    event MappingIDCut(MappingIDCut_[] mappingIdCuts);
    /// @notice Records all allowancesId changes
    event AllowancesIdChange(string allowancesId);
    /// @notice Records all approvals
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    /// @notice Records all minHoldAmount changes
    event MinHoldAmountChange(uint minHoldAmount);
    /// @notice Records all split changes
    event SplitCut(SplitCut_[] splitCuts);
    /// @notice Records all reflections
    event Reflect(address from_, uint amount);
    /// @notice Records all reflection changes
    event ReflectCut(ReflectCut_[] reflectCut);
    /// @notice Records all farm changes
    event FarmCut(FarmCut_[] farmCuts);
    /// @notice Records all airdropping point changes
    event AirdroppingPointChange(address from_, uint amount);
    /// @notice Records all blacklist changes
    event BlacklistCut(BlacklistCut_[] blacklistCuts);
    /// @notice Records all staking changes
    event UpdateStake(address staker, uint position);

}

/// @title Info, the information for Tangle
/// @author Brad Brown
/// @notice This contract provides the basic information related to Tangle
contract TangleBundle0_1 {

    mapping(bytes4 => address) private _0;
    address private owner;

    /// @notice Transfers Tangle from one holder to another, may implement a
    /// variable number of taxes and may modify the amount transferred
    /// @dev Modifies the value transferred according to the pre and tax
    /// Transformers (external implementations)
    /// @param _to The address Tangle will be sent to
    /// @param value The amount of Tangle sent
    /// @return Whether or not the transfer was successful
    function transfer(address _to, uint value) external returns (bool) {
        value = preTransform(msg.sender, value);
        _transfer(msg.sender, _to, value);
        return true;
    }

    /// @notice Transfers Tangle from one holder to another, may implement a
    /// variable number of taxes and may modify the amount transferred. Can be
    /// initiated by an approved 3rd party
    /// @dev Modifies the value transferred according to the pre and tax
    /// Transformers, which are implementation.
    /// @param _from The address Tangle will be sent from
    /// @param _to The address Tangle will be sent to
    /// @param value The amount of Tangle sent
    /// @return Whether or not the transfer was successful
    function transferFrom(address _from, address _to, uint value)
        external
        returns
    (bool) {
        value = preTransform(_from, value);
        SLib.S storage s = SLib.getS();
        s.allowances[_from][msg.sender] -= value;
        _transfer(_from, _to, value);
        return true;
    }

    function _transfer(address spender, address receiver, uint value)
        internal
    {
        SLib.S storage s = SLib.getS();
        s.balances[spender] -= unitsToPieces(value);
        value = _tax(spender, value);
        if (
            s.balances[receiver] == 0 &&
            value > 0 &&
            !_isReflected(receiver)
        )
            _addAirdroppingPoints(spender, 1);
        s.balances[receiver] += unitsToPieces(value);
        emit SLib.Transfer(spender, receiver, value);
        _reflect();
    }

    /// @notice Taxes a Tangle transfer, routes taxes and
    /// reduces transfer value by each tax amount routed
    /// @param value The value of Tangle being transferred
    /// @return The post-tax transfer value
    function _tax(address from, uint value)
        internal
        returns (uint)
    {
        uint preTaxValue = value;
        if (value == 0) return value;
        SLib.S storage s = SLib.getS();
        for (uint i = 0; i < s.addresses.length; i++) {
            SLib.Split memory split = s.splits[s.addresses[i]];
            uint numerator = split.numerator;
            uint denominator = split.denominator;
            uint splitAmount = preTaxValue * numerator / denominator;
            s.balances[split.to] += unitsToPieces(splitAmount);
            value -= splitAmount;
            emit SLib.Transfer(from, split.to, splitAmount);
        }
        return value;
    }

    /// @notice Reflects all tokens from each address in the reflects list
    /// to everyone except the addresses in the noReflects list
    function _reflect() internal {
        SLib.S storage s = SLib.getS();
        if (s.reflects.length == 0) return;
        uint totalNoReflectBalance;
        uint totalReflectBalance;
        for (uint i = 0; i < s.reflects.length; i++) {
            SLib.Reflect_ memory reflect_ = s.reflects[i];
            if (!reflect_.flag)
                totalNoReflectBalance += s.balances[reflect_.address_];
            if (reflect_.flag) {
                uint reflectAmount = s.balances[reflect_.address_];
                totalReflectBalance += reflectAmount;
                s.balances[reflect_.address_] = 0;
                emit SLib.Reflect(reflect_.address_, reflectAmount / s.piecesPerUnit);
            }
        }
        if (totalReflectBalance == 0) return;
        uint totalSupply_ = sInfo.totalSupply;
        uint TIP = totalSupply_ * s.piecesPerUnit - totalNoReflectBalance; // TIP: total included pieces
        uint TUP = TIP - totalReflectBalance; // TUP: total unaffected pieces
        uint newPiecesPerUnit = s.piecesPerUnit * TUP / TIP;
        s.piecesPerUnit = newPiecesPerUnit;
        if (s.piecesPerUnit < 1)
            s.piecesPerUnit = 1;
        for (uint i = 0; i < s.reflects.length; i++) {
            if (!s.reflects[i].flag) {
                uint nrBalance = s.balances[s.reflects[i].address_];
                s.balances[s.reflects[i].address_] = nrBalance * TUP / TIP;
            }
        }
    }

    function addReflect(SLib.Reflect_ memory reflect_) internal {
        SLib.S storage s = SLib.getS();
        require(!reflectExists(reflect_.address_));
        s.reflectIndex[reflect_.address_] = s.reflects.length;
        s.reflects.push(reflect_);
    }

    function removeReflect(SLib.Reflect_ memory reflect_) internal {
        SLib.S storage s = SLib.getS();
        require(reflectExists(reflect_.address_));
        SLib.Reflect_ memory lastReflect = s.reflects[s.reflects.length - 1];
        address address_ = reflect_.address_;
        address lastReflectAddress = lastReflect.address_;
        if (lastReflectAddress != address_) {
            s.reflectIndex[lastReflectAddress] = s.reflectIndex[address_];
            s.reflects[s.reflectIndex[address_]] = lastReflect;
        }
        s.reflects.pop();
        s.reflectIndex[address_] = 0;
    }

    function replaceReflect(SLib.Reflect_ memory reflect_) internal {
        SLib.S storage s = SLib.getS();
        bool currentFlag = s.reflects[s.reflectIndex[reflect_.address_]].flag;
        require(
            reflectExists(reflect_.address_) &&
            (currentFlag != reflect_.flag)
        );
        s.reflects[s.reflectIndex[reflect_.address_]] = reflect_;
    }

    function reflectExists(address address_) internal view returns (bool) {
        SLib.S storage s = SLib.getS();
        if (s.reflects.length == 0)
            return false;
        if (s.reflectIndex[address_] > 0 || s.reflects[0].address_ == address_)
            return true;
        return false;
    }

    function _isReflected(address address_) internal view returns (bool) {
        require(reflectExists(address_) && SLib.getS().reflects[SLib.getS().reflectIndex[address_]].flag);
        return true;
    }

    /// @notice Add/remove any number of addresses whose funds get reflected
    /// @param reflectCuts ReflectCut[]
    function reflectCut(
        SLib.ReflectCut_[] calldata reflectCuts
    ) external {
        require(msg.sender == owner);
        bool changesMade = false;
        for (uint i = 0; i < reflectCuts.length; i++) {
            SLib.ReflectCut_ memory reflectCut_ = reflectCuts[i];
            if (reflectCut_.action == 0) {
                addReflect(reflectCut_.reflect_);
                if (!changesMade) changesMade = true;
            }
            if (reflectCut_.action == 1) {
                replaceReflect(reflectCut_.reflect_);
                if (!changesMade) changesMade = true;
            }
            if (reflectCut_.action == 2) {
                removeReflect(reflectCut_.reflect_);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.ReflectCut(reflectCuts);
    }

    /// @notice Transforms a Tangle transfer value, ensures that a transfer
    /// cannot leave a holder's balance below the minHoldAmount
    /// @param spender The address the Tangle is being transferred from
    /// @param value The amount of Tangle being transferred
    /// @return The transformed transfer value
    function preTransform(address spender, uint value)
        internal
        view
        returns (uint)
    {
        SLib.S storage s = SLib.getS();
        uint balance = piecesToUnits(s.balances[spender]);
        require(value <= balance);
        uint minHoldAmount_ = s.minHoldAmount;
        if (balance - value < minHoldAmount_)
            value = balance - minHoldAmount_;
        return value;
    }

    /// @notice Changes the minHoldAmount, emits an event recording the change
    /// @param minHoldAmount_ The new minHoldAmount
    function changeMinHoldAmount(uint minHoldAmount_) external {
        require(msg.sender == owner);
        SLib.getS().minHoldAmount = minHoldAmount_;
        emit SLib.MinHoldAmountChange(minHoldAmount_);
    }

    function piecesToUnits(uint pieces) internal view returns (uint) {
        return pieces / SLib.getS().piecesPerUnit;
    }

    function unitsToPieces(uint units) internal view returns (uint) {
        return units * SLib.getS().piecesPerUnit;
    }

    /// @notice Returns the balance of a Tangle token holder
    /// @param _owner The Tangle token holder's address
    /// @return The balance of a holder
    function balanceOf(address _owner) external view returns (uint) {
        return piecesToUnits(SLib.getS().balances[_owner]);
    }

    /// @notice Approves a spender to spend an amount of Tangle
    /// @param _spender The address of the spender
    /// @param _value The amount that the spender can spend
    /// @return Whether or not the approval was successful
    function approve(address _spender, uint _value) external returns (bool) {
        SLib.S storage s = SLib.getS();
        s.allowances[msg.sender][_spender] = _value;
        emit SLib.Approval(msg.sender, _spender, _value);
        return true;
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

    function addMappingId(SLib.MappingIDCut_ memory cut) internal {
        SLib.S storage s = SLib.getS();
        require(!nameExists(cut.name));
        s.nameIndex[cut.name] = s.names.length;
        s.names.push(cut.name);
        s.ids[cut.name] = cut.id;
    }

    function removeMappingId(SLib.MappingIDCut_ memory cut) internal {
        SLib.S storage s = SLib.getS();
        require(nameExists(cut.name));
        string memory lastName = s.names[
            s.names.length - 1
        ];
        if (keccak256(bytes(lastName)) != keccak256(bytes(cut.name))) {
            s.nameIndex[lastName] = s.nameIndex[cut.name];
            s.names[s.nameIndex[cut.name]] = lastName;
        }
        s.nameIndex[cut.name] = 0;
        s.names.pop();
        s.ids[cut.name] = "";
    }

    function replaceMappingId(SLib.MappingIDCut_ memory cut) internal {
        SLib.S storage s = SLib.getS();
        bytes32 cutIdHash = keccak256(bytes(cut.id));
        bytes32 currentIdHash = keccak256(bytes(s.ids[cut.name]));
        require(cutIdHash != currentIdHash);
        s.ids[cut.name] = cut.id;
    }

    function nameExists(string memory name_) internal view returns (bool) {
        SLib.S storage s = SLib.getS();
        if (s.names.length == 0)
            return false;
        if (
            s.nameIndex[name_] > 0 ||
            keccak256(bytes(s.names[0])) == keccak256(bytes(name_))
        )
            return true;
        return false;
    }

    /// @notice Add/change/remove any number of mapping IDs
    /// @param mappingIdCuts Contains the splits and which add/change/remove
    /// action will be used
    function mappingIdCut(
        SLib.MappingIDCut_[] calldata mappingIdCuts
    ) external {
        require(msg.sender == owner);
        bool changesMade = false;
        for (uint i = 0; i < mappingIdCuts.length; i++) {
            SLib.MappingIDCut_ memory mappingIdCut_ = mappingIdCuts[i];
            if (mappingIdCut_.action == 0) {
                addMappingId(mappingIdCut_);
                if (!changesMade) changesMade = true;
            }
            if (mappingIdCut_.action == 1) {
                replaceMappingId(mappingIdCut_);
                if (!changesMade) changesMade = true;
            }
            if (mappingIdCut_.action == 2) {
                removeMappingId(mappingIdCut_);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.MappingIDCut(mappingIdCuts);
    }

    /// @notice Gets a mapping id from a mapping name
    /// @param name_ The mapping'sMappingIDs name
    /// @return The ID of the mapping
    function getId(string memory name_)
        internal
        view
        returns (string memory)
    {
        return SLib.getS().ids[name_];
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
        return SLib.getS().allowances[_owner][_spender];
    }

    function addSplit(SLib.Split memory split) internal {
        SLib.S storage s = SLib.getS();
        require(!splitExists(split.to), "split add");
        s.addressIndex[split.to] = s.addresses.length;
        s.addresses.push(split.to);
        s.splits[split.to] = split;
   }

   function removeSplit(SLib.Split memory split) internal {
       SLib.S storage s = SLib.getS();
       require(splitExists(split.to), "split remove");
       address lastAddress = s.addresses[s.addresses.length - 1];
       if (lastAddress != split.to) {
           s.addressIndex[lastAddress] = s.addressIndex[split.to];
           s.addresses[s.addressIndex[split.to]] = lastAddress;
       }
       s.addresses.pop();
       s.addressIndex[split.to] = 0;
       s.splits[split.to] = SLib.Split(address(0),0,0);
   }

   function replaceSplit(SLib.Split memory split) internal {
       SLib.S storage s = SLib.getS();
       SLib.Split memory currentSplit = s.splits[split.to];
       bool numsEqual = split.numerator == currentSplit.numerator;
       bool denomsEqual = split.denominator == currentSplit.denominator;
       require(
           splitExists(split.to) &&
           (!numsEqual || !denomsEqual),
           "split replace"
       );
       s.splits[split.to] = split;
   }

   function splitExists(address  address_) internal view returns (bool) {
       SLib.S storage s = SLib.getS();
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
       require(msg.sender == owner);
       bool changesMade = false;
       for (uint i = 0; i < splitCuts.length; i++) {
           SLib.SplitCut_ memory splitCut_ = splitCuts[i];
           SLib.Split memory split = splitCut_.split;
           if (splitCut_.action == 0) {
               addSplit(split);
               if (!changesMade) changesMade = true;
           }
           if (splitCut_.action == 1) {
               replaceSplit(split);
               if (!changesMade) changesMade = true;
           }
           if (splitCut_.action == 2) {
               removeSplit(split);
               if (!changesMade) changesMade = true;
           }
       }
       if (changesMade) emit SLib.SplitCut(splitCuts);
   }

   function _availableRewards(
        address address_,
        string memory name_
    ) internal view returns (uint) {
        SLib.S storage s = SLib.getS();
        SLib.Farm memory farm = s.farms[name_];
        if (farm.D == 0) return 0;
        farm.max += (s.balances[address(this)] - s.last) * farm.N / farm.D;
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
        if (s.wcInits[address_][name_] == 0 || _wc == 0) return 0;
        uint available = s.rewards[address_][name_] + s.points[address_][name_] * (_propSum - s.propSumInits[address_][name_] * _wc / s.wcInits[address_][name_]) / _wc;
        return available;
    }

    function _distribute(
        string memory name_
    ) internal {
        SLib.S storage s = SLib.getS();
        SLib.Farm storage farm = s.farms[name_];
        if (s.balances[address(this)] != s.last) {
            for (uint i = 0; i < s.names.length; i++) {
                SLib.Farm storage farm_ = s.farms[s.names[i]];
                if (farm_.D == 0) continue;
                farm_.max += (s.balances[address(this)] - s.last) * farm_.N / farm_.D;
            }
            s.last = s.balances[address(this)];
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

    function _withdrawRewards(
        address _address,
        string memory name_
    ) internal {
        SLib.S storage s = SLib.getS();
        SLib.Farm storage farm = s.farms[name_];
        if (farm.points == 0) return; // prevent undefined behavior when calling _withdrawRewards on a farm with 0 points
        _distribute(name_);
        if (s.wcInits[_address][name_] == 0 || s.wc == 0) return;
        uint available = s.rewards[_address][name_] + s.points[_address][name_] * (farm.propSum - s.propSumInits[_address][name_] * s.wc / s.wcInits[_address][name_]) / s.wc;
        s.rewards[_address][farm.name] = 0;
        s.propSumInits[_address][farm.name] = farm.propSum;
        s.wcInits[_address][farm.name] = s.wc;
        s.last -= available;
        _transfer(address(this), _address, piecesToUnits(available));
    }

    /// @notice Withdraw rewards from all yield farms for an address
    /// @param _address The address whose rewards will be withdrawn
    function withdrawRewards(address _address) external {
        SLib.S storage s = SLib.getS();
        for (uint i = 0; i < s.names.length; i++) {
            _withdrawRewards(_address, s.names[i]);
        }
    }

    function addFarm(SLib.Farm memory farm) internal {
        SLib.S storage s = SLib.getS();
        require(!farmExists(farm.name));
        s.nameIndex[farm.name] = s.names.length;
        s.names.push(farm.name);
        s.farms[farm.name] = farm;
    }

    function removeFarm(SLib.Farm memory farm) internal {
        SLib.S storage s = SLib.getS();
        require(farmExists(farm.name));
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
            farm.D != currentFarm.D)
        );
        s.farms[farm.name].C = farm.C;
    }

    function farmExists(
        string memory name_
    ) internal view returns (bool) {
        SLib.S storage s = SLib.getS();
        if (s.names.length == 0)
            return false;
        if (
            s.nameIndex[name_] > 0 ||
            keccak256(bytes(s.names[0])) == keccak256(bytes(name_))
        )
            return true;
        return false;
    }

    /// @notice Add/change/remove any number of farms
    /// @param farmCuts Contains the farms and which add/change/remove
    /// action will be used
    function farmCut(SLib.FarmCut_[] calldata farmCuts) external {
        require(msg.sender == owner);
        SLib.S storage s = SLib.getS();
        if (s.wc == 0) s.wc = 1;
        bool changesMade = false;
        for (uint i = 0; i < farmCuts.length; i++) {
            SLib.FarmCut_ memory farmCut_ = farmCuts[i];
            SLib.Farm memory farm = farmCut_.farm;
            if (farmCut_.action == 0) {
                addFarm(farm);
                if (!changesMade) changesMade = true;
            }
            if (farmCut_.action == 1) {
                replaceFarm(farm);
                if (!changesMade) changesMade = true;
            }
            if (farmCut_.action == 2) {
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

    /// @notice Transfers a constant amount of Tangle set by owner to each address
    /// in a list of addresses
    /// @param addresses A list of addresses
    function cropDust(address[] memory addresses) external {
        SLib.S storage s = SLib.getS();
        uint viableAddresses = addresses.length;
        for (uint i = 0; i < addresses.length; i++) {
            if (s.balances[addresses[i]] > 0 && !_isReflected(addresses[i])) {
                viableAddresses--;
                continue;
            }
            s.balances[addresses[i]] += unitsToPieces(s.cropDustAmount);
            emit SLib.Transfer(msg.sender, addresses[i], s.cropDustAmount);
        }
        s.balances[msg.sender] -= unitsToPieces(s.cropDustAmount) * viableAddresses;
        _addAirdroppingPoints(msg.sender, viableAddresses);
    }

    function _addAirdroppingPoints(address address_, uint amount) internal {
        if (addressExists(address_)) return;
        SLib.S storage s = SLib.getS();
        if (farm.start == 0) farm.start = block.timestamp;
        if (farm.points > 0)
            _distribute("airdropping");
        uint rewards = _availableRewards(address_, "airdropping");
        if (rewards > 0)
            sFarms.rewards[address_]["airdropping"] = rewards;
        sFarms.propSumInits[address_]["airdropping"] = farm.propSum;
        sFarms.wcInits[address_]["airdropping"] = sFarms.wc;
        sFarms.points[address_]["airdropping"] += amount;
        farm.points += amount;
        emit SLib.AirdroppingPointChange(address_, sFarms.points[address_]["airdropping"]);
    }

    function addAddress(address address_) internal {
        SLib.S storage s = SLib.getS();
        require(!addressExists(address_));
        s.blacklistIndex[address_] = s.blacklist.length;
        s.blacklist.push(address_);
    }

    function removeAddress(address address_) internal {
        SLib.S storage s = SLib.getS();
        require(addressExists(address_));
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
        require(msg.sender == owner);
        bool changesMade = false;
        for (uint i = 0; i < blacklistCuts.length; i++) {
            SLib.BlacklistCut_ memory blacklistCut_ = blacklistCuts[i];
            if (blacklistCut_.action == 0) {
                addAddress(blacklistCut_.address_);
                if (!changesMade) changesMade = true;
            }
            if (blacklistCut_.action == 1) {
                removeAddress(blacklistCut_.address_);
                if (!changesMade) changesMade = true;
            }
        }
        if (changesMade) emit SLib.BlacklistCut(blacklistCuts);
    }

    function changeCropDustAmount(uint newCropDustAmount) external {
        require(msg.sender == owner);
        SLib.getS().cropDustAmount = newCropDustAmount;
    }

    /// @notice Updates a staking position
    /// @param amount The new amount of the staking position
    function updateStake(uint amount) external {
        SLib.S storage s = SLib.getS();
        uint currentAmount = s.points[msg.sender]["staking"];
        require(amount != currentAmount);
        if (currentAmount == 0) _stake(amount);
        if (amount == 0) _unstake();
        if (currentAmount != 0 && amount != 0) {
            _unstake();
            _stake(amount);
        }
        emit SLib.UpdateStake(msg.sender, amount);
    }

    function _stake(uint amount) internal {
        SLib.S storage s = SLib.getS();
        SLib.Farm storage farm = s.farms["staking"];
        ERC20(s.liquidityAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (farm.start == 0) farm.start = block.timestamp;
        if (farm.points > 0)
            _distribute("staking");
        s.propSumInits[msg.sender]["staking"] = farm.propSum;
        s.wcInits[msg.sender]["staking"] = sFarms.wc;
        s.points[msg.sender]["staking"] = amount;
        farm.points += amount;
    }

    function _unstake() internal {
        _distribute("staking");
        SLib.S storage s = SLib.getS();
        SLib.Farm storage farm = s.farms["staking"];
        uint currentAmount = s.points[msg.sender]["staking"];
        uint rewards = _availableRewards(msg.sender, "staking");
        if (rewards > 0)
            s.rewards[msg.sender]["staking"] = rewards;
        ERC20(s.liquidityAddress).transfer(
            msg.sender,
            currentAmount
        );
        farm.points -= currentAmount;
        s.points[msg.sender]["staking"] = 0;
    }

    ///@notice Changes the liquidity address used by the Staking contract. Owner-only.
    ///@param newLiquidityAddress The new liquidity address
    function changeLiquidityAddress(address newLiquidityAddress) external {
        require(msg.sender == owner);
        SLib.getS().liquidityAddress = newLiquidityAddress;
    }

    function bundleInit() external {
        require(msg.sender == owner);
        SLib.S storage s = SLib.getS();
        require(!s.minted);
        s.name = "Tangle";
        s.symbol = "TNGL";
        s.decimals = 9;
        s.totalSupply = 10 ** 18;
        s.piecesPerUnit = type(uint128).max - (type(uint128).max % 10 ** 18);
        s.minted = true;
        uint totalSupply_ = SLib.getS().totalSupply;
        s.balances[msg.sender] = unitsToPieces(totalSupply_);
        emit SLib.Transfer(address(0), msg.sender, totalSupply_);
        SLib.MappingIDCut_[] memory mappingIdCuts = new SLib.MappingIDCut_[](3);
        mappingIdCuts[0] = SLib.MappingIDCut_(
            SLib.MappingIDCutAction.Add,
            "balances",
            "Tangle.Balances0"
        );
         mappingIdCuts[1] = SLib.MappingIDCut_(
            SLib.MappingIDCutAction.Add,
            "allowances",
            "Tangle.Allowances0"
        );
         mappingIdCuts[2] = SLib.MappingIDCut_(
            SLib.MappingIDCutAction.Add,
            "farms",
            "Tangle.Farms0"
        );
        this.mappingIdCut(mappingIdCuts);
    }

}
