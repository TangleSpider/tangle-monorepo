// SPDX-License-Identifier: 0BSD

pragma solidity ^0.8.7;

interface IERC721Receiver {
    function onERC721Received(address operator, address from, address token, bytes calldata data) external returns (bytes4);
}

contract TestERC721 {

    uint public totalSupply;
    string public name = "Meta";
    string public symbol = "META";
    string public baseURI = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/";
    address public feeTo;

    mapping(address => address) public ownerOf;
    mapping(address => uint) public balanceOf;
    mapping(address => address) public tokenApprovals;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(address => address[]) public tokensOfOwner;
    mapping(address => mapping(address => uint)) public indexOfTokenInTokensOfOwner;

    struct Offer {
        bool isForSale;
        address token;
        address seller;
        uint minValue;
        address onlySellTo;
    }

    struct Bid {
        bool hasBid;
        address token;
        address bidder;
        uint value;
    }

    mapping (uint => Offer) public tokensOfferedForSale;
    mapping (uint => Bid) public tokenBids;

    constructor() {
        feeTo = msg.sender;
    }

    function mint(address to, address token) public {
        require(ownerOf[token] == address(0), "cannot mint already owned token");
        ownerOf[token] = to;
        tokensOfOwner[to].push(token);
        indexOfTokenInTokensOfOwner[to][token] = balanceOf[to];
        balanceOf[to]++;
        emit Transfer(address(0), to, token);
        totalSupply++;
    }

    function tokenURI(address token) public view returns (string memory) {
        return string(abi.encodePacked(baseURI, toString(token)), "/logo.png");
    }

    function approve(address to, address token) public {
        require(msg.sender == ownerOf[token] || isApprovedForAll[ownerOf[token]][msg.sender], "ERC721: approve caller is not owner nor approved for all");
        tokenApprovals[token] = to;
        emit Approval(ownerOf[token], to, token);
    }

    function getApproved(address token) public view returns (address) {
        return tokenApprovals[token];
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "ERC721: approve to caller");
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, address token) public {
        require(_isApprovedOrOwner(msg.sender, token), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, token);
    }

    function _isApprovedOrOwner(address spender, address token) internal view returns (bool) {
        return (spender == ownerOf[token] || getApproved(token) == spender || isApprovedForAll[ownerOf[token]][spender]);
    }

    function _transfer(address from, address to, address token) internal {
        require(ownerOf[token] == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "cannot transfer to zero address");
        tokenApprovals[token] = address(0);
        if (balanceOf[from] > 1 && indexOfTokenInTokensOfOwner[from][token] != balanceOf[from] - 1) {
            tokensOfOwner[from][indexOfTokenInTokensOfOwner[from][token]] = tokensOfOwner[from][balanceOf[from] - 1];
            tokensOfOwner[from].pop();
        }
        if (balanceOf[from] == 1) {
            delete tokensOfOwner[from];
        }
        balanceOf[from]--;
        tokensOfOwner[to].push(token);
        indexOfTokenInTokensOfOwner[to][token] = balanceOf[to];
        balanceOf[to]++;
        ownerOf[token] = to;
        if (tokensOfferedForSale[token].isForSale) tokenNoLongerForSale(token);
        Bid memory bid = tokenBids[token];
        if (bid.bidder == to) {
            payable(bid.bidder).transfer(bid.value);
            tokenBids[token] = Bid(false, token, address(0), 0);
        }
        emit Transfer(from, to, token);
    }

    function tokenNoLongerForSale(address token) public {
        require(_isApprovedOrOwner(msg.sender, token), "not owner or approved");
        tokensOfferedForSale[token] = Offer(false, token, msg.sender, 0, address(0));
        emit TokenNoLongerForSale(token);
    }

    function offerTokenForSale(address token, uint minSalePriceInWei, address toAddress) public {
        require(_isApprovedOrOwner(msg.sender, token), "not owner or approved");
        tokensOfferedForSale[token] = Offer(true, token, msg.sender, minSalePriceInWei, toAddress);
        emit TokenOffered(token, minSalePriceInWei, toAddress);
    }

    function offerTokenForSale(address token, uint minSalePriceInWei) public {
        require(_isApprovedOrOwner(msg.sender, token), "not owner or approved");
        tokensOfferedForSale[token] = Offer(true, token, msg.sender, minSalePriceInWei, address(0));
        emit TokenOffered(token, minSalePriceInWei, address(0));
    }

    function buyToken(uint token) payable public {
        Offer memory offer = tokensOfferedForSale[token];
        require(offer.isForSale, "token not for sale");
        require(offer.onlySellTo == address(0) || offer.onlySellTo == msg.sender, "cannot buy restricted token sale");
        require(msg.value >= offer.minValue, "offer too low");
        require(offer.seller == ownerOf[token], "token owner changed since offer was made");
        tokenNoLongerForSale(token);
        _transfer(offer.seller, msg.sender, token);
        payable(offer.seller).transfer(msg.value);
        emit TokenBought(token, msg.value, offer.seller, ownerOf[token]);
        Bid memory bid = tokenBids[token];
        if (bid.bidder == msg.sender) {
            payable(msg.sender).transfer(bid.value);
            tokenBids[token] = Bid(false, token, address(0), 0);
        }
    }

    function enterBidForToken(address token) payable public {
        require(ownerOf[token] != address(0), "token not owned");
        require(ownerOf[token] != msg.sender, "cannot bid on your own token");
        require(msg.value > 0, "invalid bid amount");
        Bid memory existing = tokenBids[token];
        require(msg.value > existing.value, "bid not greater than highest existing bid");
        if (existing.value > 0) payable(existing.bidder).transfer(existing.value);
        tokenBids[token] = Bid(true, token, msg.sender, msg.value);
        emit TokenBidEntered(token, msg.value, msg.sender);
    }

    function acceptBidForToken(address token, uint minPrice) public {
        require(_isApprovedOrOwner(msg.sender, token), "not owner or approved");
        Bid memory bid = tokenBids[token];
        address seller = ownerOf[token];
        require(bid.value > 0, "highest bid value must be greater than zero");
        require(bid.value >= minPrice, "bid must be greater than minimum price");
        tokenBids[token] = Bid(false, token, address(0), 0);
        _transfer(ownerOf[token], bid.bidder, token);
        tokensOfferedForSale[token] = Offer(false, token, bid.bidder, 0, address(0));
        payable(seller).transfer(bid.value);
        emit TokenBought(token, bid.value, ownerOf[token], bid.bidder);
    }

    function withdrawBidForToken(address token) public {
        Bid memory bid = tokenBids[token];
        require(bid.bidder == msg.sender, "not bidder");
        emit TokenBidWithdrawn(token, bid.value, msg.sender);
        tokenBids[token] = Bid(false, token, address(0), 0);
        payable(msg.sender).transfer(bid.value);
    }

    function toString(address x) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(x));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function safeTransferFrom(address from, address to, address token) public {
        require(_isApprovedOrOwner(msg.sender, token), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, token, "");
    }

    function safeTransferFrom(address from, address to, address token, bytes memory data) public {
        require(_isApprovedOrOwner(msg.sender, token), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, token, data);
    }

    function _safeTransfer(address from, address to, address token, bytes memory _data) internal virtual {
        _transfer(from, to, token);
        require(_checkOnERC721Received(from, to, token, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    function _checkOnERC721Received(address from, address to, address token, bytes memory data) private returns (bool) {
        if (isContract(to)) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, token, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    function isContract(address account) internal view returns (bool) {
        uint size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    function tokenByIndex(uint index) public pure returns (uint) {
        return index;
    }

    function tokenOfOwnerByIndex(address owner, uint index) public view returns (uint) {
        require(index < balanceOf[owner], "index out of bounds");
        return tokensOfOwner[owner][index];
    }

    function ethBalanceOf(address _address) public view returns (uint) {
        return address(_address).balance;
    }

    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event Approval(address indexed owner, address indexed approved, address indexed token);
    event Transfer(address indexed from, address indexed to, address indexed token);
    event TokenOffered(address indexed token, uint minValue, address indexed toAddress);
    event TokenBidEntered(address indexed token, uint value, address indexed fromAddress);
    event TokenBidWithdrawn(address indexed token, uint value, address indexed fromAddress);
    event TokenBought(address indexed token, uint value, address indexed fromAddress, address indexed toAddress);
    event TokenNoLongerForSale(address indexed token);

}
