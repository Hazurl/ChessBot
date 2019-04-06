const Discord = require('discord.js');

const Command = require("../util/Command.js").Command;
const Log = require("../util/Logger.js");
const db = require("../bot/database.js").database;

var bot = require("../bot/bot.js").bot;
var client = bot.get_client();
var whois = require('./whois.js');

const request = require('../util/request.js');

function do_update(command, member, server_id) {
    const serversTable = db.get_servers_table();
    Log.info(1, `Updating role for user: ${member.id}`);

    new Promise((res, rej) =>
            serversTable.ensure_exists()
            .then(() => {
                return serversTable.ensure_key_exists("server_id", server_id);
            }).then(() => {
                return serversTable.get_role_info(server_id);
            })
            .then((res) => {
                res = res.rows[0].role_info;
                var role_info = JSON.parse(res);
                if (!role_info) {
                    Log.error(1, "Returning %update because no role info");
                    return;
                }
                var role_id;
                whois.execute({guild: client.guilds.get(server_id), channel:{send:function(){}}}, [`<@${member.id}>`], bot.db, {}).then((lichess) => {
                    if (!lichess) return;
                    request.user(lichess).then((user) => {
                        var elo;
                        if (user && user['perfs'] && user['perfs']['blitz'] && user['perfs']['blitz']['rating'])
                            elo = parseInt(user['perfs']['blitz']['rating']);
                        else
                            elo = -1;
                        for (var i = 0; i < role_info.length; i++) {
                            let role = role_info[i];
                            if (role.from <= elo && role.to >= elo) {
                                role_id = role.role_id;
                            } else if (member.roles.has(role.id)) {
                                member.removeRole(role.id).then(()=>{}).catch((e) => {
                                    Log.error(1, "Role >> No permissions");
                                    command.send_error("Hmm..", "I don't have the necessary permissions.");
                                    return;
                                });
                                Log.error(1, `Role >> ${role.id} removed from ${member.id} (Updating role).`);
                            }
                        }
                        if (!role_id) {
                            Log.error(1, "Role >> No role applicable.");
                            return;
                        } else {
                            member.addRole(role_id).then(() => {
                                Log.error(1, "Role >> Role given (update)");
                            }).catch((e) => {
                                Log.error(1, "Role >> No permissions");
                                command.send_error("Hmm..", "I don't have the necessary permissions.");
                                return;
                            });
                        }
                    });
                });
            })
            .catch((err) => {
                if (err && command) {
                    command.send_error("Database Error", `Sorry we couldn't process your request`);            
                    Log.error(1, "Database >>", err);
                }
                rej(err); 
            })
        )
        .then(() => {
            if (command) command.send_response("Successfully updated", `Hooray!`)
        });
}

var update = new Command(["update", "ud"])
.set_description("Update ELO")
.set_formats(["update", "update <user_id> \t\t**[Admin only]**"])
.set_examples(["update"])
.on_execution((msg, args) => {
    if (args.length > 1)
        return update.send_error("Too many arguments", "No parameters are required");

    var server = msg.guild;
    var user = msg.member;
    if (args[0]) {
        let user_id = args[0];
        let isAdmin = msg.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR);
        if (!isAdmin)
            return update.send_error("Administrator only", "This command can only be executed by an administrator");
        user = server.members.get(user_id);
        if (!user)
            return update.send_error("Incorrect user id", "The user could not be found");

    }
    do_update(update, user, server.id);
});

module.exports = update;