const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Respond to request with received data';
  c.icon = 'paper-plane';
  c.inPorts.add('req', {
    datatype: 'object',
    description: 'Incoming HTTP request',
    scoped: true,
  });
  c.inPorts.add('data', {
    datatype: 'object',
    description: 'Response data',
    scoped: true,
  });
  c.process((input, output) => {
    if (!input.hasData('req', 'data')) {
      return;
    }
    const [req, data] = input.getData('req', 'data');

    // Allow CORS, for browser support
    req.res.header('Access-Control-Allow-Origin', '*');

    if (data instanceof Error) {
      // Data provider failed
      req.res.status(500).send('Request failed');
      output.done();
      return;
    }
    if (Array.isArray(data)) {
      req.res.json(data.filter(val => val !== null));
      output.done();
      return;
    }
    req.res.json(data);
    output.done();
  });
  return c;
};
