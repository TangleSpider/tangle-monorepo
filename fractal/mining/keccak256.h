#ifndef KECCAK256_H
#define KECCAK256_H

#include <stdint.h>

#define SHA3_MAX_PERMUTATION_SIZE 25
#define SHA3_MAX_RATE_IN_QWORDS 24

typedef struct SHA3_CTX {
    uint64_t hash[SHA3_MAX_PERMUTATION_SIZE];
    uint64_t message[SHA3_MAX_RATE_IN_QWORDS];
    uint16_t rest;
} SHA3_CTX;

void keccak_init(SHA3_CTX *ctx);

void keccak_update(SHA3_CTX *ctx, const unsigned char *msg, uint16_t size);

void keccak_final(SHA3_CTX *ctx, unsigned char* result);

#endif
