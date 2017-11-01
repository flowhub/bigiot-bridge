const noflo = require('noflo');


exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Extract relevant details for an allocation';
  c.icon = 'car';
  c.inPorts.add('in', {
    datatype: 'object',
  });
  c.outPorts.add('id', {
    datatype: 'string',
  });
  c.outPorts.add('category', {
    datatype: 'number',
  });
  c.forwardBrackets = {
    in: ['id', 'category'],
  };
  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const allocation = input.getData('in');
    output.sendDone({
      id: allocation.space.id,
      category: allocation.allocation.category,
    });
  });
  return c;
};
