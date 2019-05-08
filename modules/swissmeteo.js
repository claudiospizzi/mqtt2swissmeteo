const request = require('request');
const csvParse = require('csv-parse');
const moment = require('moment');

/**
 * Get the MeteoSwiss weather data of the specified station.
 * @param {string}                   station  Weather station id.
 * @param {function(string, string)} callback Callback with the response object.
 */
function getWeatherData(station, callback) {

    var url = 'https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA80.csv';
    var header = 'MeteoSchweiz / MeteoSuisse / MeteoSvizzera / MeteoSwiss';

    var parser = {
        tre200s0: { field: "temperature" },
        rre150z0: { field: "precipitation" },
        sre000z0: { field: "sunshine" },
        gre000z0: { field: "radiation" },
        ure200s0: { field: "humidity" },
        tde200s0: { field: "dewPoint" },
        dkl010z0: { field: "windDirection" },
        fu3010z0: { field: "windSpeed" },
        fu3010z1: { field: "gustPeak" },
        prestas0: { field: "pressure" }
    };

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

                            var data = {
                                station: output[key].stn,
                                timestamp: moment.utc(output[key].time, 'YYYYMMDDHHmm').format('x')
                            };

                            for (var parserKey in parser) {
                                if (output[key][parserKey] != '-') {
                                    data[parser[parserKey].field] = Number(output[key][parserKey]);
                                }
                            }

                            callback(null, data);
                        }
                    }
                }
            });
        }
    });
}

// Node.JS module function export
module.exports.getWeatherData = getWeatherData;
