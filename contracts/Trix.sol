// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Trix is ReentrancyGuard {
    address owner;
    uint8 public MAX_FEE = 3; // 3%

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

    modifier notZeroDonation(uint256 value) {
        require(value > 0, "Donation can't be equal zero");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owners");
        _;
    }

    function changeFee(uint8 _newFee) external onlyOwner {
        require(_newFee <= 10, "Fee cannot exceed 10%");

        MAX_FEE = _newFee;
    }

    function sendDonation(
        address _to,
        string calldata _username,
        string calldata _message
    ) external payable notZeroDonation(msg.value) nonReentrant {
        uint256 fee = (msg.value * MAX_FEE) / 100;
        uint256 amount = msg.value - fee;

        (bool sentFee, ) = payable(owner).call{value: fee}("");
        require(sentFee, "Failed to transfer fee");

        (bool sentDonat, ) = payable(_to).call{value: amount}("");
        require(sentDonat, "Failed to transfer donation");

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
        string calldata _username,
        string calldata _message,
        address _token,
        uint256 value
    ) external payable notZeroDonation(value) nonReentrant {
        IERC20 token = IERC20(_token);

        uint256 fee = (value * MAX_FEE) / 100;
        uint256 amount = value - fee;

        require(
            token.transferFrom(msg.sender, owner, fee),
            "Failed to transfer fee"
        );
        require(
            token.transferFrom(msg.sender, _to, amount),
            "Failed to transfer donation"
        );

        emit Donat(
            msg.sender,
            _to,
            value,
            block.timestamp,
            _username,
            _message,
            _token
        );
    }
}
