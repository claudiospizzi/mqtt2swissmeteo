const request = require('request')
const csvParse = require('csv-parse')
const moment = require('moment')

/**
 * Get the MeteoSwiss weather data of the specified station.
 * @param {string}                   station  Weather station id.
 * @param {function(string, string)} callback Callback with the response object.
 */
function getWeatherData (station, callback) {

    const url = 'https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA80.csv'
    const header = 'MeteoSchweiz / MeteoSuisse / MeteoSvizzera / MeteoSwiss'

    const parser = {
        tre200s0: { field: 'temperature' },
        rre150z0: { field: 'precipitation10Min' },
        sre000z0: { field: 'sunshine10Min' },
        gre000z0: { field: 'radiation10Min' },
        ure200s0: { field: 'humidity' },
        tde200s0: { field: 'dewPoint' },
        dkl010z0: { field: 'windDirection10Min' },
        fu3010z0: { field: 'windSpeed10Min' },
        fu3010z1: { field: 'gustPeak10Min' },
        prestas0: { field: 'pressureAbsolute' },
        pp0qffs0: { field: 'pressureRelative' }
    }

    request.get(url, (error, response, body) => {
        if (error) {
            callback(error, null)
        } else if (response.statusCode !== 200) {
            callback(new Error('Request failed with http status code ' + response.statusCode), null)
        } else {
            const allData = body.replace(header, '').trim()
            csvParse(allData, {
                delimiter: ';',
                columns: true
            }, (error, output) => {
                if (error) {
                    callback(error, null)
                } else {
                    for (var key in output) {
                        if (output[key].stn === station) {

                            var data = {
                                station: output[key].stn,
                                timestamp: moment.utc(output[key].time, 'YYYYMMDDHHmm').format('x')
                            }

                            for (var parserKey in parser) {
                                if (output[key][parserKey] !== '-') {
                                    data[parser[parserKey].field] = Number(output[key][parserKey])
                                }
                            }

                            callback(null, data)
                        }
                    }
                }
            })
        }
    })
}

// Node.JS module function export
module.exports.getWeatherData = getWeatherData
