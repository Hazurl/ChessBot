const Discord = require('discord.js');
const https = require('https');

const request = require('../util/request.js');

function request_user_and_status(username, on_data, on_error) {
    console.log(`:: request_user_and_status '${username}'`);
    return Promise.all([request.status(username), request.user(username)]);
}

module.exports = {
    name: "search",
    description: "Search for a user in the Lichess's database",
    format: "search <username>",
    execution: (msg, args) => {
        if (args.length < 1) {
            return msg.channel.send({ embed: {
                color: 0xd70000,
                title: "Not Enough arguments",
                description: "search require a username in parameter"
            }});
        }

        request_user_and_status(args[0]).then((req) => {
            const user = req[1];
            const status = req[0][0];
            var desc = `Lichess account : **[${status["name"]}](${user["url"]})**\n`;
            if (status['online']) {
                if (status['playing']) {
                    desc += `[Playing...](${user['playing']})`
                } else
                    desc += `Online`;
            }
            var embed = new Discord.RichEmbed()
                .setColor(0xccff33)
                .setTitle(`Player ${status['name']} found`)
                .setDescription(desc);

            return msg.channel.send({ embed });
        }).catch((err) => {
            return msg.channel.send({ embed: {
                color: 0xd70000,
                title: "Player not found in lichess's database",
                description: "Did you mistype ?"
            }});
        });
    }
}