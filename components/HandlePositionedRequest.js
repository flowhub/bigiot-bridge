const noflo = require('noflo');


exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Handle positioned request parameters';
  c.icon = 'map-pin';
  c.inPorts.add('in', {
    datatype: 'object',
  });
  c.outPorts.add('latitude', {
    datatype: 'number',
  });
  c.outPorts.add('longitude', {
    datatype: 'number',
  });
  c.outPorts.add('radius', {
    datatype: 'number',
  });
  c.forwardBrackets = {
    in: ['latitude', 'longitude', 'radius'],
  };
  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const params = input.getData('in');
    output.sendDone({
      latitude: parseFloat(params.latitude),
      longitude: parseFloat(params.longitude),
      radius: parseFloat(params.radius || 100),
    });
  });
  return c;
};
