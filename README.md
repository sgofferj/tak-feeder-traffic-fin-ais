[![Build and publish the container image](https://github.com/sgofferj/tak-feeder-traffic-fin-ais/actions/workflows/actions.yml/badge.svg)](https://github.com/sgofferj/tak-feeder-traffic-fin-ais/actions/workflows/actions.yml)

# tak-feeder-traffic-fin-ais
Feed AIS data from the Finnish Traffic Authority into your TAK server

(C) 2023 Stefan Gofferje

Licensed under the GNU General Public License V3 or later.

<font color="red">**WIP - NOT READY FOR PRODUCTION**</font>

## Description
## Configuration
The following values are supported and can be provided either as environment variables or through an .env-file.

| Variable | Default | Purpose |
|----------|---------|---------|
| REMOTE_SERVER_URL | empty | (mandatory) TAK server full URL, e.g. ssl://takserver:8089 |
| REMOTE_SSL_SERVER_CERTIFICATE | empty | (mandatory for ssl) User certificate in PEM format |
| REMOTE_SSL_SERVER_KEY | empty | (mandatory for ssl) User certificate key in PEM format |
| UUID | empty | (optional) Set feeder UID - if not set, the feeder will create one |
| MQTT_URL | wss://meri.digitraffic.fi:443/mqtt | (optional) Set MQTT URL |
| CALLSIGN | adsb.one | (optional) Callsign for heartbeat |
| MYCOT | a-f-G-U | (optional) CoT type for heartbeat |

Note: At the moment, only SSL TCP connections are supported.
## Certificates
These are the server-issued certificate and key files. Before using, the password needs to be removed from the key file with `openssl rsa -in cert.key -out cert-nopw.key`. OpenSSL will ask for the key password which usually is "atakatak".

## Container use
First, get your certificate and key and copy them to a suitable folder which needs to be added as a volume to the container.
### Image
The image is built for AMD64 and ARM64 and pushed to ghcr.io: *ghcr.io/sgofferj/tak-feeder-traffic-fin-ais:latest*
### Docker
First, rename .env.example to .env and edit according to your needs \
Create and start the container:
```
docker run -d --env-file .env -v <path-to-data-directory>:/data:ro --name tak-feeder-traffic-fin-ais --restart always ghcr.io/sgofferj/tak-feeder-traffic-fin-ais:latest
```

### Docker compose
Here is an example for a docker-compose.yml file:
```
version: '2.0'

services:
  adsbone:
    image: ghcr.io/sgofferj/tak-feeder-traffic-fin-ais:latest
    restart: always
    networks:
      - default
    volumes:
      - <path to data-directory>:/data:ro
    environment:
      - REMOTE_SERVER_URL=ssl://tak-server:8089
      - REMOTE_SSL_SERVER_CERTIFICATE=/data/cert.pem
      - REMOTE_SSL_SERVER_KEY=/data/key.pem
      - CALLSIGN=aisfeeder
      - MYCOT=a-f-G-U

networks:
  default:
