// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Trix {
    address owner;
    uint256 internal constant MAX_FEE = 1; // 1%

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

    function sendDonation(
        address _to,
        string memory _username,
        string memory _message
    ) external payable {
        require(_to != address(0), "Unexpected zero address");
        require(msg.value > 0, "Donation can't be equal zero");

        uint256 fee = (msg.value * MAX_FEE) / 100;
        uint256 amount = msg.value - fee;

        payable(owner).transfer(fee);
        payable(_to).transfer(amount);

        emit Donat(
            msg.sender,
            _to,
            msg.value,
            block.timestamp,
            _username,
            _message
        );
    }
}
