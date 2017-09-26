const tv4 = require('tv4');
const noflo = require('noflo');

exports.getComponent = function() {
  var c = new noflo.Component();
  c.description = 'Validate data against JSON schema';
  c.icon = 'forward';
  c.inPorts.add('schema', {
    datatype: 'object',
    description: 'Fully-resolved JSON schema'
  });
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Data to validate'
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });
  c.outPorts.add('errors', {
    datatype: 'array',
    description: 'Array of errors. If valid will be empty',
  });
  c.process(function (input, output) {
    // Check preconditions on input data
    if (!input.hasData('schema', 'in')) {
      return;
    }
    // Read packets we need to process
    const schema = input.getData('schema');
    const data = input.getData('in');

    const result = tv4.validateMultiple(data, schema);

    if (result.missing.length > 0) {
      return output.error(new Error(`Missing schema references: $(result.missing)`));
    }

    // Sanity check that errors always set if not valid
    if (!result.valid !== (result.errors.length > 0)) {
      return output.error(new Error(`ValidateData post-condition failed: isInvalid == hasErrors`))
    }

    output.sendDone({ errors: result.errors, });
  });
  return c;
};

