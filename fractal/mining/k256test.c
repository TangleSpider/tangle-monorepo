#include "keccak256.h"
#include <stdio.h>
#include <string.h>

int main() {
    const unsigned char data[32] = { 0 };
    unsigned char result[32] = { 0 };

    SHA3_CTX context;
    keccak_init(&context);
    keccak_update(&context, data, 0);
    keccak_final(&context, result);
    memset((char *)&context, 0, sizeof(SHA3_CTX));

    for (int i = 0; i < 32; i++) printf("%02x", result[i]);
    printf("\n");

    return 0;
}
