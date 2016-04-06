'use strict';

const log = require('debug')('transport');
const error = require('debug')('transport:error');
const ZabbixSender = require('node-zabbix-sender');

class TransportZabbixSender {
  constructor(App) {
    this.config = App.config;
    this.sender = new ZabbixSender({
      host:            this.config.zabbix_server,
      port:            this.config.zabbix_port,
      with_timestamps: true,
      items_host:      this.config.zabbix_agent_hostname
    });

    process.stdin.resume();//so the program will not close instantly
    function exitHandler(options, err) {
      if (options.cleanup) this._send(() => {if (options.exit) process.exit()});
      //if (err) console.log(err.stack);
      //if (options.exit) process.exit();
    }

//do something when app is closing
    process.on('exit', exitHandler.bind(this, {cleanup: true}));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(this, {exit: true, cleanup: true}));

    ////catches uncaught exceptions
    //process.on('uncaughtException', exitHandler.bind(this, {exit:true}));


    this.intervalToken = setInterval(() => this._send(), 120000)
    this.intervalToken.unref();
  }

  _send(cb) {
    if (!this.sender.countItems()) {
      if (cb) {
        cb();
      }
      return;
    }
    this.sender.send((err, res, items) => {
      if (err) {
        error(err);
      }
      if (res) {
        if (res.info) {
          const response = res.info.match(/processed:\s*(\d+);\s*failed:\s*(\d+);\s*total:\s*(\d+)/);
          if (response) {
            if (response[2] > 0) {
              error(Math.round(100 * response[2] / response[3]) + ' items failed');
            } else {
              log(response[1] + ' items success sent')
            }
          }
        }

        log(res);
      }
      if (items && items.length) {
        log(items);
      }
      if (cb) {
        cb();
      }
    });
  }

  send(key, value, hostname, time) {
    this.sender.items.push({
      host:  hostname ? hostname : this.config.zabbix_agent_hostname,
      key:   key,
      value: value,
      clock: time | Date.now() / 1000 | 0
    });

    //if (this.with_timestamps) {
    //  this.items[length - 1].clock = Date.now() / 1000 | 0;
    //}
    //this.sender.addItem.apply(this.sender, hostname ? [hostname, key, value] : [key, value]);
    return Promise.resolve();
  }
}

module.exports = TransportZabbixSender;