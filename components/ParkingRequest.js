const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Formulate an API request';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'Query path',
  });
  c.inPorts.add('token', {
    datatype: 'string',
    description: 'API token',
  });
  c.outPorts.add('out', {
    datatype: 'object',
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });

  c.process((input, output) => {
    if (!input.hasData('in', 'token')) {
      return;
    }
    const path = input.getData('in');
    const token = input.getData('token');

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

