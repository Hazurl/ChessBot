const Discord = require('discord.js');

const Command = require("../util/Command.js").Command;
const Log = require("../util/Logger.js");
const db = require("../bot/database.js").database;

function set_role(command, from, to, role_id, server_id) {
    const serversTable = db.get_servers_table();

    Log.info(1, `Updating role info ${from}-${to} ${role_id}`);

    new Promise((res, rej) =>
            serversTable.ensure_exists()
            .then(() => {
                return serversTable.ensure_key_exists("server_id", server_id);
            }).then(() => {
                return serversTable.get_role_info(server_id);
            })
            .then((res) => {
                res = res.rows[0].role_info;
                if (!res) res = "[]";
                var role_info = JSON.parse(res);
                var newRange;
                for (var i = 0; i < role_info.length; i++) {
                    let role = role_info[i];
                    if (role.from >= from && role.to <= to) {
                        /* This isn't great, because I am tired, so refactor it later
                         * Ideally, no two values would overlap, so if 300-500 was a range,
                         * and 400-700 was added, 300-500 would become 300-399.
                         * for now I am just going to loop through it by most recent
                         * first so that the effect is the same for the user, and
                         * this if statement is a lazier version of what I described
                         * where the existing role will be replaced if it is "engulfed"
                         * by the new role (for example, 500-800 "engulfs" 600-700) */
                         newRange = i;
                         break;
                    }
                }
                if (!newRange) newRange = role_info.push({})-1;
                role_info[newRange] = {from: from, to: to, role_id: role_id};
                return role_info;
            })
            .then((role_info) => {
                serversTable.update_role_info(server_id, role_info);
                res();
            })
            .catch((err) => {
                if (err) {
                    command.send_error("Database Error", `Sorry we couldn't process your request`);            
                    Log.error(1, "Database >>", err);
                }
                rej(err); 
            })
        )
        .then(() => command.send_response("Role successfully set", `Hooray!`));
}

var setrole = new Command(["setrole", "sr"])
.set_description("Associate a role with a specified elo range")
.set_formats(["setrole <from-to> <role_id>\t\t**[Admin only]**"])
.set_examples(["setrole 1500-1800 435174939667202048"])
.on_execution((msg, args) => {
    if (args.length < 2)
        return setrole.send_error("Not enough arguments", "setrole requires an elo range (X-Y, no spaces) and role id as parameters");
    else if (args.length > 2)
        return setrole.send_error("Too many arguments", "setrole requires an elo range (X-Y, no spaces) and role id as parameters");

    let [from, to] = args[0].split("-").map(i => parseInt(i));
    let role_id = args[1];
    const server = msg.guild;
    const isAdmin = msg.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR);
    if (!isAdmin)
        return setrole.send_error("Administrator only", "This command can only be executed by an administrator");

    if (isNaN(from) || isNaN(to))
        return setrole.send_error("ELO range not formatted correctly. Should be Number-Number");
    
    if (from > to) {
        let _to = to;
        to = from;
        from = _to;
    }
    
    var role = server.roles.get(role_id);
    if (!role)
        return setrole.send_error("The provided role id is invalid", "That's all we know");
    set_role(setrole, from, to, role_id, server.id);
});

module.exports = setrole;