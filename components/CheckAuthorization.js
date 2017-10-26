const noflo = require('noflo');
const { provider: BigIotProvider } = require('bigiot-js');

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
  c.inPorts.add('anonymous', {
    datatype: 'boolean',
    description: 'Whether to allow anonymous requests',
    control: true,
    scoped: false,
    default: false,
  });
  c.outPorts.add('req', {
    datatype: 'object',
    description: 'Validated HTTP request',
    scoped: true,
  });
  c.process((input, output) => {
    if (!input.hasData('req', 'secret')) {
      return;
    }
    if (input.attached('anonymous').length && !input.hasData('anonymous')) {
      return;
    }
    const req = input.getData('req');
    const secret = input.getData('secret');
    let anonymous = false;
    if (input.hasData('anonymous')) {
      anonymous = input.getData('anonymous');
    }
    if (anonymous && !req.req.headers.authorization) {
      // Debug mode: allowing anon requests
      output.sendDone({
        req,
      });
      return;
    }
    if (!req.req.headers.authorization) {
      req.res.status(401).send('Authentication bearer token required');
      output.done();
      return;
    }
    const prov = new BigIotProvider('auth', secret);
    const token = req.req.headers.authorization.slice(7);
    prov.validateToken(token)
      .then(() => {
        output.sendDone({
          req,
        });
      })
      .catch((err) => {
        req.res.status(403).send(err.message);
        output.done();
      });
  });
  return c;
};
