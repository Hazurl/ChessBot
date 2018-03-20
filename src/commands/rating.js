const Discord = require('discord.js');
const https = require('https');

const request = require('../util/request.js');

const categories_classical = [
    ["Bullet", "bullet"],
    ["Classical", "classical"],
    ["Blitz", "blitz"],
    ["Rapid", "rapid"],
    ["Ultra bullet", "ultraBullet"],
    ["Correspondence", "correspondence"]
];

const categories_variants = [
    ["King of the hill", "kingOfTheHill"],
    ["Puzzle", "puzzle"],
    ["Crazy House", "crazyhouse"],
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
            var embed_classical = new Discord.RichEmbed()
                .setColor(0x00cc66)
                .setTitle(`${user['username']}'s rating on classical`);
    
            for(var category of categories_classical)
                embed_classical.addField(category[0], get_rating(user['perfs'], category), true);

            var embed_variant = new Discord.RichEmbed()
                .setColor(0x00cc66)
                .setTitle(`${user['username']}'s rating on variants`);
    
            for(var category of categories_variants)
                embed_variant.addField(category[0], get_rating(user['perfs'], category), true);

            msg.channel.send({ embed: embed_classical });
            return msg.channel.send({ embed: embed_variant });
        }).catch((err) => {
            console.log(err);
            return msg.channel.send({ embed: {
                color: 0xd70000,
                title: "Player not found in lichess's database",
                description: "Did you mistype ?"
            }});
        });
    }
}