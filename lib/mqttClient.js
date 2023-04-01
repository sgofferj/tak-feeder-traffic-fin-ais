const {cot} = require("@vidterra/tak.js")
const objects = require('./objectcache.js')
const mqtt = require('mqtt')

const url = (typeof process.env.MQTT_URL !== 'undefined') ? process.env.MQTT_URL : "wss://meri.digitraffic.fi:443/mqtt";

const run = () => {

	const client = mqtt.connect(url,{"keepalive": 60,"username":"digitraffic","password":"digitrafficPassword"})

	client.on('connect', function () {
		client.subscribe('vessels-v2/#', function (err) {
		  if (err) {
			console.log(err);
		  }
		});
	  });


	client.on('message', function (topic, message) {
		let msg = JSON.parse(message.toString());
		objects.store(topic,msg);
		//console.log(topic,msg)
	})

	client.on('error', (err) => {
		console.error(`Could not connect to ${url}`)
	})

	client.on('close', () => {
		console.info(`Connection to ${url} closed`)
	})

}

if (url) {
	run()
}
