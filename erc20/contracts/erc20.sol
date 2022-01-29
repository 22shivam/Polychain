pragma solidity ^0.8.11;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {

    constructor (string memory name, string memory symbol, address account, uint256 amount) ERC20(name, symbol) {
        _mint(account, amount * (10 ** uint256(decimals())));
    }
}