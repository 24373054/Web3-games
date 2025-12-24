// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Market is ReentrancyGuard {
    struct Listing {
        uint256 id;
        address seller;
        address token;
        uint256 tokenId;
        uint256 amount;
        uint256 price; // 单价，单位：wei
        bool active;
    }

    uint256 public listingCounter;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed listingId, address indexed seller, address token, uint256 tokenId, uint256 amount, uint256 price);
    event Bought(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event Cancelled(uint256 indexed listingId);

    constructor() {
        // 无需初始化
    }

    function list(address token, uint256 tokenId, uint256 amount, uint256 price) external nonReentrant returns (uint256) {
        require(price > 0, "price=0");
        require(amount > 0, "amount=0");
        // 先把货物转入合约托管
        IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        uint256 id = ++listingCounter;
        listings[id] = Listing({
            id: id,
            seller: msg.sender,
            token: token,
            tokenId: tokenId,
            amount: amount,
            price: price,
            active: true
        });

        emit Listed(id, msg.sender, token, tokenId, amount, price);

        return id;
    }

    function buy(uint256 listingId, uint256 amount) external payable nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "inactive");
        require(amount > 0 && amount <= l.amount, "invalid amount");
        uint256 total = l.price * amount;
        require(msg.value == total, "bad value");

        // 结算
        (bool ok,) = payable(l.seller).call{value: total}("");
        require(ok, "pay fail");

        // 发货
        IERC1155(l.token).safeTransferFrom(address(this), msg.sender, l.tokenId, amount, "");
        l.amount -= amount;
        if (l.amount == 0) {
            l.active = false;
        }

        emit Bought(listingId, msg.sender, amount, total);
    }

    function cancel(uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "inactive");
        require(l.seller == msg.sender, "not seller");
        l.active = false;
        IERC1155(l.token).safeTransferFrom(address(this), msg.sender, l.tokenId, l.amount, "");
        emit Cancelled(listingId);
    }

    // 接收 ERC1155 转账所需的接口
    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }
    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}


