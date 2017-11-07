const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Convert occupancy category to number of available parking spaces';
  c.icon = 'car';
  c.inPorts.add('in', {
    datatype: 'string',
  });
  c.outPorts.add('out', {
    datatype: 'number',
  });
  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const data = input.getData('in');
    let number = 0;
    switch (data) {
      case '1':
        number = 10;
        break;
      case '2':
        number = 20;
        break;
      case '3':
        number = 30;
        break;
      case '4':
        number = 50;
        break;
    }
    output.sendDone({
      out: number,
    });
  });
  return c;
};
