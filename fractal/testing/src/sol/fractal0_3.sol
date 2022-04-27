// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Fractal {

    struct Validator {
        uint8 bucketId;
        uint index;
        uint stake;
    }

    mapping(address => Validator) public validators;
    mapping(uint8 => address[]) buckets;

    function stake() external payable {
        require(msg.value > 0);
        Validator storage validator = validators[msg.sender];
        Validator memory oldDetails = validator;
        validator.stake += msg.value;
        uint8 newBucketId = log2(oldDetails.stake + msg.value);
        bool bucketChange = newBucketId != oldDetails.bucketId;
        bool freshStake = oldDetails.stake == 0;
        if (!bucketChange && !freshStake) return;
        if (bucketChange && !freshStake) remove(oldDetails.bucketId, oldDetails.index);
        add(newBucketId, msg.sender);
    }

    function unstake(uint amount) external {
        require(amount > 0);
        Validator storage validator = validators[msg.sender];
        Validator memory oldDetails = validator;
        validator.stake -= amount;
        payable(msg.sender).transfer(amount);
        uint8 newBucketId = log2(oldDetails.stake - amount);
        bool bucketChange = newBucketId != oldDetails.bucketId;
        bool noStake = oldDetails.stake - amount == 0;
        if (!bucketChange && !noStake) return;
        if (bucketChange && !noStake) add(newBucketId, msg.sender);
        remove(oldDetails.bucketId, oldDetails.index);
    }

    function log2(uint x) internal pure returns (uint8) {
        for (uint i = 0; i < 8; i++) x |= x >> (1 << i);
        uint db;
        db = 0xFF7E7D7C7B7A79787767574737271706D6C6A6968665646261605514941211;
        unchecked { x = (x * db) >> 248; }
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

    function remove(uint8 bucketId, uint index) internal {
        address[] storage bucket = buckets[bucketId];
        uint lastIndex = bucket.length - 1;
        if (index != lastIndex) {
            address lastAddress = bucket[lastIndex];
            bucket[index] = lastAddress;
            validators[lastAddress].index = index;
        }
        bucket.pop();
    }

    function add(uint8 bucketId, address vaddress) internal {
        address[] storage bucket = buckets[bucketId];
        Validator storage validator = validators[vaddress];
        validator.bucketId = bucketId;
        validator.index = bucket.length;
        bucket.push(vaddress);
    }

    function bucketValidators(uint8 bucketId) external view returns (address[] memory) {
        return buckets[bucketId];
    }

    function bucketLength(uint8 bucketId) external view returns (uint) {
        return buckets[bucketId].length;
    }

    function bucketIndex(
        uint8 bucketId,
        uint index
    ) external view returns (address) {
        return buckets[bucketId][index];
    }

}
