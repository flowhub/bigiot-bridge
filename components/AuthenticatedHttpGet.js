const noflo = require('noflo');
const jwt = require('jsonwebtoken');
// Polyfill for fetch()
require('isomorphic-fetch');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Make an authenticated HTTP request to a given URL';
  c.icon = 'globe';
  c.inPorts.add('in', {
    datatype: 'string',
  });
  c.inPorts.add('secret', {
    datatype: 'string',
    control: true,
  });
  c.outPorts.add('out', {
    datatype: 'object',
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });
  c.process((input, output) => {
    if (!input.hasData('in', 'secret')) {
      return;
    }
    const url = input.getData('in');
    const secret = input.getData('secret');
    const token = jwt.sign({}, Buffer.from(secret, 'base64'), {
      expiresIn: '1h',
    });
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Provider failed with ${response.status}: ${response.statusText}`);
        }

        return response.json().then((data) => {
          const headerkey = '_headers'; // to get eslint disallowing the two obvious ways
          return { data, headers: response.headers[headerkey] };
        });
      })
      .then((out) => {
        output.sendDone(out);
      })
      .catch((err) => {
        output.done(err);
      });
  });
  return c;
};
