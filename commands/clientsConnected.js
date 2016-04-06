'use strict';

const commandFactory = require('../lib/commandTemplate');

module.exports = commandFactory(function clientsConnected(client, send, log, error) {
  client.infoAsync('clients').then((data) => {
    if (!data) {
      return;
    }
    send('redis_clients_connected', data.match(/connected_clients:(\d+)/)[1]);
    send('redis_clients_longest_output_list', data.match(/client_longest_output_list:(\d+)/)[1]);
    send('redis_clients_biggest_input_buf', data.match(/client_biggest_input_buf:(\d+)/)[1]);
    send('redis_clients_blocked', data.match(/blocked_clients:(\d+)/)[1]);
  });
},
  'redis_clients_connected',
  `
  redis_clients_connected - uint
  redis_clients_longest_output_list - uint
  redis_clients_biggest_input_buf - uint
  redis_clients_blocked - uint
  `);
