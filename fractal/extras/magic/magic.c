#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <math.h>
#include <time.h>

typedef struct {
    uint8_t size;
    uint32_t *mag;
} BigInt;

/*BigInt *bi_malloc(uint64 n);
void bi_free(BigInt *big);*/

void main(int argc, char *argv[]) {
    /*BigInt *x = bi_malloc(9956441263769355295u);
    BigInt *y = bi_malloc(17436644173799851315u);*/

    // (x * deBruijn) >> (n lg n)
    // n is bits
    // test first for b = 8, 16, 32
    //FILE *fp = fopen("deBruijn-Dickinson-8-magics.csv", "w");
    //fprintf(fp, "db, len\n");
    /*printf("db, ");
    for (int i = 0; i < 8 - 1; i++) {
        printf("hx_%i, ", i);
    }
    printf("hx_%i\n", 8 - 1);*/
    /*fprintf(fp, "db, ");
    for (int i = 0; i < 32 - 1; i++) {
        fprintf(fp, "hx_%i, ", i);
    }
    fprintf(fp, "hx_%i\n", 32 - 1);*/
    for (int n = 64; n <= 64; n <<= 1) {
        int lg_n = (int)(log(n) / log(2));
        int h_r = n - lg_n;
        uint64_t mask = (1 << lg_n) - 1;
        /*uint64_t mdb = (1 << (h_r - 1)) + 1;
        uint64_t Mdb = ((1 << (lg_n + 1)) - 1) << (h_r - 1);*/
        clock_t start = clock();
        //printf("%i\n\n", n/*, mdb, Mdb*/);
        int h[64];
        //for (uint64_t db = 1; db < 1lu << n; db += 2) {
            uint64_t db = 283881115759776437lu;
            //fprintf(fp, "%0*u, ", lg_n, db);
            uint64_t v = 0;
            uint64_t v_o = 0;
            char flag = 0;
            uint64_t i = 0;
            for (uint64_t x = 1; i < n; i++, x |= 1 << i /*x = 1ul << i*/) {
                uint64_t h_x = ((x * db) >> h_r) & mask;
                printf("%02u, ", h_x);
                h[i] = h_x;
                v |= 1ul << h_x;
                if (v == v_o) {
                    flag = 1;
                    break;
                }
                v_o = v;
            }
            //printf("\n");
            if (flag == 0) {
                printf("%0*lu ", (int)(log(db) / log(10)), db);
                for (int i = 0; i < n - 1; i++) {
                    printf("%u, ", h[i]);
                }
                printf("%u\n", h[n - 1]);
            }
            /*if (flag == 0) {
                fprintf(fp, "%0*u, ", lg_n, db);
                for (int i = 0; i < n - 1; i++) {
                    fprintf(fp, "%u, ", h[i]);
                }
                fprintf(fp, "%u\n", h[n - 1]);
            }*/
            //if (flag == 0) fprintf(fp, "%0*u, %u\n", lg_n, db);
            //printf("%u\n", i);
            //fprintf(fp, "%u\n", i);
        //}
        //printf("\n%u\n\n", clock() - start);
    }
    //fclose(fp);

    /*bi_free(y);
    bi_free(x);*/
}

/*BigInt *bi_malloc(uint8 size, ) {
    BigInt *big = malloc(sizeof(BigInt));
    big->size = size;
    big->mag = (uint32 *)malloc(sizeof(uint32) * size);
    big->mag[0] = n >> 32;
    big->mag[1] = n & 0xFFFFFFFF;
    return big;
}

void bi_free(BigInt *big) {
    free(big->mag);
    free(big);
}*/
