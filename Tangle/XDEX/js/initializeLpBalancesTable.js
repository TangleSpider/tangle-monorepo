let resetFlag = false;

let resetTable = connection => {
    try {
        connection.query("drop table lpBalances;", (err, res, field) => {
            initTable(connection);
        });
    } catch (e) {
        console.log(e);
    }
};

let initTable = connection => {
    try {
        connection.query(
            `create table if not exists lpBalances (
            pair char(42) not null,
            owner char(42) not null,
            amount char(66) not null);`,
        (err, res, field) => {
            if (err) {
                console.log(err);
            }
        });
    } catch (e) {
        console.log(e);
    }
};

let initializeLpBalancesTable = connection => {
    resetFlag ? resetTable(connection) : initTable(connection);
};

module.exports = exports = initializeLpBalancesTable;
