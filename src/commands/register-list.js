function table_name(server_id) {
    return "register_" + server_id;
}

async function create_table(db, table, struct) {
    await db.query("CREATE TABLE " + table + " ( " + struct + " );").then((res) => {
        return true;
    }).catch((err) => {
        console.log("1) " + err);
        return false;
    });
}

module.exports = {
    hide: false,

    name: "register-list",
    description: "List all registered users",
    format: "register-list",
    execution:(db, msg, args) => {
        const server = msg.guild.id;
        const table = table_name(server);
        db.query("SELECT * FROM information_schema.tables WHERE table_name = '" + table + "';").then((res) => {
            if (res.rows.length <= 0) {
                console.log("Creating table " + table + "...");
                if (!create_table(db, table, "name varchar(50)")) {
                    console.log("Couldn't create the table");
                    return msg.channel.send({ embed: {
                        color: 0xd70000,
                        title: "Database error",
                        description: "Sorry an internal error occurs"
                    }});
                }
            }

            db.query("SELECT * FROM " + table + ";").then((res) => {
                const users = res.rows.map((r) => r.name).join(', ');
                console.log(">> " + users);
                return msg.channel.send("Users: " + users);
            }).catch((err) => {
                console.log("2) " + err);
                return msg.channel.send({ embed: {
                    color: 0xd70000,
                    title: "Database error",
                    description: "Sorry an internal error occurs"
                }});
            });
        }).catch((err) => {
            console.log("3) " + err);
            return msg.channel.send({ embed: {
                color: 0xd70000,
                title: "Database error",
                description: "Sorry an internal error occurs"
            }});
        });
    }
}