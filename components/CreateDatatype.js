const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Create a BIG IoT offering input/output entry';
  c.icon = 'indent';
  c.inPorts.add('name', {
    datatype: 'string',
    required: true,
  });
  c.inPorts.add('rdfuri', {
    datatype: 'string',
    required: true,
  });
  c.outPorts.add('out', {
    datatype: 'object',
  });
  c.process((input, output) => {
    if (!input.hasData('name', 'rdfuri')) {
      return;
    }
    const data = {
      name: input.getData('name'),
      rdfUri: input.getData('rdfuri'),
    };
    output.sendDone(data);
  });
  return c;
};
