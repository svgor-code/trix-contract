// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

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

    function sendDonation(
        address _to,
        string memory _username,
        string memory _message,
        address _token
    ) external payable {
        require(_to != address(0), "Unexpected zero address");
        require(msg.value > 0, "Donation can't be equal zero");

        uint256 fee = (msg.value * MAX_FEE) / 100;
        uint256 amount = msg.value - fee;

        if (_token != address(0)) {
            _sendTokenDonation(_to, _token, fee, amount);
        } else {
            payable(owner).transfer(fee);
            payable(_to).transfer(amount);
        }

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

    function _sendTokenDonation(
        address _to,
        address _token,
        uint256 _fee,
        uint256 _amount
    ) internal {
        IERC20 token = IERC20(_token);
        token.transferFrom(msg.sender, owner, _fee);
        token.transferFrom(msg.sender, _to, _amount);
    }
}
