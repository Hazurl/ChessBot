var gm = require('gm');
var fs = require('fs');
var log = require('../util/Logger.js');
var req = require('request');

var Command = require('../util/Command').Command;

const Discord = require('discord.js');

var play = new Command(["play"])
.set_description("Upload an image of the current game's state, it use the algebric notation")
.set_examples(["play e4 e6 b3 d5 Bb2"])
.set_formats(["play <algebric notation list...>"])
.hide(true)
.on_execution((msg, args) => {

    if (args.length <= 0)
        return play.send_error("Not enough arguments", "play require a list of positions");        

    var body = args.join(' ');
    log.detail(1, "Generate Image for: '" + body + "'");

    req.post({url:'http://chessimg.tppt.eu/image', form: {moves:body}}, function(err, rep, body) {
        body = JSON.parse(body);

        if (err)
            return play.send_error("Image Generator error", "Sorry an internal error occurs");

        if (rep.statusCode == 200) {
            log.important(1, "Chess Img API >> GET " + body.file);
            return play.send_files([
                body.file
            ]);
        }
        
        log.warning(1, "Chess Img API >> Status " + rep.statusCode);
        switch(body.status) {
            case 500: // bad move
                return play.send_error("Move Invalid", `'${body.move}' is invalid or unrecognized`);
            case 600: // no arguments
                return play.send_error("Not enough arguments", "play require a list of positions");
            default:
                return play.send_error("Image Generator error", "Sorry an internal error occurs");
        }
    });
});


module.exports = play;