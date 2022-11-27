// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Devesh is ERC1155, ERC2981, Ownable {

    using Counters for Counters.Counter;

    Counters.Counter public _tokensCreated;
    string public name;
    string public symbol;
    // string _contractURI;
    mapping(uint => string) public tokenURI;
    mapping(address => mapping(uint => uint)) public numberMinted;

    uint256[] public supplies;
    uint256[] public  minted;
    uint256[] public prices;
    uint256[] public per_wallet_cap;

    constructor(uint96 _royaltyFeesInBips) ERC1155("") {
        name = "AssetContract";
        symbol = "ASC";
        // _contractURI = contract_uri;
        setRoyaltyInfo(msg.sender, _royaltyFeesInBips);
    }

    modifier tokenSupply(uint256 id) {
        require(id < supplies.length, "Token doesn't exist");
        _;
    }

    function setURI(uint _id, string memory _uri) external tokenSupply(_id) {
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function uri(uint _id) public override view returns (string memory) {
        return tokenURI[_id];
    }

    function mint(uint256 id)
        public
        payable
        tokenSupply(id)
    {
        require(minted[id] + 1 <= supplies[id], "Not enough supply");
        require(msg.value >= prices[id], "Not enough ether");
        require(numberMinted[msg.sender][id] < per_wallet_cap[id], "Can't mint more NFTs");

        _mint(msg.sender, id, 1, "");
        minted[id] += 1;
        numberMinted[msg.sender][id] += 1;
    }

    function ownerMint(address to, uint256 id, uint256 amount) public onlyOwner tokenSupply(id) {
        require(minted[id] + amount <= supplies[id], "Not enough supply");

        _mint(to, id, amount, "");
        minted[id] += amount;
        numberMinted[to][id] += amount;
    }

    function addNewEdition(uint256 supply, uint256 price, uint256 _per_wallet_cap, string memory _uri) public onlyOwner {
        supplies.push(supply);
        minted.push(0);
        prices.push(price);
        per_wallet_cap.push(_per_wallet_cap);
        tokenURI[supplies.length-1] = _uri;
        _tokensCreated.increment();
        emit URI(_uri, supplies.length-1);
    }

    function getEditionInfo(uint256 tokenId) public view returns(uint256, uint256, uint256) {
        return (supplies[tokenId], minted[tokenId], prices[tokenId]);
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "Balance is 0");
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    function setRoyaltyInfo(address _receiver, uint96 _royaltyFeesInBips) public onlyOwner {
        _setDefaultRoyalty(_receiver, _royaltyFeesInBips);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, ERC2981) returns(bool) {
        return super.supportsInterface(interfaceId);
    }
}