const fs = require('fs');
const { cot, proto } = require('@vidterra/tak.js')
const uuid = require('uuid');
const util = require('util')

const aisDBFile = (typeof process.env.AISDB !== 'undefined') ? process.env.AISDB : "lib/countries.json";
const myCallsign = (typeof process.env.CALLSIGN !== 'undefined') ? process.env.CALLSIGN : "ais-traffic-fin";
const myType = (typeof process.env.MYCOT !== 'undefined') ? process.env.MYCOT : "a-f-G-U";
const myUID = (typeof process.env.UUID !== 'undefined') ? process.env.UUID : uuid.v4();

let aisdb;
if (aisDBFile != null) {
    let rawdata = fs.readFileSync(aisDBFile);
    aisdb = JSON.parse(rawdata);
} else aisdb = null;

module.exports.heartbeatcot = (stale) => {
    const dt = Date.now();
    const dtD = new Date(dt).toISOString();
    const dtDs = new Date(dt + (3 * stale * 1000)).toISOString();

    let packet = {
        "event": {
            "_attributes": {
                "version": "2.0",
                "uid": myUID,
                "type": myType,
                "how": "h-g-i-g-o",
                "time": dtD,
                "start": dtD,
                "stale": dtDs,
            },
            "point": {
                "_attributes": {
                    "lat": "0.000000",
                    "lon": "0.000000",
                    "hae": "9999999.0",
                    "ce": "9999999.0",
                    "le": "9999999.0"
                }
            },
            "detail": {
                "takv": {
                    "_attributes": {
                        "os": "Docker",
                        "device": "Server",
                        "version": "1",
                        "platform": "NodeJS AIS feeder"
                    }
                },
                "contact": {
                    "_attributes": {
                        "callsign": myCallsign,
                        "endpoint": "*:-1:stcp"
                    }
                },
                "uid": { "_attributes": { "Droid": myCallsign } },
                "precisionlocation": { "_attributes": { "altsrc": "GPS", "geopointsrc": "GPS" } },
                "track": { "_attributes": { "course": "0", "speed": "0" } },
                "__group": { "_attributes": { "role": "Server", "name": "Blue" } },
            }
        }
    }
    return cot.js2xml(packet);
}

function getAffil(mmsi) {
    let result;
    let country = mmsi.substring(0, 3);
    if (aisdb != null) {
        if (typeof (aisdb[country]) !== 'undefined') result = aisdb[country];
        else result = "o";
    } else result = "u";
    return result;
}

function getType(type) {
    let result = null;
    switch (type) {
        case 31:
            result = "-S-X-M-T-U";
            break;
        case 32:
            result = "-S-X-P";
            break;
        case 35:
            result = "-S-C";
            break;
        case 36:
            result = "-S-X-R";
            break;
        case 37:
            result = "-S-X-P";
            break;
        case 40:
            result = "-S-X-A";
            break;
        case 50:
            result = "-S";
            break;
        case 51:
            result = "-S-X-L";
            break;
        case 52:
            result = "-S-X-M-T-U";
            break;
        case 53:
            result = "-S-X-M-T-U";
            break;
        case 54:
            result = "-S-X-L";
            break;
        case 55:
            result = "-S-X-L";
            break;
        case 58:
            result = "-S-N-M";
            break;
        case 59:
            result = "-S-N";
            break;
        case 60:
            result = "-S-X-M-P";
            break;
        case 70:
            result = "-S-X-M-C";
            break;
        case 80:
            result = "-S-X-M-O";
            break;
        default:
            result = "-S-X";
            break;
    }
    return result;
}

module.exports.ais2cot = (item) => {
    const dt = Date.now();
    const dtD = new Date(dt).toISOString();
    const dtDs = new Date(dt + (60 * 1000)).toISOString();

    if ((item.hasOwnProperty('lat')) && (item.hasOwnProperty('lon'))) {
        let mmsi = item["mmsi"];
        let cottype = "a-";
        let affil = getAffil(mmsi);
        cottype += affil[0];
        cottype += getType(item.type);
        country = affil[1];

        let course = (item.hasOwnProperty('track')) ? item.track : 0;
        let speed = (item.hasOwnProperty('gs')) ? item.gs * 0.514444 : 0;
        let name = (item.hasOwnProperty('name')) ? item.name : mmsi;
        let callsign = (item.hasOwnProperty('callSign')) ? item.callSign : mmsi;

        let remarks = `${name}\nAIS type: ${item["type"]}\nMMSI: ${mmsi}\nIMO: ${item["imo"]}\nDest: ${item["destination"]}\nCountry: ${country}\nLast Pos: ${item["time"]}\nMetadata: ${item["timestamp"]}\n#AIS`;
        let uid = "AIS-" + mmsi;
        packet = {
            "event": {
                "_attributes": {
                    "version": "2.0",
                    "uid": uid,
                    "type": cottype,
                    "how": "m-g",
                    "time": dtD,
                    "start": dtD,
                    "stale": dtDs
                },
                "point": {
                    "_attributes": {
                        "lat": item.lat,
                        "lon": item.lon,
                        "hae": 0,
                        "ce": 9999999.0,
                        "le": 9999999.0
                    }
                },
                "detail": {
                    "contact": {
                        "_attributes": {
                            "callsign": name
                        }
                    },
                    "link": { "_attributes": { "uid": myUID, "production_time": dtD, "type": myType, "parent_callsign": myCallsign, "relation": "p-p" } },
                    "track": { "_attributes": { "course": course, "speed": speed } },
                    "remarks": [remarks]
                }
            }
        }
        result = cot.js2xml(packet);
        return result;
    }
}
