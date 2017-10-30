const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Create a BIG IoT offering description';
  c.icon = 'indent';
  c.inPorts.add('name', {
    datatype: 'string',
    required: true,
  });
  c.inPorts.add('rdfuri', {
    datatype: 'string',
    required: true,
  });
  c.inPorts.add('inputdata', {
    datatype: 'object',
    addressable: true,
    required: true,
  });
  c.inPorts.add('outputdata', {
    datatype: 'object',
    addressable: true,
    required: true,
  });
  c.inPorts.add('extent', {
    datatype: 'string',
    required: true,
  });
  c.inPorts.add('uri', {
    datatype: 'string',
    required: true,
  });
  c.outPorts.add('out', {
    datatype: 'object',
  });
  c.process((input, output) => {
    if (!input.hasData('name', 'rdfuri', 'extent', 'uri')) {
      return;
    }
    const inputsWithData = input.attached('inputdata').filter(idx => input.hasData(['inputdata', idx]));
    if (inputsWithData.length < input.attached('inputdata').length) {
      return;
    }
    const outputsWithData = input.attached('outputdata').filter(idx => input.hasData(['outputdata', idx]));
    if (outputsWithData.length < input.attached('outputdata').length) {
      return;
    }
    const offering = {
      name: input.getData('name'),
      rdfUri: input.getData('rdfuri'),
      inputData: [],
      outputData: [],
      extent: {
        city: input.getData('extent'),
      },
      endpoints: {
        endpointType: 'HTTP_GET',
        uri: input.getData('uri'),
      },
    };
    inputsWithData.forEach((idx) => {
      offering.inputData.push(input.getData(['inputdata', idx]));
    });
    outputsWithData.forEach((idx) => {
      offering.outputData.push(input.getData(['outputdata', idx]));
    });
    output.sendDone(offering);
  });
  return c;
};
