// External modules
const Discord = require('discord.js');
const fs = require('fs');

// Internal modules
const DB = require("./util/DB.js").DB;
const Command = require("./util/Command.js").Command;
const log = require("./util/Logger.js");
const bot = require("./bot/bot.js").bot;
const db = require("./bot/database.js").database;

// Discord, BDD
const client = bot.get_client();
const _db = new DB(process.env.CHESS_BOT_DB);
bot.db = _db;

/*
const prefix = '%'; 
var commands = [];
const enable_dev_mode = typeof process.env.CHESS_BOT_DEV_MODE != "undefined";
*/

const commands_folder = __dirname + '/commands/';
fs.readdirSync(commands_folder).forEach(file => {
    var command = require(commands_folder + '/' + file);
    if (bot.add_command(command))
        log.detail(0, "Add Command " + command.names.join(", "));
});

/*
function get_command(c) {
    for(var i = 0; i < commands.length; ++i) {
        if (commands[i].is(c) && (enable_dev_mode || !commands[i].hidden))
            return commands[i];
    }
    return null;
}

client.on('ready', () => {
    log.important(0, `Discord >> Logged in as ${client.user.tag}`);
    client.user.setActivity(prefix + 'help  |  v0.2', { type: 'PLAYING' }).then(() => {}).catch((err) => log.err(0, err));
});

client.on('message', msg => {
    if (!msg.content.startsWith(prefix))
        return;

    const contents = msg.content.substr(1).split(' ');
    log.info(0, `Received: ${contents.join(' ')}`);

    if (contents.length >= 1) {
        const command = get_command(contents[0]);

        if (command !== null) {
            log.info(1, "✓ Command found");
            return command.execute(msg, contents.slice(1), db, app_info);
        }
    }

    log.warning(1, "✘ Command not found");
    msg.channel.send({ embed: {
        color: 0xff0000,
        title: "Unknown command",
        description: `type ${prefix}help`
    }});

});

log.info(0, `Discord >> Connecting to ${process.env.CHESS_BOT_TOKEN}`);
client.login(process.env.CHESS_BOT_TOKEN).then((token) => {
    log.important(0, "Discord >> Successfully connected");
}).catch((err) => {
    log.error(0, "Discord >> Connection failed (" + err + ")");
});
*/