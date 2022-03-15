#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <math.h>

typedef uint8_t u8;
typedef uint32_t u32;
typedef uint64_t u64;
typedef u32 *mag;
typedef struct {
    mag mag;
    u8 size;
} big;

big *big_ini(u32 v, u8 size) ;
big *big_bit(u32 v);
void big_sho(big *b);
void big_mul(big *z, big *x, big *y);
void big_add(big *z, big *x, big *y);
void big_rsh(big *z, big *x, int y);
void big_fre(big *b);

void main() {
    for (int i = 0; i < 256; i++) {
        big *a = big_bit(i);
        big_sho(a);
        big_fre(a);
    }
    /*big *a = big_ini(3690752814, 1);

    big_mul(a, a, a);
    big_sho(a);

    big_mul(a, a, a);
    big_sho(a);

    big_mul(a, a, a);
    big_sho(a);

    big_add(a, a, a);
    big_sho(a);*/

    //big_add(

    // right shift x 121
    // mask size s 8
    /*int x = 223;
    int s = 14;
    int mask = (1 << s) - 1;
    int i = a->size - 1 - (x >> 5);
    x &= 0x1F;
    int ans = (a->mag[i] >> x) & mask;
    if (x > 32 - s) ans |= (a->mag[--i] << (32 - x)) & mask;
    printf("ANS %u\n", ans);*/

    //big_fre(a);
    /*big_sho(b);
    for (int i = 0; i < 255; i++) {
        if (b->mag[0] >> 31 == 1) {
            b->size++;
            u32 *tmp = malloc(sizeof(u32) * b->size);
            tmp[0] = 1;
            free(b->mag);
            b->mag = tmp;
        } else b->mag[0] <<= 1;
        big_sho(b);
    }
    big_fre(b);*/
    /*for (int i = 0; i < 256; i++) {
        printf("%llx\n", 1 << i);
    }*/
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
    printf("\n");
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
    free(z->mag);
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
