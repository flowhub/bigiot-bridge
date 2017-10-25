const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Validate request payload against offering definition';
  c.icon = 'search';
  c.inPorts.add('req', {
    datatype: 'object',
    description: 'Incoming HTTP request',
    scoped: true,
  });
  c.outPorts.add('req', {
    datatype: 'object',
    description: 'Validated HTTP request',
    scoped: true,
  });
  c.process((input, output) => {
    if (!input.hasData('req')) {
      return;
    }
    const req = input.getData('req');
    const { offering } = req;
    switch (offering.endpoints.endpointType) {
      case 'HTTP_GET':
        req.payload = req.req.query;
        break;
      default:
        req.payload = req.req.body;
        break;
    }
    // TODO: Actually validate input data
    console.log(req.payload);
    output.sendDone({
      req,
    });
  });
  return c;
};

