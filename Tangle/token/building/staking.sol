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
    /// @notice Records all staking changes
    event UpdateStake(address staker, uint position);

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

/// @title Staking, handles staking position interactions and provides staking
/// position details
/// @author Brad Brown
/// @notice Gives staking info and allows for liquidity staking
contract Staking {

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

    /// @notice Updates a staking position
    /// @param amount The new amount of the staking position
    function updateStake(uint amount) external {
        SLib.SFarms storage sFarms = SLib.getSFarms(getMappingId("farms"));
        uint currentAmount = sFarms.points[msg.sender]["staking"];
        require(amount != currentAmount, "updateStake");
        if (currentAmount == 0) _stake(amount);
        if (amount == 0) _unstake();
        if (currentAmount != 0 && amount != 0) {
            _unstake();
            _stake(amount);
        }
        emit SLib.UpdateStake(msg.sender, amount);
    }

    function _stake(uint amount) internal {
        SLib.SFarms storage sFarms = SLib.getSFarms(getMappingId("farms"));
        SLib.Farm storage farm = sFarms.farms["staking"];
        ERC20(sFarms.liquidityAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (farm.start == 0) farm.start = block.timestamp;
        if (farm.points > 0)
            _distribute("staking");
        sFarms.propSumInits[msg.sender]["staking"] = farm.propSum;
        sFarms.wcInits[msg.sender]["staking"] = sFarms.wc;
        sFarms.points[msg.sender]["staking"] = amount;
        farm.points += amount;
    }

    function _unstake() internal {
        _distribute("staking");
        SLib.SFarms storage sFarms = SLib.getSFarms(getMappingId("farms"));
        SLib.Farm storage farm = sFarms.farms["staking"];
        uint currentAmount = sFarms.points[msg.sender]["staking"];
        uint rewards = _availableRewards(msg.sender, "staking");
        if (rewards > 0)
            sFarms.rewards[msg.sender]["staking"] = rewards;
        ERC20(sFarms.liquidityAddress).transfer(
            msg.sender,
            currentAmount
        );
        farm.points -= currentAmount;
        sFarms.points[msg.sender]["staking"] = 0;
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

    ///@notice Changes the liquidity address used by the Staking contract. Owner-only.
    ///@param newLiquidityAddress The new liquidity address
    function changeLiquidityAddress(address newLiquidityAddress) external {
        require(msg.sender == owner, "changeLiquidityAddress");
        SLib.SFarms storage sFarms = SLib.getSFarms(getMappingId("farms"));
        sFarms.liquidityAddress = newLiquidityAddress;
    }

    ///@notice Gets the current liquidity address used by the Staking contract.
    ///@return The current liquidity address
    function liquidityAddress() external view returns (address) {
        SLib.SFarms storage sFarms = SLib.getSFarms(getMappingId("farms"));
        return sFarms.liquidityAddress;
    }

}
