const cli = require("cli-color");

function formatted_time() {
    const t = new Date();
    const h = t.getHours().toString().padStart(2, '0');
    const m = t.getMinutes().toString().padStart(2, '0');
    const s = t.getSeconds().toString().padStart(2, '0');
    return cli.blackBright(`[${h}:${m}:${s}]`);
}

function prefix(indent) {
    return formatted_time() + '    '.repeat(indent);
}

function make_logger(l) {
    return function(n) {
        if (typeof n != "number")
            console.log("You forget the prefix, noob");
        console.log(prefix(n) + ' ' + l.apply(this, Array.from(arguments).slice(1)));
    };
}

module.exports = {
    detail :    make_logger(cli.white),
    info :      make_logger(cli.green),
    important : make_logger(cli.bold.blue),
    warning :   make_logger(cli.bold.yellowBright),
    error :     make_logger(cli.bold.red),
};