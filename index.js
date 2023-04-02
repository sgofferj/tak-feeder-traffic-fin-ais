
require('dotenv').config();

const functions = require('./lib/functions.js');
const tls = require('tls')
const fs = require('fs');
const { adsb2cot } = require('./lib/functions.js');
const objects = require('./lib/objectcache.js')

const url = process.env.REMOTE_SERVER_URL
const sslCert = process.env.REMOTE_SSL_SERVER_CERTIFICATE
const sslKey = process.env.REMOTE_SSL_SERVER_KEY
const logCot = (typeof process.env.LOGCOT !== 'undefined') ? process.env.LOGCOT : false;
const intervallSecs = (typeof process.env.UPDATE_RATE !== 'undefined') ? process.env.UPDATE_RATE : 5;

const heartbeatIntervall = 30 * 1000;

process.env.TZ = 'UTC';

const run = () => {

  require('./lib/mqttClient.js')

  const cotURL = url.match(/^ssl:\/\/(.+):([0-9]+)/)
  if (!cotURL) return

  const options = {
    host: cotURL[1],
    port: cotURL[2],
    cert: fs.readFileSync(sslCert),
    key: fs.readFileSync(sslKey),
    rejectUnauthorized: false
  }

  const client = tls.connect(options, () => {
    if (client.authorized) {
      console.log("Connection authorized by a Certificate Authority.")
    } else {
      console.log("Connection not authorized: " + client.authorizationError)
    }
    heartbeat();
  })

  client.on('data', (data) => {
    console.log(data.toString());
  })

  client.on('error', (err) => {
    console.error(`Could not connect to SSL host ${url}`)
  })

  client.on('close', () => {
    console.info(`Connection to SSL host ${url} closed`)
  })

  function heartbeat() {
    client.write(functions.heartbeatcot(heartbeatIntervall));
    if (logCot) {
      console.log(functions.heartbeatcot(heartbeatIntervall));
      console.log('----------------------------------------')
    }
    setTimeout(heartbeat, heartbeatIntervall);
  }

  function dumpObjects() {
    objectCache = objects.getCache();
    list = objectCache.keys();
    cache = objectCache.mget(list);
    for (const [uid, cot] of Object.entries(cache)) {
      let cotevent = functions.ais2cot(cot);
      if (typeof(cotevent) !== 'undefined') {
        client.write(cotevent);
        //console.log(JSON.stringify(cot));
      }
    }
    //console.log('----------------------------------------')
    setTimeout(dumpObjects, (intervallSecs * 1000));
  }

  dumpObjects();

};

if (url && sslCert && sslKey) {
  run();
}
