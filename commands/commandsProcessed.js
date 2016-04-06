'use strict';

const commandFactory = require('../lib/commandTemplate');
const _ = require('lodash');

const keys = {
  'total_connections_received': 'redis_total_connections_received',
  'total_commands_processed': 'redis_total_commands_processed',
  'total_net_input_bytes': 'redis_total_net_input_bytes',
  'total_net_output_bytes': 'redis_total_net_output_bytes',
  'keyspace_hits': 'redis_keyspace_hits',
  'keyspace_misses': 'redis_keyspace_misses',
  'instantaneous_ops_per_sec': 'redis_instantaneous_ops_per_sec',
};

module.exports = commandFactory(function commandsProcessed(client, send, log, error) {
  client.infoAsync('Stats').then((data) => {
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
  'redis_commands_processed',
  _.reduce(keys, (a, v) => {return a + '\n  ' + v + ' - uint';}, '')
);
