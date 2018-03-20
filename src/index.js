const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
const prefix = '$'; 
const token = process.env.CHESS_BOT_TOKEN;//require('../res/token.json')["token"];
var commands = {};

const commands_folder = __dirname + '/commands/';
fs.readdirSync(commands_folder).forEach(file => {
    var command = require(commands_folder + '/' + file);
    commands[command.name] = command;
});

function get_channel(name) {
    return client.channels.filter((channel) => channel.name === name).first();
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/*
commands['search'] = function(msg, contents) {
    if (contents.length < 2) {
        return msg.channel.send({ embed: {
            color: 0xff0000,
            title: "Not Enough arguments",
            description: "search require a username in parameter"
        }});
    }

    return https.get(`https://lichess.org/api/user/${contents[1]}`, resp => {
        if (resp.statusCode != 200) {
            return msg.channel.send({ embed: {
                color: 0x0000ff,
                title: "Player not found on lichess",
                description: "Did you mistype ?"
            }});
        }

        var data = '';
        resp.on('data', chunk => {
            data += chunk;
        })
        resp.on('end', () => {
            var json = JSON.parse(data);
            var points = [
                ["Bullet", "bullet"],
                ["Classical", "classical"],
                ["Blitz", "blitz"],
                ["King of the hill", "kingOfTheHill"],
                ["Puzzle", "puzzle"],
                ["Crazy House", "crazyhouse"],
                ["Rapid", "rapid"],
                ["Ultra bullet", "ultraBullet"],
                ["Correspondence", "correspondence"],
                ["Chess 960", "chess960"],
                ["Atomic", "atomic"],
                ["Racing king", "racingKings"],
                ["Horde", "horde"],
                ["Three check", "threeCheck"]
            ];
            var desc = `
Lichess : **[${json["username"]}](${json["url"]})**
Online : ${json["online"]}`
            var embed = new Discord.RichEmbed()
                .setColor(0x0000ff)
                .setTitle(`Player ${json["username"]} found`)
                .setDescription(desc)
                .setFooter('[ok](google.com)');
            for(var category of points) {
                embed.addField(category[0], (json["perfs"][category[1]] || {'rating' : 'Unranked'})["rating"], true);
            }
            return msg.channel.send({ embed });
        });
    }).on('error', err => {
        return msg.channel.send({ embed: {
            color: 0x0000ff,
            title: "Player not found on lichess",
            description: "Did you mistype ?"
        }});
    });
};
*/

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
client.login(token);