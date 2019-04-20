# mqtt2swissmeteo

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg?style=flat-square)](https://github.com/mqtt-smarthome/mqtt-smarthome)
[![npm](https://img.shields.io/npm/v/mqtt2swissmeteo.svg?style=flat-square)](https://www.npmjs.com/package/mqtt2swissmeteo)
[![travis](https://img.shields.io/travis/claudiospizzi/mqtt2swissmeteo.svg?style=flat-square)](https://travis-ci.org/claudiospizzi/mqtt2swissmeteo)

This node.js application is a bridge between the [MeteoSwiss] service and a mqtt
broker. The bridge can publish the latest weather data from the service to the
target mqtt broker. The data is updated every 15 minutes.

## Installation

This node.js application is installed from the npm repository and executed with
the node command.

```bash
npm install -g mqtt2swissmeteo
node /usr/local/bin/mqtt2swissmeteo
```

Alternatively, the module can be executed as a docker container. Use the
following Dockerfile to build a container injecting the config file.

```dockerfile
FROM node:alpine

RUN npm install -g mqtt2swissmeteo

COPY config.json /etc/mqtt2swissmeteo.json

ENTRYPOINT [ "/usr/local/bin/mqtt2swissmeteo", "/etc/mqtt2swissmeteo.json" ]
```

## Configuration

The following configuration file is an example. Please replace the desired
values like the mqtt url and add the MeteoSwiss weather station. A list of weather stations can be found here: [MeteoSwiss Weather Stations].

```json
{
    "log": "debug",
    "mqtt": {
        "url": "mqtt://192.168.1.10",
        "name": "swissmeteo",
        "secure": false
    },
    "swissmeteo": {
        "pollInterval": 60,
        "weatherStation": {
            "id": "KLO",
            "name": "Zürich Kloten"
        }
    }
}
```

## Topics

### Status messages

Every 15 minutes, the data from MeteoSwiss is updated. As the updated data was loaded, it will publish the values as dedicted topics to MQTT. The following topics would be published for the station *Zürich Kloten*. The latest value is
in the JSON payload with the field `val`.
* `swissmeteo/temperature/Zürich Kloten`
* `swissmeteo/precipitation/Zürich Kloten`
* `swissmeteo/sunshine/Zürich Kloten`
* `swissmeteo/radiation/Zürich Kloten`
* `swissmeteo/humidity/Zürich Kloten`
* `swissmeteo/dewPoint/Zürich Kloten`
* `swissmeteo/windDirection/Zürich Kloten`
* `swissmeteo/windSpeed/Zürich Kloten`
* `swissmeteo/gustPeak/Zürich Kloten`
* `swissmeteo/pressure/Zürich Kloten`

[MeteoSwiss]: https://www.meteoswiss.admin.ch
[MeteoSwiss Weather Stations]: https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/info/VQHA80_en.txt
