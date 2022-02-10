// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Fractal {

    event Request(bytes);
    uint public requestCount;
    mapping(uint => bool) public fulfilled;
    mapping(uint => uint) public revokable;
    // allow submitting a request
    // allow "revoking" of request after a given time
    function submitRequest(bytes memory data, uint time) external {
        revokable[requestCount] = time;
        emit Request(data);
        requestCount++;
    }
    function revokeRequest(uint id) external {
        require(block.timestamp > revokable[id], "not yet revokable");
        require(fulfilled[id] == false, "cannot revoke fulfilled request");
        // TODO: "revoke" the request
    }

}
