'use strict';

var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var seed;
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
        db.createTable.bind(db, 'user_types', {
            id: { type: 'int', primaryKey: true, autoIncrement: true, notNull: true },
            name: { type: 'string', length: 60, notNull: true }
        }),
        db.insert.bind(db, 'user_types', ['name'], ['admin']),
        db.insert.bind(db, 'user_types', ['name'], ['customer'])
    ], callback);
};

exports.down = function(db, callback) {
    db.dropTable('user_types', callback);
};

exports._meta = {
    "version": 1
};