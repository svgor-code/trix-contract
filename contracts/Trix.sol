// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Trix {
    address owner;
    uint256 internal constant MAX_FEE = 1; // 1%

    constructor() {
        owner = msg.sender;
    }

    event Donat(
        address from,
        address indexed to,
        uint256 amount,
        uint256 indexed timestamp,
        string username,
        string message,
        address indexed token
    );

    modifier notZeroDonation() {
        require(msg.value > 0, "Donation can't be equal zero");
        _;
    }

    function sendDonation(
        address _to,
        string memory _username,
        string memory _message
    ) external payable notZeroDonation {
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
            _message,
            address(0)
        );
    }

    function sendTokenDonation(
        address _to,
        string memory _username,
        string memory _message,
        address _token
    ) external payable notZeroDonation {
        IERC20 token = IERC20(_token);

        uint256 fee = (msg.value * MAX_FEE) / 100;
        uint256 amount = msg.value - fee;


        token.transferFrom(msg.sender, owner, fee);
        token.transferFrom(msg.sender, _to, amount);

        emit Donat(
            msg.sender,
            _to,
            msg.value,
            block.timestamp,
            _username,
            _message,
            _token
        );
    }
}
