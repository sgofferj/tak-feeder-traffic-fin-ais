const fs = require('fs');
const { cot, proto } = require('@vidterra/tak.js')
const uuid = require('uuid');
const util = require('util')

const myCallsign = (typeof process.env.CALLSIGN !== 'undefined') ? process.env.CALLSIGN : "sbsfeeder";
const myType = (typeof process.env.MYCOT !== 'undefined') ? process.env.MYCOT : "a-f-G-U";
const myUID = (typeof process.env.UUID !== 'undefined') ? process.env.UUID : uuid.v4();

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

function getType(type) {
    let result = null;
    switch (type) {
        case 31:
            result = "-X-M-T-U";
            break;
        case 32:
            result = "-X-M-T-U";
            break;
        case 35:
            result = "-C";
            break;
        case 36:
            result = "-X-R";
            break;
        case 37:
            result = "-X-P";
            break;
        case 50:
            result = "";
            break;
        case 51:
            result = "-X-L";
            break;
        case 52:
            result = "-X-M-T-U";
            break;
        case 55:
            result = "-X-L";
            break;
        case 60:
            result = "-X-M-P";
            break;
        case 70:
            result = "-X-M-C";
            break;
        case 80:
            result = "-X-M-O";
            break;
        default:
            result = "-X";
            break;
    }
    return result;
}

module.exports.ais2cot = (item) => {
    const dt = Date.now();
    const dtD = new Date(dt).toISOString();
    const dtDs = new Date(dt + (60 * 1000)).toISOString();

    if ((item.hasOwnProperty('lat')) && (item.hasOwnProperty('lon')) ) {
        let mmsi = item["mmsi"];
        let cottype = "a-u-S";
        cottype += getType(item.type);
        
        let course = (item.hasOwnProperty('track')) ? item.track : 0;
        let speed = (item.hasOwnProperty('gs')) ? item.gs * 0.514444 : 0;
        let callsign = (item.hasOwnProperty('name')) ? item.name : mmsi;

        let remarks = `${item.type} ${cottype} #AIS`;
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
                            "callsign": callsign
                        }
                    },
                    "link": { "_attributes": { "uid": myUID, "production_time": dtD, "type": myType, "parent_callsign": myCallsign, "relation": "p-p" } },
                    "track": { "_attributes": { "course": course, "speed": speed } },
                    "remarks": [ remarks ]
                }
            }
        }
        result = cot.js2xml(packet);
        return result;
    }
}
