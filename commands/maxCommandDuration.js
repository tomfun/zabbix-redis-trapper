'use strict';

const commandFactory = require('../lib/commandTemplate');
const _ = require('lodash');
const moment = require('moment');

module.exports = commandFactory(function commandDuration(client, send, log, error, App) {
    client.slowlogAsync('get').then((reply) => {
      let tmp = _.map(reply, function (item) {
        return {
          uniqueCommandId: item[0],
          time:            moment.unix(item[1]).format(),
          //durationMks:     item[2],
          durationMs:      item[2] / 1000,
          //durationS:       item[2] / 10000000,
          commandInfo:     item[3]
        };
      });
      if (!tmp.length) {
        return;
      }
      tmp = {
        maxDurationMs: _.max(_.map(tmp, 'durationMs')),
        data:          tmp
      };
      send('redis_max_command_duration', tmp.maxDurationMs);
      send('redis_command_statistic', JSON.stringify(tmp.data, null, 2)).then(() => {
        if (App.config.redis_max_command_duration_clear_after_send) {
          return client.slowlog('reset');
        }
      });
    });
  },
  'redis_max_command_duration',
  `
  redis_max_command_duration - uint
  redis_command_statistic - text
  `);
