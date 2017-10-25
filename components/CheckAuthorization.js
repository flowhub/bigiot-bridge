const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Check that request comes from an authorized subscriber';
  c.icon = 'key';
  c.inPorts.add('req', {
    datatype: 'object',
    description: 'Incoming HTTP request',
    scoped: true,
  });
  c.inPorts.add('secret', {
    datatype: 'string',
    description: 'Provider secret to validate against',
    control: true,
    scoped: false,
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
    // TODO: Actually check token
    console.log(req.req.headers.Authorization);
    output.sendDone({
      req,
    });
  });
  return c;
};
