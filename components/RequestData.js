const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Request data from source for a HTTP request';
  c.icon = 'share-square-o';
  c.inPorts.add('req', {
    datatype: 'object',
    description: 'Incoming HTTP request',
    scoped: true,
  });
  c.outPorts.add('req', {
    datatype: 'object',
    description: 'HTTP request',
    scoped: true,
  });
  c.outPorts.add('payload', {
    datatype: 'object',
    description: 'Request payload',
    scoped: true,
    addressable: true,
  });
  c.process((input, output) => {
    if (!input.hasData('req')) {
      return;
    }
    const req = input.getData('req');
    output.sendDone({
      req,
      payload: new noflo.IP('data', req.payload, {
        index: req.index,
        scope: input.scope,
      }),
    });
  });
  return c;
};
