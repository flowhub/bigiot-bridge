const noflo = require('noflo');


exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Extract relevant details for a space';
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
  c.forwardBrackets = {
    in: ['id', 'latitude', 'longitude'],
  };
  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const space = input.getData('in');
    output.sendDone({
      id: space.id,
      latitude: space.geoLocation.latitude,
      longitude: space.geoLocation.longitude,
    });
  });
  return c;
};
