// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/** @title Fractal - A light, simulated blockchain enabling Fractal swaps
    @author Brad Brown **/
contract Fractal {

    function openSwap() external {
        // TODO: open a swap
    }

    function closeSwap() external {
        // TODO: close an open swap
        // TODO: refunds swap.escrow to swap submitter
    }

    function submitBlock() external {
        // TODO: submit block
        // TODO: for swap in block.swaps
        // TODO:    reward block submitter
        // TODO:    reward swap fulfiller
        // TODO:    closeSwap(swap)
    }

    function stake() external {
        // TODO: accept stake
        // TODO: staker is validator
    }

    function unstake() external {
        // TODO: staker not validator
    }
}
