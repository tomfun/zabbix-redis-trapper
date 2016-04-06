'use strict';

const commandFactory = require('../lib/commandTemplate');
const _ = require('lodash');
const moment = require('moment');

module.exports = commandFactory(function commandDuration(client, send, log, error, App) {
    client.infoAsync('Keyspace')
      .then(function (reply) {
        let tmp = reply.split('\r\n').slice(1, -1);
        const result = {};
        _.each(tmp, function (item) {
          let tmp = item.split(':');
          let tmpVal = {};
          _.each(tmp[1].split(','), function (str) {
            tmpVal[str.split('=')[0]] = str.split('=')[1];
          });
          tmpVal.keys = parseInt(tmpVal.keys);
          tmpVal.expires = parseInt(tmpVal.expires);
          tmpVal.avg_ttl = parseInt(tmpVal.avg_ttl);
          tmpVal.keysCalc = tmpVal.keys - tmpVal.expires;
          result[tmp[0]] = tmpVal;
          return tmp;
        });

        tmp = {
          sumKeysCalc: _.reduce(result, function (a, obj) {
            return a + obj.keysCalc;
          }, 0),

          data: result
        };
      send('redis_keys_sum', tmp.sumKeysCalc || 0);
      _.each(result, (obj, dbName) => send(`redis_keys_${dbName}`, obj.keys));
      send('redis_stats_keys', JSON.stringify(tmp.data, null, 2));
    });
  },
  'redis_stats_keys',
  `
  redis_keys_sum - uint
  redis_stats_keys - text
  redis_keys_{dbName} - uint (dbName - name of redis storage, for example db0, db1...)
  `);
