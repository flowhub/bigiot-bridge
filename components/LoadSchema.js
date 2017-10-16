const noflo = require('noflo');

const ParkingSpaceOffering = {
  title: 'ParkingSpaceOffering',
  type: 'array',
  items: {
    type: 'object',
    required: ['Latitude', 'Longitude', 'status'],
    properties: {
      Latitude: {
        type: 'number',
        example: 48.25,
        minimum: -90,
        maximum: 90,
      },
      Longitude: {
        type: 'number',
        example: 11.63,
        minimum: -90,
        maximum: 90,
      },
      status: {
        type: 'string',
        enum: ['available', 'unknown'],
      },
    },
  },
};

const schemas = {
  'bigiot/ParkingSpaceOffering': ParkingSpaceOffering,
};

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Load a named schema';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'JSON schema identifier',
  });
  c.outPorts.add('out', {
    datatype: 'object',
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });

  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const name = input.getData('in');
    const found = schemas[name];
    if (!found) {
      output.error(new Error(`Could not find schema named ${name}`));
      return;
    }
    output.sendDone({ out: found });
  });

  return c;
};

