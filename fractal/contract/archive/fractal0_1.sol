// SPDX-License-Identifier: none
pragma solidity ^0.8.13;

contract Fractal {

    struct Trade {
        uint8 status;
        uint32 start;
        uint32 delay;
        address buyer;
        address seller;
        uint cost;
        uint tax;
        bytes product;
        uint wMin;
        uint[2] w;
        //uint yW;
        //uint nW;
        uint id;
    }
    struct Claim {
        bool wType;
        uint32 start;
        uint id;
    }

    Trade[] public trades;
    //mapping(uint => mapping(bool => mapping(address => uint))) public w;
    mapping(address => mapping(uint => uint[2])) public w;
    //mapping(uint => mapping(address => bool)) public paid;
    mapping(address => mapping(uint => bool)) public paid;

    function init(
        uint cost,
        bytes calldata product,
        uint32 delay,
        uint tax,
        uint minW
    ) external payable {
        require((cost == 0) != (msg.value == 0));
        trades.push(Trade(
            0,
            0,
            delay,
            msg.value > 0 ? msg.sender : address(0),
            cost > 0 ? msg.sender : address(0),
            cost | msg.value - tax,
            tax,
            product,
            minW,
            0,
            0,
            trades.length
        ));
    }

    function accept(uint id) external payable {
        Trade storage trade = trades[id];
        require(
            trade.status == 0 &&
            (
                msg.value == trade.cost + trade.tax &&
                trade.buyer == address(0)
            ) !=
            (msg.value == 0 && trade.seller == address(0))
        );
        msg.value == 0 ? trade.seller = msg.sender : trade.buyer = msg.sender;
        trade.status = 1;
        trade.start = uint32(block.timestamp);
    }

    function execute(uint id) external {
        Trade storage trade = trades[id];
        require(
            trade.status == 1 &&
            uint32(block.timestamp) - trade.start >= trade.delay &&
            trade.yW + trade.nW >= trade.minW &&
            trade.yW != trade.nW
        );
        payable(
            trade.yW > trade.nW ? trade.seller : trade.buyer
        ).transfer(trade.cost - trade.tax);
        trade.status = 2;
    }

    function submit(uint nonce, Claim[] calldata claims) external {
        bytes32 hash = keccak256(abi.encode(nonce, claims));
        uint work = 1 << 255 - log2(uint(hash));
        for (uint i = 0; i < claims.length; i++) {
            Claim memory claim = claims[i];
            Trade storage trade = trades[claim.id];
            if(!(
                trade.status == 1 &&
                claim.start == trade.start &&
                uint32(block.timestamp) >= trade.start + trade.delay
            )) continue;
            w[trade.id][claim.wType][msg.sender] += work;
            if (claim.wType) trade.yW += work;
            else trade.nW += work;
        }
    }

    function redeem(uint id) external {
        Trade storage trade = trades[id];
        uint work = w[id][trade.yW > trade.nW][msg.sender];
        require(
            trade.status == 2 &&
            work > 0 &&
            paid[id][msg.sender] == false
        );
        uint total = trade.yW > trade.nW ? trade.yW : trade.nW;
        payable(msg.sender).transfer(trade.tax * work / total);
        paid[id][msg.sender] = true;
    }

    function log2(uint x) internal pure returns (uint8) {
        for (uint i = 0; i < 8; i++) x |= x >> (1 << i);
        uint db;
        db = 0xFF7E7D7C7B7A79787767574737271706D6C6A6968665646261605514941211;
        unchecked { x = x * db >> 248; }
        return [
              0, 210,   1, 237, 211, 127,   2, 246,
            238, 212, 202, 168, 128,  68,   3, 251,
            247, 239, 194, 223, 213, 203, 119, 189,
            169, 145, 129,  97,  69,  37,   4, 252,
            243, 248, 186, 240, 229, 195, 111, 232,
            224, 214, 178, 204, 160, 120,  60, 198,
            190, 174, 170, 154, 146, 130, 103, 114,
             98,  82,  70,  54,  38,  22,   5, 253,
            235, 244, 166, 249, 221, 187,  95, 241,
            227, 230, 158, 196, 152, 112,  52, 233,
            219, 225, 150, 217, 215, 179,  87, 205,
            181, 161, 137, 121,  89,  61,  29, 207,
            199, 191, 142, 183, 175, 171,  79, 163,
            155, 147, 134, 139, 131, 104,  44, 123,
            115, 107,  99,  91,  83,  75,  71,  63,
             55,  47,  39,  31,  23,  15,   6, 254,
            209, 236, 126, 245, 201, 167,  67, 250,
            193, 222, 118, 188, 144,  96,  36, 242,
            185, 228, 110, 231, 177, 159,  59, 197,
            173, 153, 102, 113,  81,  53,  21, 234,
            165, 220,  94, 226, 157, 151,  51, 218,
            149, 216,  86, 180, 136,  88,  28, 206,
            141, 182,  78, 162, 133, 138,  43, 122,
            106,  90,  74,  62,  46,  30,  14, 208,
            125, 200,  66, 192, 117, 143,  35, 184,
            109, 176,  58, 172, 101,  80,  20, 164,
             93, 156,  50, 148,  85, 135,  27, 140,
             77, 132,  42, 105,  73,  45,  13, 124,
             65, 116,  34, 108,  57, 100,  19,  92,
             49,  84,  26,  76,  41,  72,  12,  64,
             33,  56,  18,  48,  25,  40,  11,  32,
             17,  24,  10,  16,   9,   8,   7, 255
        ][x];
    }

}
