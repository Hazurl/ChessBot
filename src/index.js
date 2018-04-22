// External modules
const Discord = require('discord.js');
const fs = require('fs');

// Internal modules
const DB = require("./util/DB.js").DB;
const Command = require("./util/Command.js").Command;
const Log = require("./util/Logger.js");
const bot = require("./bot/bot.js").bot;
const db = require("./bot/database.js").database;

// Discord, BDD
const client = bot.get_client();
const _db = new DB(process.env.CHESS_BOT_DB);
bot.db = _db;

const commands_folder = __dirname + '/commands/';
fs.readdirSync(commands_folder).forEach(file => {
    var command = require(commands_folder + '/' + file);
    if (bot.add_command(command))
        Log.detail(0, "Add Command " + command.names.join(", "));
});
