test process
    startchain &
    compile $FILE.sol &
    wait
    deploy $CONTRACT
    run test
    endchain
