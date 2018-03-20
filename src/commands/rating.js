const Discord = require('discord.js');
const https = require('https');

const categories = [
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

function get_rating(perfs, category) {
    const infos = perfs[category[1]];
    if (typeof infos == "undefined")
        return "Unranked";
    return infos['rating'] + ((typeof infos['prov'] == "undefined") ? '' : '?');
}

function request(link) {
    return new Promise((res, rep) => {
        https.get(link, resp => {
            if (resp.statusCode != 200) {
                return rep({ status_code: resp.statusCode });
            }
            var data = '';
            resp.on('data', chunk => data += chunk )
            return resp.on('end', () => res(JSON.parse(data)) );
        }).on('error', err => {
            return rep(err);
        });
    });
}

function request_user(username, on_data, on_error) {
    console.log(":: request_user");
    return request(`https://lichess.org/api/user/${username}`).then(on_data).catch(on_error);
}

module.exports = {
    name: "rating",
    description: "Search for rating of a user in the Lichess's database",
    format: "rating <username>",
    execution: (msg, args) => {
        if (args.length < 1) {
            return msg.channel.send({ embed: {
                color: 0xd70000,
                title: "Not Enough arguments",
                description: "rating require a username in parameter"
            }});
        }

        request_user(args[0], (user) => {
            var embed = new Discord.RichEmbed()
                .setColor(0x00cc66)
                .setTitle(`${user['username']}'s rating`);
    
                for(var category of categories)
                    embed.addField(category[0], get_rating(user['perfs'], category), true);

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