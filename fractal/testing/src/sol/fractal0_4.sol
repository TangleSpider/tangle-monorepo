// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Fractal {

    using ValLib for Val;
    using MathLib for uint;

    function stake() external payable {
        require(msg.value > 0);
        mapping(address => Val) storage atov = StuffLib.getStuff().atov;
        Val storage val = atov[msg.sender];
        if (val.id == address(0)) val.id = msg.sender;
        val.stake += msg.value;
        val.update();
    }

    function unstake(uint amount) external {
        require(amount > 0);
        mapping(address => Val) storage atov = StuffLib.getStuff().atov;
        Val storage val = atov[msg.sender];
        val.stake -= amount;
        payable(msg.sender).transfer(amount);
        val.update();
    }

    function pick() external returns (address) {
        uint8[] storage cans = StuffLib.getStuff().cans;
        require(cans.length == 0);
        uint rand = uint(blockhash(block.number - 1));
        uint8 x = rand.log2();
        mapping(uint8 => Can) storage itoc = StuffLib.getStuff().itoc;
        Can storage can = itoc[cans[x < cans.length ? cans[x] : cans[0]]];
        uint index = x % can.vals.length;
        return can.vals[index];
    }

    function getCans() external view returns (uint8[] memory) {
        return StuffLib.getStuff().cans;
    }

    function getItoc(uint8 id) external view returns (Can memory) {
        return StuffLib.getStuff().itoc[id];
    }

    function getAtov(address id) external view returns (Val memory) {
        return StuffLib.getStuff().atov[id];
    }

}

struct Val {
    bool active;
    uint8 can;
    address id;
    uint index;
    uint stake;
}
struct Can {
    bool active;
    uint8 id;
    uint index;
    address[] vals;
}
struct Stuff {
    uint8[] cans;
    mapping(uint8 => Can) itoc;
    mapping(address => Val) atov;
}

library StuffLib {

    function getStuff() internal pure returns (Stuff storage stuff) {
        bytes32 slot = keccak256("data");
        assembly { stuff.slot := slot }
    }

}

library ValLib {

    using MathLib for uint;
    using CanLib for Can;

    function update(Val storage self) internal {
        mapping(uint8 => Can) storage itoc = StuffLib.getStuff().itoc;
        uint8 stale = self.can;
        uint8 fresh = self.stake.log2();
        if (itoc[stale].id == 0) itoc[stale].id = stale;
        if (itoc[fresh].id == 0) itoc[fresh].id = fresh;
        if (self.active && (self.stake == 0 || fresh != stale))
            itoc[stale].remove(self);
        if (!self.active && self.stake > 0) itoc[fresh].add(self);
    }

}

library CanLib {

    using CansLib for uint8[];

    function add(Can storage self, Val storage val) internal {
        address[] storage vals = self.vals;
        if (vals.length == 0) StuffLib.getStuff().cans.add(self);
        val.active = true;
        val.can = self.id;
        val.index = vals.length;
        vals.push(val.id);
    }

    function remove(Can storage self, Val storage val) internal {
        address[] storage vals = self.vals;
        mapping(address => Val) storage atov = StuffLib.getStuff().atov;
        Val storage last = atov[vals[vals.length - 1]];
        if (val.id != last.id) {
            vals[val.index] = last.id;
            last.index = val.index;
        }
        self.vals.pop();
        val.active = false;
        val.can = 0;
        val.index = 0;
        if (self.vals.length == 0) StuffLib.getStuff().cans.remove(self);
    }

}

library CansLib {

    function add(uint8[] storage self, Can storage can) internal {
        can.active = true;
        can.index = self.length;
        self.push(can.id);
    }

    function remove(uint8[] storage self, Can storage can) internal {
        uint8[] storage cans = StuffLib.getStuff().cans;
        mapping(uint8 => Can) storage itoc = StuffLib.getStuff().itoc;
        Can storage last = itoc[cans[cans.length - 1]];
        if (can.id != last.id) {
            cans[can.index] = last.id;
            last.index = can.index;
        }
        self.pop();
        can.active = false;
        can.index = 0;
    }

}

library MathLib {

    function log2(uint self) pure internal returns (uint8) {
        for (uint i = 0; i < 8; i++) self |= self >> (1 << i);
        uint db;
        db = 0xFF7E7D7C7B7A79787767574737271706D6C6A6968665646261605514941211;
        unchecked { self = (self * db) >> 248; }
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
        ][self];
    }

}
