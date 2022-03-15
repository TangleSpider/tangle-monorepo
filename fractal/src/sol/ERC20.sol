// SPDX-License-Identifier: 0BSD

pragma solidity ^0.8.5;

contract ERC20 {

    uint8 public decimals = 9;
    uint public totalSupply = 1e8 * 1e9;
    string public name;
    string public symbol;
    mapping (address => uint256) private balances;
    mapping (address => mapping (address => uint)) private allowed;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        balances[msg.sender] = totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function allowance(address _owner, address spender) public view returns (uint256) {
        return allowed[_owner][spender];
    }

    function transfer(address to, uint256 value) public returns (bool) {
        balances[msg.sender] = balances[msg.sender] - value;
        balances[to] = balances[to] + value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        allowed[from][msg.sender] = allowed[from][msg.sender] - value;
        balances[from] = balances[from] - value;
        balances[to] = balances[to] + value;
        emit Transfer(from, to, value);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        allowed[msg.sender][spender] = allowed[msg.sender][spender] + addedValue;
        emit Approval(msg.sender, spender, allowed[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        allowed[msg.sender][spender] = allowed[msg.sender][spender] - subtractedValue;
        emit Approval(msg.sender, spender, allowed[msg.sender][spender]);
        return true;
    }

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed owner, address indexed spender, uint256 value);

}
