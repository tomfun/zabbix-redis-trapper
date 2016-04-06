# zabbix-redis-trapper
## Install
- At monitored server (where placed zabbix agent)
  - install latest node (for example 5 or higher)
  - npm install -g pm2
  - git clone ... to some dir, cd ...
  - cp configExample.json config.json
  - change config.json, especial  
  ```json
  {
    "zabbix_server": "178.169.48.125",
    "zabbix_port": "10051",
    "zabbix_agent_hostname": "test"
    //...
  }
  ```
  - pm2 start pm2.json
- At zabbix server
  - Enter to admin panel
  - import zbx_template.xml
