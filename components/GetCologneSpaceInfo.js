const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Extract relevant details for a Cologne space';
  c.icon = 'map-pin';
  c.inPorts.add('in', {
    datatype: 'object',
  });
  c.outPorts.add('id', {
    datatype: 'string',
  });
  c.outPorts.add('latitude', {
    datatype: 'number',
  });
  c.outPorts.add('longitude', {
    datatype: 'number',
  });
  c.outPorts.add('capacity', {
    datatype: 'number',
  });
  c.forwardBrackets = {
    in: ['id', 'latitude', 'longitude', 'capacity'],
  };
  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const space = input.getData('in');
    output.sendDone({
      id: space.attributes.IDENTIFIER,
      latitude: space.geometry.y,
      longitude: space.geometry.x,
      capacity: space.attributes.KAPAZITAET,
    });
  });
  return c;
};
