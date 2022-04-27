#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include <time.h>
#include <stdlib.h>

void main(int argc, char *argv[]) {
    int bits = atoi(argv[1]);
    int lg_bits = (int)(log(bits) / log(2));
    int lg10_bits = (int)(log(bits) / log(10));
    int h_r = bits - lg_bits;
    uint64_t mask = (1 << lg_bits) - 1;
    clock_t start = clock();
    for (uint64_t db = 0; db < 1lu << bits; db++) {
        //printf("%*u: ", (int)(log(bits) / log(2)), db);
        for (int i = 0; i < bits; i++) {
            uint64_t h_x = (((1ul << i) * db) >> h_r) & mask;
            //printf("%*u ", lg10_bits + 1, h_x);
        }
        //printf("\n");
    }
    printf("%lu\n", clock() - start);
}
