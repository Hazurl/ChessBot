var gm = require('gm');
var fs = require('fs');

const Discord = require('discord.js');
var Chess = require('chess.js').Chess;

module.exports = {
    name: "play",
    description: "Upload an image of the current game's state, it use the algebric notation",
    format: "play <notation-list>",
    execution:(msg, args) => {
        var chess = new Chess();

        console.log(chess.ascii());

        for(var i = 0; i < args.length; ++i) {
            console.log('move ' + args[i]);
            if (!chess.move(args[i])) {
                return msg.channel.send({ embed: {
                    color: 0xd70000,
                    title: "Invalid Move",
                    description: "The move '" + args[i] + "' is impossible or unrecognized"
                }});
            }
        }

        console.log(chess.ascii());

        var img = gm('img/chessboard.png') .resize(320, 320);
        for(var x = 0; x < 8; ++x) {
            for(var y = 0; y < 8; ++y) {
                var p = chess.get(String.fromCharCode(97 + x) + (y+1));
                if (p)
                    img.draw('image', 'over', 40*x, 280-40*y, 40, 40, 
                        `img/${p.type.toUpperCase()}${p.color.toUpperCase()}.png`);
            }                
        }
        
        img.write('temp/output.png', (err) => {
            if(err) {
                console.log(err);
                return msg.channel.send({ embed: {
                    color: 0xd70000,
                    title: "Technical issue",
                    description: "Sorry I can't give you the image... try to imagine it ?"
                }});
            }
            msg.channel.send({ files: [
                'temp/output.png'
            ]});
        });
    }
}