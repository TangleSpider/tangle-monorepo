#include <stdlib.h>
#include <math.h>
#include <stdio.h>
#include <time.h>

int main(int argc, char *argv[]) {
    int n = atoi(argv[1]);
    int lg_n = (int)(log(n) / log(2));
    int mask = (1 << lg_n) - 1;
    int q[bits];
    for (int i = 0; i < n; i++) q[i] = 0;
    int window = 0;
    for (int i = 0; i < lg_n; i++) printf("0");
    for (int i = lg_n; i < n; i++) {
        int new0 = (window << 1) & mask;
        int new1 = new0 | 1;
        if (q[new1] == 0) {
            q[new1] = 1;
            window = new1;
            printf("1");
        } else {
            q[new0] = 1;
            window = new0;
            printf("0");
        }
    }
    printf("\n");
    //printf("%lu\n", clock() - start);
}
