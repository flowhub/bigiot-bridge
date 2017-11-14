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
* [Redis](https://redis.io/) database instance running. Can be locally, via a Docker image, or a cloud service

### Setup

Create default settings files
```
cp .env-default .env
```

Edit `.env` to contain your provider id/secrets.

### Running

Start the service

    docker-compose up

### Checking that it works
The new offering(s) should now be available under [My Offerings](https://market.big-iot.org/myOfferings)

To request data from the API without going through the marketplace, you will need an authentication token.
Create it using:

```
export TOKEN=`node -e "console.log(require('jsonwebtoken').sign({}, Buffer.from(process.env.BIGIOT_PROVIDER_SECRET, 'base64'), {expiresIn:'1h'}))"`
```

```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/txl
```

### Configuring and adding new offerings
TODO: coming soon


## Deploying to Heroku

### Prerequisites

* An Heroku app with the [Container stack](https://devcenter.heroku.com/articles/container-registry-and-runtime) enabled
* Heroku Redis addon enabled for the app
* Heroku CLI tools installed locally, logged into the Container registry using `heroku container:login`

### Pushing

    docker-compose build
    heroku container:push web
