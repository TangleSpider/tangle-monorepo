// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/** @title Algorithm - Algorithm helper functions
    @author Brad Brown **/
contract Algorithm {

    // tested - success
    function _mergeSort(
        uint[] memory a
    ) internal pure returns (uint[] memory) {
        if (a.length <= 1) return a;
        uint l = a.length;
        uint[] memory L = new uint[](l / 2);
        uint[] memory R = new uint[](l - l / 2);
        for (uint i; i < l; i++) i < l / 2 ? L[i] = a[i] : R[i - l / 2] = a[i];
        return _merge(_mergeSort(L), _mergeSort(R));
    }

    function _merge(
        uint[] memory L,
        uint[] memory R
    ) internal pure returns (uint[] memory a) {
        a = new uint[](L.length + R.length);
        uint iL = 0;
        uint iR = 0;
        uint l = a.length;
        for (uint i; i < l; i++) {
            if (iL == L.length) { a[i] = R[iR++]; continue; }
            if (iR == R.length) { a[i] = L[iL++]; continue; }
            a[i] = L[iL] > R[iR] ? L[iL++] : R[iR++];
        }
    }

}
