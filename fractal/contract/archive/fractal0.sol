// SPDX-License-Identifier: none
pragma solidity ^0.8.13;

contract Fractal {
    struct Trade {
        uint8 status;
        address Buyer;
        address Seller;
        uint cost;
        bytes product;
        uint id;
    }
    Trade[] public trades;
    function buy(bytes calldata product) external payable {
        trades.push(Trade(
            0,              // status (init)
            msg.sender,     // buyer
            address(0),     // seller
            msg.value,      // cost
            product,        // product
            trades.length   // id
        ));
    }
    function sell(uint cost, bytes calldata product) external {
        trades.push(Trade(
            0,              // status (init)
            address(0),     // buyer
            msg.sender,     // seller
            cost,           // cost
            product,        // product
            trades.length   // id
        ));
    }
}
