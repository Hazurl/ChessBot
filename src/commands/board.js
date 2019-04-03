var gm = require('gm');
var fs = require('fs');
var Log = require('../util/Logger.js');
var req = require('request');

var Command = require('../util/Command').Command;

const Discord = require('discord.js');

var board = new Command(["board"])
.set_description("Upload an image of the current game's state, it use the algebric notation")
.set_examples(["board e4 e6 b3 d5 Bb2"])
.set_formats(["board <algebric notation list...>"])
.on_execution((msg, args) => {
    var body = args.join(' ');
    Log.detail(1, "Generate Image for: '" + body + "'");

    req.post({url:'http://chessimg.tppt.eu/image', form: {moves:body}}, function(err, rep, body) {
        body = JSON.parse(body);

        if (err)
            return board.send_error("Image Generator error", "Sorry an internal error occurs");

        if (rep.statusCode == 200) {
            Log.important(1, "Chess Img API >> GET " + body.file);
            return board.send_files([
                body.file
            ]);
        }
        
        Log.warning(1, "Chess Img API >> Status " + rep.statusCode);
        switch(body.status) {
            case 500: // bad move
                return board.send_error("Move Invalid", `'${body.move}' is invalid or unrecognized`);
            case 600: // no arguments
                return board.send_error("Not enough arguments", "board require a list of positions");
            default:
                return board.send_error("Image Generator error", "Sorry an internal error occurs");
        }
    });
});


module.exports = board;