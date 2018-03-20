const Discord = require('discord.js');
const https = require('https');

const request = require('../util/request.js');

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

        request.user(args[0]).then((user) => {
            var embed = new Discord.RichEmbed()
                .setColor(0x00cc66)
                .setTitle(`${user['username']}'s rating`);
    
            for(var category of categories)
                embed.addField(category[0], get_rating(user['perfs'], category), true);

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