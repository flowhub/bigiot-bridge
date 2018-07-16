const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Formulate an API request';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'bang',
    description: 'Prepare query',
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
    input.getData('in');

    const r = {
      protocol: 'https:',
      host: 'www.stadt-koeln.de',
      path: '/externe-dienste/open-data/parking.php',
    };

    output.sendDone({ out: r });
  });

  return c;
};
