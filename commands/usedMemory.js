'use strict';

const commandFactory = require('../lib/commandTemplate');
const _ = require('lodash');

const keys = {
  'used_memory': 'redis_used_memory',
  'used_memory_rss': 'redis_used_memory_rss',
  'used_memory_peak': 'redis_used_memory_peak',
  'used_memory_lua': 'redis_used_memory_lua',
};

module.exports = commandFactory(function commandsProcessed(client, send, log, error) {
  client.infoAsync('memory').then((data) => {
    if (!data) {
      return;
    }
    //send('my_ustom_shit', data);
    //console.log(data)
    _.each(keys, (itemKey, name) => {
      const regexp = name + ':(\\d+)';
      var sh = new RegExp(regexp);
      const res = data.match(sh);
      if (res && res.length) {
        send(itemKey, res[1]);
      } else {
        error('pattern ' + name + ' not found', sh);
      }
    });
  });
},
  'redis_used_memory',
  _.reduce(keys, (a, v) => {return a + '\n  ' + v + ' - uint';}, '')
);
