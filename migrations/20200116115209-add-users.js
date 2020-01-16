'use strict';

var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var seed = null;
var async = require('async');

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function(db, callback) {
    async.series([
        db.createTable.bind(db, 'users', {
            id: { type: 'int', primaryKey: true, autoIncrement: true, notNull: true },
            first: { type: 'string', length: 60, notNull: true },
            last: { type: 'string', length: 60, notNull: true },
            email: { type: 'string', length: 60, notNull: true },
            password: { type: 'string', length: 60, notNull: true },
            type_id: { type: 'int', length: 11, notNull: true, defaultValue: 4 }
        }),
        db.insert.bind(db, 'users', ['first', 'last', 'email', 'password', 'type_id'], ['', '', '', '', 0]),
        db.insert.bind(db, 'users', ['first', 'last', 'email', 'password', 'type_id'], ['', '', '', '', 0])
    ], callback);
};

exports.down = function(db, callback) {
    db.dropTable('users', callback);
};

exports._meta = {
    "version": 1
};