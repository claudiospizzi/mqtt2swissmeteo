# mqtt2swissmeteo

[![mqtt-smarthome](https://img.shields.io/badge/mqtt-smarthome-blue.svg?style=flat-square)](https://github.com/mqtt-smarthome/mqtt-smarthome)
[![npm](https://img.shields.io/npm/v/mqtt2swissmeteo.svg?style=flat-square)](https://www.npmjs.com/package/mqtt2swissmeteo)
[![travis](https://img.shields.io/travis/claudiospizzi/mqtt2swissmeteo.svg?style=flat-square)](https://travis-ci.org/claudiospizzi/mqtt2swissmeteo)

This node.js application is a bridge between the [MeteoSwiss] service and a mqtt
broker. The bridge can publish the latest weather data from the service to the
target mqtt broker. The source data is updated every 15 minutes.

## Installation

This node.js application is installed from the npm repository and executed with
the node command. It will load the default configuration file *config.json*.

```bash
npm install -g mqtt2swissmeteo
node /usr/local/bin/mqtt2swissmeteo
```

Alternatively, the module can be executed as a docker container. Use the
following Dockerfile to build a container by injecting the config file.

```dockerfile
FROM node:alpine

RUN npm install -g mqtt2swissmeteo

COPY config.json /etc/mqtt2swissmeteo.json

ENTRYPOINT [ "/usr/local/bin/mqtt2swissmeteo", "/etc/mqtt2swissmeteo.json" ]
```

## Configuration

The following configuration file is an example. Please replace the desired
values like the mqtt url and add the MeteoSwiss weather station. A list of
weather stations can be found here: [MeteoSwiss Weather Stations].

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

### Publish (status messages)

Every 15 minutes, the data from MeteoSwiss is updated. As the updated data was
loaded, it will publish the values as dedicated topics to MQTT. The following
topics are be published for the station *Zürich Kloten*. The latest value is in
the JSON payload field `val`.
* `swissmeteo/temperature/Zürich Kloten`  
  Current air temperature 2 meter above ground in `°C`.
* `swissmeteo/precipitation/Zürich Kloten`  
  Total precipitation during the last ten minutes in `mm`.
* `swissmeteo/sunshine/Zürich Kloten`  
  Total sunshine duration during the last ten minutes in `min`.
* `swissmeteo/radiation/Zürich Kloten`  
  Mean global radiation during the last ten minutes in `W/m²`.
* `swissmeteo/humidity/Zürich Kloten`  
  Current relative air humidity 2 meter above ground in `%`.
* `swissmeteo/dewPoint/Zürich Kloten`  
  Current dew point 2 meter above ground in `°C`.
* `swissmeteo/windDirection/Zürich Kloten`  
  Mean wind direction during the last ten minutes in `°`.
* `swissmeteo/windSpeed/Zürich Kloten`  
  Mean wind speed during the last ten minutes in `km/h`.
* `swissmeteo/gustPeak/Zürich Kloten`  
  Maximum gust peak during the last ten minutes in `km/h`.
* `swissmeteo/pressure/Zürich Kloten`  
  Current pressure at station level (QFE) in `hPa`.

## MeteoSwiss

The swiss Federal Office of Meteorology and Climatology [MeteoSwiss] provides the data in an open api. The api description and links to the latest data:
* [MeteoSwiss API Description]
* [Automatic Measurement Stations - Data]
* [Automatic Measurement Stations - Info]
* [Precipitation Stations - Data]
* [Precipitation Stations - Info]

[MeteoSwiss]: https://www.meteoswiss.admin.ch
[MeteoSwiss Weather Stations]: https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/info/VQHA80_en.txt
[MeteoSwiss API Description]: https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell
[Automatic Measurement Stations - Data]: https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA80.csv
[Automatic Measurement Stations - Info]: https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/info/VQHA80_en.txt
[Precipitation Stations - Data]: https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA98.csv
[Precipitation Stations - Info]: https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/info/VQHA98_en.txt
