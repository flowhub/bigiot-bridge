# bigiot-bridge

[![Greenkeeper badge](https://badges.greenkeeper.io/flowhub/bigiot-bridge.svg)](https://greenkeeper.io/)

Bridge for providing data as offerings in the [BIG IoT](http://big-iot.eu/) marketplace,
using the Flowhub IoT platform with the [NoFlo](https://noflojs.org) Flow-based-programming runtime.

## Status

0.3: **Production**

* Can expose multiple datasets as offerings in BigIoT marketplace
* Example using the Deutche Bahn and City of Cologne public parking APIs is provided
* A public service instance is running on https://flowhub-bigiot-bridge.herokuapp.com/ since November 2017

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

The offerings are set up as a NoFlo graph, a 'Data Provider'.
This graph should use the `Provider` component, and:

- Set up the BigIot offering description, send it to `OFFERING` port
- Setup configuration and send it to `CONFIG` port
- Connect to the `REQUEST` port. On data, perform requested query
- Respond with the returned data by sending to `RESPONSE` port

Examples can be found in the "ParkingProvider" and "WeatherProvider" graphs,
and the "Provider" and "ParkingProvider" tests.

## Deploying to Heroku

### Prerequisites

* An Heroku app with the [Container stack](https://devcenter.heroku.com/articles/container-registry-and-runtime) enabled
* Heroku Redis addon enabled for the app
* Heroku CLI tools installed locally, logged into the Container registry using `heroku container:login`

### Pushing

    docker-compose build
    heroku container:push web


## Best practices

### Local caching

The data provider may look up the data in memory or local database, or fetch from external APIs.
It is recommended for data that changes slowly that they are fetched periodically separately from the HTTP requests 
nd cached in a local database like Redis.
The data provider in the HTTP request path then only queries the local Redis database.
This is expecially for third-party APIs, which have an unknown amount of latency/uptime.
The third-party APIs may also not support the desired querying methods, like geo-based queries.

## Changes

* 0.3.1 (February 19 2018)
  - Fixed datatypes used in the parking offering example
* 0.3.0 (February 9 2018)
  - Compatibility with BIG IoT Marketplace 0.10
  - Updated categories to match the [BIG IoT category list](https://big-iot.github.io/categories/)
* 0.2.0 (December 12 2017)
  - Added a second data source for the ParkingProvider: parking spaces in Cologne
