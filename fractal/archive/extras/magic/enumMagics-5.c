#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include <time.h>
#include <stdlib.h>
#include <unistd.h>

void main(int argc, char *argv[]) {
    int bits = atoi(argv[1]);
    int lg_bits = (int)(log(bits) / log(2));
    int lg10_bits = (int)(log(bits) / log(10));
    int lg10_max = (int)(log(1ul << bits) / log(10));
    int h_r = bits - lg_bits;
    int q = bits - lg_bits;
    uint64_t f = 1ul << (bits - 1);
    uint64_t max = 1ul << bits;
    uint64_t min = 0;
    for (int i = 0; i < lg_bits; i++, max -= f, f >>= 1);
    for (int i = 0; i < lg_bits; i++, min += f, f >>= 1);
    max -= f;
    min += 1;
    uint64_t mask = (1 << lg_bits) - 1;
    clock_t start = clock();
    for (uint64_t db = min; db < max;) {
        uint64_t v = 0;
        uint64_t v_o = 0;
        char flag = 0;
        printf("%*u: ", lg10_max, db);
        for (int i = 0; i < bits; i++) {
            uint64_t h_x = (((1ul << i) * db) >> h_r) & mask;
            v |= 1ul << h_x;
            if (v == v_o) {
                if (i < q) {
                    flag = 1;
                    db += 1ul << (q - i);
                };
                break;
            }
            v_o = v;
            printf("%*u ", lg10_bits + 1, h_x);
        }
        if (flag == 0) db += 2;
        printf("\n");
    }
    printf("%lu\n", clock() - start);
}
