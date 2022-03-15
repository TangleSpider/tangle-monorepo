// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Math.sol";
import "./Algorithm.sol";

interface ERC20 {
    function balanceOf(address) external view returns (uint);
    function transferFrom(address, address, uint) external;
    function transfer(address, uint) external;
}

/** @title Fractal - A light, simulated blockchain enabling Fractal swaps
    @author Brad Brown **/
contract Fractal is Math, Algorithm {

    function openSwap() external {
        // TODO: open a swap
    }

    function closeSwap(uint id) external {
        // TODO: close an open swap
        // TODO: refunds swap.escrow to swap submitter
    }

    function submitBlock() external {
        // TODO: require allowed validator
        // TODO: submit block
        // TODO: for swap in block.swaps
        // TODO:    reward block submitter
        // TODO:    reward swap fulfiller
        // TODO:    closeSwap(swap)
    }

    function stake(uint amount) external {
        // TODO: accept Tangle stake
        uint preBal = Tangle.balanceOf(address(this));
        Tangle.transferFrom(msg.sender, address(this), amount);
        amount = Tangle.balanceOf(address(this)) - preBal;
        staked[msg.sender] += amount;
        // TODO: update bucket and validator
        //updateStaker(msg.sender);
    }

    function unstake(uint amount) external {
        // TODO: return stake to validator
        Tangle.transfer(msg.sender, amount);
        // TODO: subtract unstakers stake from staked
        staked[msg.sender] -= amount;
        // TODO: update bucket and validator
        //updateValidator();
    }

    function updateValidator() internal {
        // get new bucket
        //uint8 newBucket = log2(staked[msg.sender]);
        // if old bucket == new bucket, do nothing
        //if (bucketFromValidator[msg.sender] == newBucket) return;
        // remove validator from old bucket
        // if new bucket doesn't exist, create new bucket
        // add validator to new bucket
    }

    // tested - success
    function log2(uint number) external pure returns (uint) {
        return _log2(number);
    }

    // tested - success
    function fractalRand() external view returns (uint) {
        return _log2(uint(blockhash(block.number - 1)));
    }

    // tested - success
    function mergeSort (
        uint[] memory array
    ) external pure returns (uint [] memory) {
        return _mergeSort(array);
    }

    ERC20 Tangle;
    // TODO: define Tangle on deployment
    /*constructor(address tangle) {
        Tangle = ERC20(tangle);
    }*/
    mapping(uint8 => address[]) buckets;
    mapping(address => uint) public staked;
    //Math math = new Math();
    //uint public totalStaked;
    //uint public stakerCount;

}
