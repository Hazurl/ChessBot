const https = require('https');

module.exports = {
    request: (link) => {
        console.log(`:: request to '${link}'`);
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
    },

    lichess: (api) => {
        return module.exports.request(`https://lichess.org/api/${api}`);
    },

    user: (username) => {
        console.log(`:: request user '${username}'`);
        return module.exports.lichess(`user/${username}`);
    },

    status: (username) => {
        console.log(`:: request status '${username}'`);
        return module.exports.lichess(`users/status?ids=${username}`);
    }
};