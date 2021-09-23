let resetFlag = false;

let resetTable = connection => {
    try {
        connection.query("drop table pairs;", (err, res, field) => {
            initTable(connection);
        });
    } catch (e) {
        console.log(e);
    }
};

let initTable = connection => {
    try {
        connection.query(
            `create table if not exists pairs (
            pair char(42) not null,
            token0 char(42) not null,
            token1 char(42) not null,
            reserve0 char(66) not null,
            reserve1 char(66) not null
            );`,
        (err, res, field) => {
            if (err) {
                console.log(err);
            }
        });
    } catch (e) {
        console.log(e);
    }
};

let initializePairsTable = connection => {
    resetFlag ? resetTable(connection) : initTable(connection);
};

module.exports = exports = initializePairsTable;
