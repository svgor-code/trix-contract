// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Donats {
    address owner;
    mapping(address => uint) public wallets;

    constructor() {
        owner = msg.sender;
    }

    event Donat(
        address from,
        address to,
        uint256 amount,
        uint256 timestamp,
        string username,
        string message
    );

    event Withdraw(address wallet, uint256 amount, uint256 timestamp);

    function sendDonation(
        address _to,
        string memory _username,
        string memory _message
    ) external payable {
        require(_to != address(0), "Unexpected zero address");
        require(msg.value > 0, "Donation can't be equal zero");

        wallets[_to] += (msg.value - (100 / msg.value));
        wallets[owner] += 100 / msg.value;

        emit Donat(
            msg.sender,
            _to,
            msg.value,
            block.timestamp,
            _username,
            _message
        );
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender != address(0), "Unexpected zero address");
        require(_amount > 0, "Requested withdrawal amount is too small");
        require(wallets[msg.sender] >= _amount, "Insufficient funds");

        wallets[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit Withdraw(msg.sender, _amount, block.timestamp);
    } 
}
