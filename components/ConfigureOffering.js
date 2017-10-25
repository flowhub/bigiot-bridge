const noflo = require('noflo');
const { offering: BigIotOffering } = require('bigiot-js');
const url = require('url');

function setupEndPoints(config, endpoint) {
  const configured = {
    endpointType: endpoint.endpointType || 'HTTP_GET',
    accessInterfaceType: endpoint.accessInterfaceType || 'BIGIOT_LIB',
  };
  configured.uri = url.format({
    protocol: 'http',
    hostname: config.hostname,
    port: config.port,
    pathname: endpoint.uri,
  });
  return configured;
}

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Configure offering endpoints for the server';
  c.icon = 'wrench';
  c.inPorts.add('offering', {
    datatype: 'object',
    description: 'BIG IoT offering definition',
    addressable: true,
  });
  c.inPorts.add('config', {
    datatype: 'string',
    description: 'BIG IoT provider config',
    control: true,
    scoped: false,
  });
  c.outPorts.add('offering', {
    datatype: 'object',
    description: 'Offering with configured endpoints',
  });
  c.outPorts.add('route', {
    datatype: 'object',
    description: 'Offering with index, for routing setup',
  });
  c.process((input, output) => {
    if (!input.hasData('config')) {
      return;
    }
    const indexesWithData = input.attached('offering').filter(idx => input.hasData(['offering', idx]));
    if (!indexesWithData.length) {
      return;
    }
    const config = input.getData('config');
    indexesWithData.forEach((idx) => {
      const data = input.getData(['offering', idx]);
      const offering = new BigIotOffering(data.name, data.rdfUri);
      offering.inputData = data.inputData;
      offering.outputData = data.outputData;
      offering.endpoints = setupEndPoints(config, data.endpoints);
      offering.extent = data.extent;
      output.send({
        offering,
        route: new noflo.IP('data', {
          offering,
          index: idx,
        }),
      });
    });
    output.done();
  });
  return c;
};
