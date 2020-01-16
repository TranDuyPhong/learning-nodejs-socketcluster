var Users = {};
var async = require('async');

Users.index = function(client, pool, data) {
    var results = {
        success: 0,
        message: 'Failed to get users',
        notify: 'users-index'
    };

    function finish() {
        client.emit('response', results);
    }

    async.series([
        function(callback) {
            var getAllUsers = 'SELECT * FROM users';
            pool.query(getAllUsers, function(err, users) {
                if (err) {
                    console.error(err);
                } else {
                    results.users = users;
                }
                callback();
            });
        }
    ], finish);
}

module.exports = Users;