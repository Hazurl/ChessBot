const Discord = require('discord.js');
const https = require('https');

function request(link, on_data, on_error) {
    https.get(link, resp => {
        if (resp.statusCode != 200) {
            return on_error({ status_code: resp.statusCode });
        }
        var data = '';
        resp.on('data', chunk => data += chunk )
        return resp.on('end', () => on_data(JSON.parse(data)) );
    }).on('error', err => {
        return on_error(err);
    });
}

function request_user(username, on_data, on_error) {
    console.log(":: request_user");
    return request(`https://lichess.org/api/user/${username}`, on_data, on_error);
}

function request_status(username, on_data, on_error) {
    console.log(":: request_status");
    return request(`https://lichess.org/api/users/status?ids=${username}`, on_data, on_error);
}

function request_user_and_status(username, on_data, on_error) {
    console.log(":: request_user_and_status");
    var end = false;
    var user_data, status_data;

    request_status(username, (data) => {
        status_data = data;
        console.log("Receive status");
        if(end)
            return on_data(user_data, status_data);
        end = true;
    }, on_error);

    request_user(username, (data) => {
        user_data = data;
        console.log("Receive user");
        if(end)
            return on_data(user_data, status_data);
        end = true;
    }, on_error);
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

        request_user_and_status(args[0], (user, status) => {
            var desc = `Lichess account : **[${status[0]["name"]}](${user["url"]})**\n`;
            if (status[0]['online']) {
                if (status[0]['playing']) {
                    desc += `[Playing...](${user['playing']})`
                } else
                    desc += `Online`;
            }
            var embed = new Discord.RichEmbed()
                .setColor(0xccff33)
                .setTitle(`Player ${status[0]['name']} found`)
                .setDescription(desc);

            return msg.channel.send({ embed });
        }, (err) => {
            return msg.channel.send({ embed: {
                color: 0xd70000,
                title: "Player not found in lichess's database",
                description: "Did you mistype ?"
            }});
        });
    }
}