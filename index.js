#!/usr/bin/env node

const log = require('yalm');
const mqtt = require('mqtt');

const swissmeteo = require('./modules/swissmeteo.js');

const pkg = require('./package.json');
const cfg = require(process.argv[2] || './config.json');

let mqttConnected;
let weatherDataTime;

log.setLevel(cfg.log);
log.info(pkg.name + ' ' + pkg.version + ' starting');

const mqttClient = mqtt.connect(
    cfg.mqtt.url, {
        will: { topic: cfg.mqtt.name + '/connected', payload: '0', retain: true },
        rejectUnauthorized: cfg.mqtt.secure
    }
);

mqttClient.on('connect', () => {

    mqttClient.publish(cfg.mqtt.name + '/connected', '2', { retain: true });

    mqttConnected = true;
    log.info('mqtt: connected ' + cfg.mqtt.url);
});

mqttClient.on('close', () => {

    if (mqttConnected) {
        mqttConnected = false;
        log.info('mqtt: disconnected ' + cfg.mqtt.url);
    }
});

mqttClient.on('error', err => {

    log.error('mqtt: error ' + err.message);
});

function pollSwissMeteoData() {

    swissmeteo.getWeatherData(cfg.swissmeteo.weatherStation.id, (error, response) => {
        if (error) {
            log.error(error);
        }
        else {
            log.debug('swissmeteo weather data: ' + JSON.stringify(response));
            if (weatherDataTime != response.timestamp) {
                properties = [ 'temperature', 'precipitation', 'sunshine', 'radiation', 'humidity', 'dewPoint', 'windDirection', 'windSpeed', 'gustPeak', 'pressure' ];
                for (var key in properties) {
                    var property = properties[key];
                    if (response[property] != undefined) {
                        var payload = JSON.stringify({ val: response[property], ts: response.timestamp });
                        mqttClient.publish(cfg.mqtt.name + '/' + property + '/' + cfg.swissmeteo.weatherStation.name, payload);
                        log.info('mqtt: publish ' + cfg.mqtt.name + '/' + property + '/' + cfg.swissmeteo.weatherStation.name + ' ' + payload);
                    }
                }
                weatherDataTime = response.timestamp;
            }
        }
    });
}

setInterval(pollSwissMeteoData, cfg.swissmeteo.pollInterval * 1000);
