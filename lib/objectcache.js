const util = require("util");
const NodeCache = require("node-cache");
const objectCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 10
});

module.exports.store = (topic,data) => {
  let top = topic.split("/");
  let mmsi = top[1];
  let msg = top[2];
  let uid = `AIS-${mmsi}`;
  try {
    if (msg == "metadata") {
      obj = objectCache.get(uid);
      if (typeof(obj) === 'undefined') obj = {
        "mmsi": mmsi
      }
      obj.name = data["name"];
      obj.callsign = data["callSign"];
      obj.imo = data["imo"];
      obj.type = data["type"];
      obj.destination = data["destination"];
      obj.timestamp = new Date(data["timestamp"]).toISOString();
      success = objectCache.set(uid, obj,300);
    }
    else if (msg == "location") {
      obj = objectCache.get(uid);
      if (typeof(obj) === 'undefined') obj = {
        "mmsi": mmsi
      }
      obj.lat = data["lat"];
      obj.lon = data["lon"];
      obj.gs = data["sog"];
      obj.track= data["cog"];
      success = objectCache.set(uid, obj,300);
    }
  } catch (e) {
    console.error('error', e, data);
  }
}

module.exports.getCache = () => {
  return objectCache;
}
