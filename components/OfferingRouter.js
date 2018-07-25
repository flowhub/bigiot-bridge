const noflo = require('noflo');
const url = require('url');
const uuid = require('uuid');
const cors = require('cors');

const typesToMethods = {
  HTTP_GET: 'get',
};

function enableCors(app) {
  app.use(cors());
  app.options('*', cors()); // enable for pre-flight also
}

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Express router for serving BIG IoT offerings';
  c.icon = 'code-fork';
  c.inPorts.add('app', {
    datatype: 'object',
    description: 'Express Application or Router',
    required: true,
    control: true,
  });
  c.inPorts.add('offering', {
    datatype: 'object',
    description: 'BIG IoT Offerings with routing index',
    scoped: false,
  });
  c.outPorts.add('req', {
    datatype: 'object',
    description: 'Express Request objects (contains responses and matched offerings)',
    scoped: true,
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });
  c.process((input, output) => {
    if (!input.hasData('app', 'offering')) {
      return;
    }
    const app = input.getData('app');
    const { offering, index } = input.getData('offering');
    const endpoint = offering.endpoints;
    if (!typesToMethods[endpoint.endpointType]) {
      output.done(new Error(`Unsupported endpoint type ${endpoint.endpointType}`));
      return;
    }
    const { pathname } = url.parse(endpoint.uri);

    enableCors(app);

    // Set up Express route
    const route = app.route(pathname);
    route[typesToMethods[endpoint.endpointType]]((req, res) => {
      const id = uuid.v4();
      req.id = id;
      res.id = id;
      output.send({
        req: new noflo.IP('data', {
          req,
          res,
          offering,
          index,
        }, {
          scope: id,
        }),
      });
    });
    output.done();
  });
  return c;
};
