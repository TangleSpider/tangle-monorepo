let resetFlag = false;

let resetTable = connection => {
    try {
        connection.query("drop table addLiquidityRequests;", (err, res, field) => {
            initTable(connection);
        });
    } catch (e) {
        console.log(e);
    }
};

let initTable = connection => {
    try {
        connection.query(
            `create table if not exists addLiquidityRequests (
            id int not null unique,
            paymentAmount char(66) not null default "0x0000000000000000000000000000000000000000000000000000000000000000",
            gas0 char(66) not null default "0x0000000000000000000000000000000000000000000000000000000000000000",
            gas1 char(66) not null default "0x0000000000000000000000000000000000000000000000000000000000000000",
            status0 tinyint not null default 0,
            status1 tinyint not null default 0,
            chain0 char(66) not null default "0x0000000000000000000000000000000000000000000000000000000000000000",
            chain1 char(66) not null default "0x0000000000000000000000000000000000000000000000000000000000000000",
            amount0 char(66) not null default "0x0000000000000000000000000000000000000000000000000000000000000000",
            amount1 char(66) not null default "0x0000000000000000000000000000000000000000000000000000000000000000",
            timestamp bigint not null default 0);`,
        (err, res, field) => {
            if (err) {
                console.log(err);
            }
        });
    } catch (e) {
        console.log(e);
    }
};

let initializeAddLiquidityRequests = connection => {
    resetFlag ? resetTable(connection) : initTable(connection);
};

module.exports = exports = initializeAddLiquidityRequests;
