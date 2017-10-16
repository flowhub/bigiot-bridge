const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Load a named schema';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'Query path',
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
    const path = input.getData('in');

    const token = process.env.BAHNPARK_API_TOKEN;
    const host = 'api.deutschebahn.com';

    const r = {
      protocol: 'https:',
      host,
      path,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    output.sendDone({ out: r });
  });

  return c;
};

