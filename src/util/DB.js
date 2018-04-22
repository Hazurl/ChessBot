const Client = require('pg').Client;

const log = require("./Logger.js");

class Table {
    constructor(name, variables) {
        this.name = name;
        this.variables = variables;
    }

    query_construct() {
        return `CREATE TABLE ${this.name} ( ${this.variables.join(', ')} );`;
    }

    query_insert(values) {
        return `INSERT INTO ${this.name} VALUES ${values.reduce((vs, v) => {
            return vs === '' ? `(${v})` : vs + `, (${v})`;
        }, '')};`;
    }

    query_select(columns, where) {
        return `SELECT ${columns} FROM ${this.name} ${where ? 'WHERE ' + where : ''}`;
    }

    query_update(columns, where) {
        return `UPDATE ${this.name} SET ${columns} ${where ? 'WHERE ' + where : ''}`;
    }

    query_delete(where) {
        return `DELETE FROM ${this.name} WHERE ${where}`;
    }
}

class DB {
    constructor(connectionString) {
        log.info(0, `Database >> Connecting to ${connectionString}`);
        this.client = new Client({ connectionString });
        this.client.connect()
            .then (()    => log.important(0, "Database >> Successfully connected"))
            .catch((err) => log.error(0, "Database >> Connection failed (", err, ")"));
    }

    query(q) {
        log.detail(2, "Database >> " + q);
        return this.client.query(q);
    }

    static generate_table_uid(name, server_id) {
        return `${name}_${server_id}`;
    }

    ensure_table_exists(table) {
        return new Promise((res, rej) => {
            return this.query(table.query_construct()).then((r) => {
                log.important(1, "Database >> Create table " + table.name);
                res(r);
            }).catch((err) => {
                if (err.code != "42P07") {
                    log.error(1, "Database >>", err);
                    return rej(err);
                }
                return res();
            });
        });
    }

    insert(table, values) {
        return this.query(table.query_insert(values));
    }

    select(table, cols, where) {
        return this.query(table.query_select(cols, where));
    }

    update(table, cols, where) {
        return this.query(table.query_update(cols, where));
    }

    del(table, where) {
        return this.query(table.query_delete(where));
    }

}

module.exports = {
    DB,
    Table,

    make_register_table: (id) => new Table(
        DB.generate_table_uid("register", id), [
            "discord BIGSERIAL UNIQUE", 
            "lichess VARCHAR(50) UNIQUE", 
            "PRIMARY KEY(discord, lichess)", 
            "UNIQUE(discord, lichess)"
        ])
}