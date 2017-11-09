const noflo = require('noflo');
const { provider: BigIotProvider } = require('bigiot-js');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Register offerings with the BIG IoT marketplace';
  c.icon = 'shopping-cart';
  c.inPorts.add('offering', {
    datatype: 'object',
    description: 'BIG IoT offering definition',
  });
  c.inPorts.add('config', {
    datatype: 'string',
    description: 'BIG IoT provider config',
    control: true,
    scoped: false,
  });
  c.inPorts.add('activate', {
    datatype: 'bang',
    description: 'Re-activate all offerings',
  });
  c.outPorts.add('out', {
    datatype: 'object',
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });
  c.offerings = {};
  c.tearDown = (callback) => {
    c.offerings = {};
    callback();
  };
  c.process((input, output) => {
    if (!input.hasData('config')) {
      return;
    }

    if (input.hasData('offering')) {
      if (!c.offerings[input.scope]) {
        c.offerings[input.scope] = [];
      }

      const offering = input.getData('offering');
      // Register offering for re-activation
      c.offerings[input.scope].push(offering);
      if (!input.hasData('activate')) {
        output.done();
        return;
      }
    }

    if (!input.hasData('activate')) {
      return;
    }
    if (!c.offerings[input.scope]) {
      // Wait for offerings
      return;
    }
    // Re-activate all known offerings
    input.getData('activate');
    const config = input.getData('config');
    const provider = new BigIotProvider(config.provider_id, config.provider_secret);
    const offerings = c.offerings[input.scope].slice(0);
    provider.authenticate()
      .then(() => {
        const registers = offerings.map(offering => provider.register(offering));
        return Promise.all(registers);
      })
      .then(() => {
        output.sendDone(true);
      })
      .catch((err) => {
        output.done(err);
      });
  });
  return c;
};
