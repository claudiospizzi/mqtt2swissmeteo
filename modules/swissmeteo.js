// API Description
// - Automatic Measurement Stations:
//   https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA80.csv
//   https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/info/VQHA80_en.txt
// - Precipitation Stations:
//   https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA98.csv
//   https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/info/VQHA98_en.txt

const request = require('request');
const csvParse = require('csv-parse');
const moment = require('moment');

function getWeatherData(station, callback) {

    var url = 'https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA80.csv';
    var header = 'MeteoSchweiz / MeteoSuisse / MeteoSvizzera / MeteoSwiss';

    request.get(url, (error, response, body) => {
        if (error) {
            callback(error, null);
        }
        else if (response.statusCode != 200) {
            callback('Request failed with http status code ' + response.statusCode, null);
        }
        else {
            var allData = body.replace(header, '').trim();
            csvParse(allData, {
                delimiter: ';',
                columns: true
            }, (error, output) => {
                if (error) {
                    callback(error, null);
                }
                else {
                    for (var key in output) {
                        if (output[key].stn == station) {
                            callback(null, parseWeatherData(output[key]));
                        }
                    }
                }
            });
        }
    });
}

function parseWeatherData(data) {

    var parser = {
        tre200s0: {
            field: "temperature"
        },
        rre150z0: {
            field: "precipitation"
        },
        sre000z0: {
            field: "sunshine"
        },
        gre000z0: {
            field: "radiation"
        },
        ure200s0: {
            field: "humidity"
        },
        tde200s0: {
            field: "dewPoint"
        },
        dkl010z0: {
            field: "windDirection"
        },
        fu3010z0: {
            field: "windSpeed"
        },
        fu3010z1: {
            field: "gustPeak"
        },
        prestas0: {
            field: "pressure"
        }
    };

    var weatherData = {
        station: data.stn,
        timestamp: moment.utc(data.time, 'YYYYMMDDHHmm').format('x')
    };

    for (var key in parser) {
        if (data[key] != '-') {
            weatherData[parser[key].field] = Number(data[key]);
        }
    }

    return weatherData;
}

module.exports.getWeatherData = getWeatherData;
