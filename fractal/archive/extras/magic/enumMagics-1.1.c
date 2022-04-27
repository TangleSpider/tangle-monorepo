#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include <time.h>
#include <stdlib.h>

typedef uint8_t u8;
typedef uint32_t u32;
typedef uint64_t u64;
typedef u32 *mag;
typedef struct {
    mag mag;
    u8 size;
} big;

big *big_ini(u32 v, u8 size);
big *big_bit(u32 v);
void big_sho(big *b);
void big_mul(big *z, big *x, big *y);
void big_add(big *z, big *x, big *y);
void big_rsh(big *z, big *x, int y);
void big_fre(big *b);

void main(int argc, char *argv[]) {
    int bits = atoi(argv[1]);
    int lg_bits = (int)(log(bits) / log(2));
    int lg10_bits = (int)(log(bits) / log(10));
    int h_r = bits - lg_bits;
    int mask = (1 << lg_bits) - 1;
    big **big_bits = malloc(sizeof(big) * 256);
    for (int i = 0; i < 256; i++) big_bits[i] = big_bit(i);
    big *x = malloc(sizeof(big));
    x->mag = NULL;
    clock_t start = clock();
    for (u64 db = 0; db < 1lu << bits; db++) {
        printf("%u: ", db);
        for (int i = 0; i < bits; i++) {
            big *big_db = big_ini(db, 1);

            // assign big_bit in loop
                /*big *x = big_bit(i);
                big_mul(x, x, big_db);
                int i = x->size - 1 - (h_r >> 5);
                h_r &= 0x1F;
                int ans = (x->mag[i] >> h_r) & mask;
                if (h_r > 32 - lg_bits) ans |= (x->mag[--i] << (32 - h_r)) & mask;
                printf("%u ", ans);*/

            // pre-assign big_bits and pre-allocate xs
                big_mul(x, big_bits[i], big_db);
                int i = x->size - 1 - (h_r >> 5);
                h_r &= 0x1F;
                int ans = (x->mag[i] >> h_r) & mask;
                if (h_r > 32 - lg_bits) ans |= (x->mag[--i] << (32 - h_r)) & mask;
                printf("%u ", ans);

            big_fre(big_db);
        }
        printf("\n");
    }
    printf("%lu\n", clock() - start);
    for (int i = 0; i < 256; i++) {
        big_fre(big_bits[i]);
        big_fre(xs[i]);
    }
    free(xs);
}

big *big_ini(u32 v, u8 size) {
    big *b = malloc(sizeof(big));
    b->size = size;
    b->mag = malloc(sizeof(u32) * size);
    b->mag[0] = v;
    for (int i = 1; i < size; i++) b->mag[i] = 0;
    return b;
}

void big_sho(big *b) {
    if (b->size == 0) {
        //printf("%u", b->mag[0]);
        printf("%x", b->mag[0]);
    } else {
        //printf("%u ", b->mag[0]);
        printf("%x", b->mag[0]);
        for (int i = 1; i < b->size; i++) {
            //printf("%u ", b->mag[i]);
            printf("%08x", b->mag[i]);
        }
    }
    printf(" ");
}

big *big_bit(u32 v) {
    int size = (v >> 5) + 1;
    big *b = malloc(sizeof(big));
    b->size = size;
    b->mag = malloc(sizeof(u32) * size);
    b->mag[0] = 1 << (v & 0x1F);
    for (int i = 1; i < size; i++) b->mag[i] = 0;
    return b;
}

void big_mul(big *z, big *x, big *y) {
    int xsize = x->size;
    int ysize = y->size;
    int msize = xsize + ysize;
    mag m = malloc(sizeof(u32) * msize);
    for (int i = 0; i < msize; i++) m[i] = 0;
    for (int i = xsize - 1; i >= 0; i--) {
        for (int j = ysize - 1; j >= 0; j--) {
            u64 product = (u64)x->mag[i] * y->mag[j] + m[i + j + 1];
            m[i + j + 1] = (u32)product;
            u64 carry = (product >> 32) + m[i + j];
            m[i + j] = (u32)carry;
            if (carry >= (u64)1 << 32) m[i + j - 1] = carry >> 32;
        }
    }
    if (z->mag != NULL) free(z->mag);
    z->size = msize;
    z->mag = m;
}

void big_add(big *z, big *x, big *y) {
    big *a;
    big *b;
    if (x->size > y->size) { a = x; b = y; }
    else { a = y; b = x; }
    int msize = a->size + 1;
    mag m = malloc(sizeof(u32) * msize);
    for (int i = 0; i < msize; i++) m[i] = 0;
    for (int i = a->size - 1; i >= 0; i--) {
        u64 sum = (u64)a->mag[i] + b->mag[i] + m[i + 1];
        m[i + 1] = (u32)sum;
        u64 carry = sum >> 32;
        m[i] = (u32)carry;
    }
    free(z->mag);
    z->size = msize;
    z->mag = m;
}

void big_fre(big *b) {
    free(b->mag);
    free(b);
}
