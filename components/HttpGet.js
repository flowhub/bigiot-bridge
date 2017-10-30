const noflo = require('noflo');

const http = require('http');
const https = require('https');

const getRequest = function (options) {
  return new Promise((resolve, reject) => {
    // defaults to HTTPS
    const lib = typeof options.protocol !== 'undefined' && options.protocol === 'http:' ? http : https;

    const request = lib.get(options, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }

      const body = [];
      response.on('data', (chunk) => { body.push(chunk); });
      response.on('end', () => { resolve(body.join('')); });
    });

    request.on('error', (err) => { reject(err); });
  });
};

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Make a HTTP GET request';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'object',
    description: 'Request data as supported by Node.js http.get()',
  });
  c.outPorts.add('out', {
    datatype: 'string',
    description: 'Response body',
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });

  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const req = input.getData('in');

    getRequest(req).then((body) => {
      output.sendDone({ out: body });
    }).catch((err) => {
      output.done(err);
    });
  });

  return c;
};
