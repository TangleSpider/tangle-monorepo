#include <stdio.h>
#include <unistd.h>
#include <stdint.h>

int main() {
    printf("%llx\n", -(__uint128_t)1);
    int i = 0;
    for (; i < 8 - 1; i++) {
        int pid = fork();
        if (pid == -1) {
            perror("fork() failed");
            return 1;
        }
        if (pid == 0) break;
    }
    for (uint64_t j = 0; j < 1ul << 32; j++);
    printf("%i done\n", i);
    fflush(stdout);
    int pid;
    return 0;
}
