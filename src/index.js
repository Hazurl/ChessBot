const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
const prefix = '%'; 
const token = process.env.CHESS_BOT_TOKEN;//require('../res/token.json')["token"];
var commands = {};

const commands_folder = __dirname + '/commands/';
fs.readdirSync(commands_folder).forEach(file => {
    var command = require(commands_folder + '/' + file);
    if (!command.hide)
        commands[command.name] = command;
});

function get_channel(name) {
    return client.channels.filter((channel) => channel.name === name).first();
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

commands['help'] = {
    name: "help",
    description: "Gives you command information",
    format: "help\nhelp <command>",
    execution: function(msg, args) {
        if (args.length) {
            const command = commands[args[0]];
            if (typeof command == "undefined") {
                var embed = new Discord.RichEmbed()
                    .setColor(0xd70000)
                    .setTitle("Unknown command")
                    .setDescription(`Type ${prefix}help to get commands informations`);
                return msg.channel.send({ embed });
            }
            var embed = new Discord.RichEmbed()
                .setColor(0x3399ff)
                .setTitle(`${command.name.capitalize()}`)
                .setDescription(command.description)
                .addField('Format', command.format);
            return msg.channel.send({ embed });
        }

        var desc = '**Commands**\n```asciidoc\n';
        for(var command_name in commands) {
            if (!commands.hasOwnProperty(command_name)) continue;
            const command = commands[command_name];
            if ('description' in command)
                desc += `${command.name.padEnd(10)}:: ${command.description}\n`
        }

        msg.channel.send(desc + '```');
    }    
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(prefix + 'help  |  v0.2', { type: 'PLAYING' }).then(() => {}).catch((err) => console.log(err));
});

client.on('message', msg => {
    if (!msg.content.startsWith(prefix))
        return;

    const contents = msg.content.substr(1).split(' ');

    if (contents.length && contents[0] in commands)
        return commands[contents[0]].execution(msg, contents.slice(1));

    msg.channel.send({ embed: {
        color: 0xff0000,
        title: "Unknown command",
        description: `type ${prefix}help`
    }});

});

console.log("Connecting...");
client.login(token).then((token) => {
    console.log(':: client.login success');
}).catch((err) => {
    console.log(':: client.login failed: ', err);
});