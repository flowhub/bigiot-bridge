const noflo = require('noflo');

exports.getComponent = function() {
  var c = new noflo.Component();
  c.description = 'Normalize parking data to conform to standardized BIGIoT format';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'object',
    description: 'Raw data from BahnPark API'
  });
  c.outPorts.add('out', {
    datatype: 'object',
    description: 'BIGIoT formatted data'
  });
  c.outPorts.add('error', {
    datatype: 'object'
  });

  c.process(function (input, output) {
    if (!input.hasData('in')) {
      return;
    }
    const indata = input.getData('in');

    if (!indata.allocations) {
        return output.error(new Error("BahnPark data missing .allocations"));
    }

    function fromBahnparkAllocation(a) {
        var status = 'unknown';
        if (a.allocation.category === 0) {
            status = 'unavailable';
        } else if (a.allocation.category >= 1) {
            status = 'available';
        }
        // NOTE: there is also a timeSegment? timeSegment seems rounded to 5 mins
        const o = {
            id: a.space.id,
            lastUpdated: a.allocation.timestamp,
            status: status,
            title: a.space.title,
        }
        return o;
    }

    function allocationIsValid(a) {
        const hasId = (a.space && typeof a.space.id == 'number');
        const hasCapacity = (a.allocation && typeof a.allocation.capacity == 'number' && a.allocation.capacity > 0);
        return hasId && hasCapacity;
    }

    const out = indata.allocations
        .filter(allocationIsValid)
        .map(fromBahnparkAllocation);

    output.sendDone({ out: out, });
  });

  return c;
};

