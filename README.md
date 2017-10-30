# bigiot-bridge

[![Greenkeeper badge](https://badges.greenkeeper.io/flowhub/bigiot-bridge.svg)](https://greenkeeper.io/)

Bridge for providing data as offerings in the [BIG IoT](http://big-iot.eu/) marketplace,
using the Flowhub IoT platform.

## Status

Pre-alpha, not useful yet

## License

[MIT](./LICENSE)

## Running locally

### Prerequisites

* [Docker](https://docker.com) is installed and daemon running
* [BigIot marketplace](https://market.big-iot.org/) credentials (provider id+secret) 

### Setup

Create default settings files
```
echo -e 'PORT=5000\nBIGIOT_PROVIDER_ID=\nBIGIOT_PROVIDER_SECRET=\n' > .env
```

Edit `.env` to contain your provider id/secrets.

### Running

Start the service

    docker-compose up

### Checking that it works
The new offering(s) should now be available under [My Offerings](https://market.big-iot.org/myOfferings)

Re
    curl http://localhost:5000/txl

TODO: document how to sign and set request auth token

### Configuring and adding new offerings
TODO: coming soon


## Deploying to Heroku

### Prerequisites

* An Heroku app with the [Container stack](https://devcenter.heroku.com/articles/container-registry-and-runtime) enabled
* Heroku CLI tools installed locally, logged into the Container registry using `heroku container:login`

### Pushing

    docker-compose build
    heroku container:push web
