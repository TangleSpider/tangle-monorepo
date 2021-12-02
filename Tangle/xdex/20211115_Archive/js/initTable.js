let dropTable = (connection, table) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `drop table if exists
            ${table.name}`,
        (err, res) => {
            if (err) throw err;
            if (!err) resolve(null);
        });
    });
};

let createTable = (connection, table) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `create table if not exists ${table.name}
            (${table.createDefinition})`,
        async (err, res) => {
            if (err) throw err;
            if (!err) {
                if (table.postCreate) await table.postCreate(connection);
                resolve(null);
            }
        });
    });
};

let initTable = (connection, table) => {
    return new Promise(async (resolve, reject) => {
        if (table.reset) {
            await dropTable(connection, table);
            console.log(`Table ${table.name} dropped if exists`);
        }
        let exists = await createTable(connection, table);
        console.log(`Table "${table.name}" created if not exists`);
        resolve(null)
    });
};

module.exports = exports = initTable;
