const { consumer: BigIotConsumer, offering: BigIotOffering } = require('bigiot-js');
const jwt = require('jsonwebtoken');
const http = require('http');

function assert(expr, message) {
  if (!expr) {
    throw new Error(message);
  }
}

// Emulate what Marketplace is doing when calling BigIotConsumer.subscribe(offering)
function fakeSubscribe(offering, providerSecret) {
  if (!providerSecret) {
    providerSecret = process.env.BIGIOT_PROVIDER_SECRET;
  }

  const token = jwt.sign({}, Buffer.from(providerSecret, 'base64'), { expiresIn: '1h', });
  const sub = {
      accessToken: token,
      offering: offering,
  }
  return sub;
}

function accessViaMarketplace(config, category, offeringId, parameters) {

  const consumer = new BigIotConsumer(config.id, config.secret, undefined);

  return consumer.authenticate().then(() => {

    const query = new BigIotOffering('Parking sites', category);
    delete query.license;
    delete query.extent;
    delete query.price;

    return consumer.discover(query)

  }).then((all) => {
    if (all.length < 1) {
      throw new Error(`No offerings for category ${category}`);
    }

    const matching = all.filter((o) => o.id == offeringId );

    assert(matching.length > 0, `Offering '${offeringId}' for category '${category}' was not found in marketplace`);
    assert(matching.length < 2, `Duplicate offering found for ${offeringId}`);

    const offering = matching[0];
    const active = offering.activation.status;
    assert(active, `Offering '${offeringId}' is not marked as active`);
    return offering;
  }).then((offering) => {
    //return consumer.subscribe(offering.id); // FIXME: fails with 503
    return fakeSubscribe(offering);
  }).then((subscription) => {
    return consumer.access(subscription, parameters);
  });
}

function sendSlackMessage(slack, message) {

  const payload = {
    'text': message,
  }

  return fetch(slack.url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
  }).then((res) => {
     assert(res.status == 200, `Slack reported error ${res.status}`);
  });
}

function main() {
  const consumer = {
    secret: process.env.BIGIOT_CONSUMER_SECRET,
    id: process.env.BIGIOT_CONSUMER_ID,
  }
  const slack = {
    url: process.env.SLACK_HOOK,
  }

  const providerId = process.env.BIGIOT_PROVIDER_ID; 
  const category = 'urn:big-iot:ParkingSiteCategory';

  const access = (id, lat, lon, radius) => {
    const params = { latitude: lat, longitude: lon, radius: radius }
    return accessViaMarketplace(consumer, category, id, params); 
  }

  // TODO: check timeliness of data
  // TODO: check output against schema
  const dbahn = access(`${providerId}-Bahn_Parking_Berlin`, 50.9375, 6.9603, 1000).then((data) => {
    assert(data.length >= 3, `Too few parking sites returned: ${data.length}`);
  });

  const cologne = access(`${providerId}-Cologne_Parking`, 50.9375, 6.9603, 1000).then((data) => {
    assert(data.length >= 10, `Too few parking sites returned: ${data.length}`);
  })

  Promise.all([dbahn, cologne]).then((results) => {
    console.log('Offerings are OK');
  }).catch((err) => {
    return sendSlackMessage(slack, `Offering failed: ${err.message}`).then(() => {

      console.error('ERROR', err);
      process.exit(1);
    })
  })
 
}


if (!module.parent) {
    main();
}
