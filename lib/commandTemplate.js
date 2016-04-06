'use strict';
const debug = require('debug');

module.exports = function commandBuilder(command, name, description) {
  const log = debug(name);
  const error = debug(name + ':error');

  log(description);

  return function (App) {
    function sender() {
      try {
        command(App.client, App.transport.send.bind(App.transport), log, error, App);
        log('executed')
      } catch (e) {
        error(e);
      }
    }
    setInterval(function () {
      sender();
    }, App.config[name] * 1000).unref();
    log('loaded');
    sender();
  }
};