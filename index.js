#!/usr/bin/env node

/**
 * SETUP
 */

// Global modules
const log = require('yalm')
const mqtt = require('mqtt')

// Local modules
const swissmeteo = require('./modules/swissmeteo.js')

const pkg = require('./package.json')
const cfg = require(process.argv[2] || './config.json')

log.setLevel(cfg.log)
log.info(pkg.name + ' ' + pkg.version + ' starting')

/**
 * SETUP MQTT
 */

let mqttConnected

const mqttClient = mqtt.connect(
    cfg.mqtt.url, {
        will: { topic: cfg.mqtt.name + '/connected', payload: '0', retain: true },
        rejectUnauthorized: cfg.mqtt.secure
    }
)

mqttClient.on('connect', () => {
    mqttClient.publish(cfg.mqtt.name + '/connected', '2', { retain: true })
    log.info('mqtt: connected ' + cfg.mqtt.url)
    mqttConnected = true
})

mqttClient.on('close', () => {
    if (mqttConnected) {
        log.info('mqtt: disconnected ' + cfg.mqtt.url)
        mqttConnected = false
    }
})

mqttClient.on('error', err => {
    log.error('mqtt: error ' + err.message)
})

/**
 * POLLING LOGIC
 */

let weatherDataTime

function pollSwissMeteoData () {
    swissmeteo.getWeatherData(cfg.swissmeteo.weatherStation.id, (error, response) => {
        if (error) {
            log.error(error)
        } else {
            log.debug('swissmeteo weather data: ' + JSON.stringify(response))
            if (weatherDataTime !== response.timestamp) {
                for (const property of Object.keys(response)) {
                    if (response[property] !== undefined && property !== 'station' && property !== 'timestamp') {
                        const payload = JSON.stringify({ val: response[property], ts: response.timestamp })
                        mqttClient.publish(cfg.mqtt.name + '/' + property + '/' + cfg.swissmeteo.weatherStation.name, payload)
                        log.info('mqtt: publish ' + cfg.mqtt.name + '/' + property + '/' + cfg.swissmeteo.weatherStation.name + ' ' + payload)
                    }
                }
                weatherDataTime = response.timestamp
            }
        }
    })
}

pollSwissMeteoData()
setInterval(pollSwissMeteoData, cfg.swissmeteo.pollIntervalSec * 1000)
