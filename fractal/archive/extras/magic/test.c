#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <gmp.h>
#include <time.h>
#include <string.h>

void main(int argc, char *argv[]) {
    time_t start;
    int bits = atoi(argv[1]);
    int bitlog = ceil(log(bits)/log(2));
    mpz_t rand, pow2, mask, hx, ofmask;
    mpz_inits(rand, pow2, mask, hx, ofmask, NULL);
    mp_ptr hxl = mpz_limbs_modify(hx, 2);
    mp_ptr randl = mpz_limbs_modify(rand, 1);
    mp_ptr ofmaskl = mpz_limbs_modify(ofmask, 2);
    mpz_limbs_finish(ofmask, 2);
    mp_ptr maskl = mpz_limbs_modify(mask, 1);
    mpz_limbs_finish(mask, 1);
    for (int b = 0; b < bits - bitlog; b++) mpz_setbit(mask, b);
    for (int b = 0; b < bits; b++) mpz_setbit(ofmask, b);
    char lookup[] = { 0, 1 };
    int indicies[bits];
    for (int i = 0; i < bits; i++) indicies[i] = -1;

    //for (int q = 0; q < 1000; q++) {
        //start = clock() * 1000000 / CLOCKS_PER_SEC;
        for (unsigned long loopcount = 0;; loopcount++) {
            mpz_limbs_finish(rand, 1);
            mpn_random(randl, rand->_mp_size);
            mpz_setbit(rand, 0);
            mpn_and_n(randl, randl, maskl, 1);
            //gmp_printf("%0*Zx\n", bits / 4, rand);
            mpz_set_ui(pow2, 0);
            char overlap = 0x0;
            for (int i = 0; i < bits; i++) {
                mpz_setbit(pow2, i);
                hxl[0] = 1;
                hxl[1] = 1;
                mpz_limbs_finish(hx, 2);
                mpn_mul_n(hxl, rand->_mp_d, pow2->_mp_d, rand->_mp_size);
                mpn_and_n(hxl, ofmaskl, hxl, 2);
                mpn_rshift(hxl, hxl, hx->_mp_size, bits - bitlog);
                overlap = lookup[indicies[mpz_get_ui(hx)] > -1];
                if (overlap) break;
                indicies[mpz_get_ui(hx)] = i;
            }
            if (overlap == 0x0) {
                //printf("NO OVERLAP\n");
                gmp_printf("%0*Zx\n", bits / 4, rand);
                /*printf("[");
                for (int i = 0; i < bits; i++)
                    printf("%u%s", indicies[i], i == bits - 1 ? "" : ", ");
                printf("]\n");*/
                //return;
            }
            for (int i = 0; i < bits; i++) indicies[i] = -1;
            //if (loopcount % 10000000 == 0) printf("%u\n", loopcount);
        }
        //printf("%u\n", clock() * 1000000 / CLOCKS_PER_SEC - start);
    //}

    mpz_clears(rand, pow2, mask, hx, ofmask, NULL);
    return;

}
