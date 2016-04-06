#!/usr/bin/env node

'use strict';

const moment = require('moment');
const bluebird = require('bluebird');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const redis = require('redis');

const App = {};
App.config = require('./config.json');

bluebird.promisifyAll(redis.RedisClient.prototype);

const client = redis.createClient();

client.on("error", function (err) {
  console.error(err);
  process.exit(1);
});

App.transport = new (require('./lib/transport.normal.js'))(App);
App.client = client;

fs.readdir(path.join(__dirname, 'commands'), (err, files) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  _.each(files, (file) => require(path.join(__dirname, 'commands', file))(App));
});
//
//function _slowLogGetStat() {
//  return client.slowlogAsync('get')
//    .then(function (reply) {
//      const tmp = _.map(reply, function (item) {
//        return {
//          uniqueCommandId: item[0],
//          time:            moment.unix(item[1]).format(),
//          //durationMks:     item[2],
//          durationMs:      item[2] / 1000,
//          //durationS:       item[2] / 10000000,
//          commandInfo:     item[3]
//        };
//      });
//      return {
//        maxDurationMs: _.max(_.map(tmp, 'durationMs')),
//        data:          tmp
//      };
//    });
//}
//
//function _infoKeyspace() {
//  return client.infoAsync('Keyspace')
//    .then(function (reply) {
//      var tmp = reply.split('\r\n').slice(1, -1);
//      const result = {};
//      _.each(tmp, function (item) {
//        let tmp = item.split(':');
//        let tmpVal = {};
//        _.each(tmp[1].split(','), function (str) {
//          tmpVal[str.split('=')[0]] = str.split('=')[1];
//        });
//        tmpVal.keys = parseInt(tmpVal.keys);
//        tmpVal.expires = parseInt(tmpVal.expires);
//        tmpVal.avg_ttl = parseInt(tmpVal.avg_ttl);
//        tmpVal.keysCalc = tmpVal.keys - tmpVal.expires;
//        result[tmp[0]] = tmpVal;
//        return tmp;
//      });
//
//      return {
//        sumKeysCalc: _.reduce(result, function (a, obj) {
//          return a + obj.keysCalc;
//        }, 0),
//
//        data: result
//      };
//    });
//}
//
//function cron() {
//  Promise.all([_slowLogGetStat(), _infoKeyspace()]).then(function (data) {
//    fs.writeFileSync(__dirname + '/_slowLogGetStat.json', JSON.stringify(data[0]));
//    fs.writeFileSync(__dirname + '/_infoKeyspace.json', JSON.stringify(data[1]));
//    process.exit(0);
//  }).catch(function (err) {
//    console.error(err);
//    process.exit(1);
//  });
//}
//
//
//
//switch (process.argv[2]) {
//  case 'cron':
//    cron();
//    break;
//  case 'slowLogGetStat':
//    fs.readFile(__dirname + '/_slowLogGetStat.json', {}, function (err, _obj) {
//      if (err) {
//        console.error(err)
//        process.exit(2);
//      }
//      const obj = JSON.parse(_obj);
//      if ('maxDurationMs' === process.argv[3]) {
//        console.log(obj.maxDurationMs || 0);
//      } else {
//        console.log(JSON.stringify(obj.data, null, 2));
//      }
//      if ('reset' === process.argv[3]) {
//        client.slowlog('reset', function (err, res) {
//          process.exit(err ? 3 : 0);
//        });
//        return;
//      }
//      process.exit(0);
//    });
//    break;
//  case 'infoKeyspace':
//    fs.readFile(__dirname + '/_infoKeyspace.json', {}, function (err, _obj) {
//      if (err) {
//        console.error(err)
//        process.exit(2);
//      }
//      const obj = JSON.parse(_obj);
//      if ('sumKeysCalc' === process.argv[3]) {
//        console.log(obj.sumKeysCalc || 0);
//      } else {
//        console.log(JSON.stringify(obj.data, null, 2));
//      }
//      process.exit(0);
//    });
//    break;
//  default:
//    console.log(
//      'supported commands:\r\n'
//      + [
//        'slowLogGetStat',
//        'slowLogGetStat maxDurationMs',
//        'slowLogGetStat reset',
//        'infoKeyspace',
//        'infoKeyspace sumKeysCalc'
//      ].join('\r\n')
//    );
//    process.exit(0);
//}
