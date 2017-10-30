const noflo = require('noflo');

function fromBahnparkAllocation(spaces, a) {
  // FIXME: use a semantic data for a set of parking spaces instead of a single
  let status = 'unknown';
  if (a.allocation.category === 0) {
    status = 'unavailable';
  } else if (a.allocation.category >= 1) {
    status = 'available';
  }

  const space = spaces[a.space.id];

  // NOTE: there is a timeSegment in addition to timestamp? timeSegment seems rounded to 5 mins
  const o = {
    id: a.space.id,
    lastUpdated: a.allocation.timestamp,
    status,
    title: a.space.title,
    Latitude: space.geoLocation.latitude,
    Longitude: space.geoLocation.longitude,
  };
  return o;
}

function allocationIsValid(a) {
  const hasId = (a.space && typeof a.space.id === 'number');
  const hasCapacity = (a.allocation && typeof a.allocation.capacity === 'number' && a.allocation.capacity > 0);
  return hasId && hasCapacity;
}

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Normalize parking data to conform to standardized BIGIoT format';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'object',
    description: 'Raw data from BahnPark API',
  });
  c.outPorts.add('out', {
    datatype: 'object',
    description: 'BIGIoT formatted data',
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });

  c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const indata = input.getData('in');

    if (!indata.occupancy) {
      output.done(new Error('BahnPark data missing .occupancy'));
      return;
    }
    if (!indata.occupancy.allocations) {
      output.done(new Error('BahnPark data missing .occupancy.allocations'));
      return;
    }

    if (!indata.spaces) {
      output.done(new Error('BahnPark data missing .spaces'));
      return;
    }
    if (!indata.spaces.items) {
      output.done(new Error('BahnPark data missing .spaces.items'));
      return;
    }
    if (indata.spaces.count !== indata.spaces.totalCount) {
      output.done(new Error('BahnPark data does not have data for all .spaces'));
      return;
    }

    const spacesById = {};
    indata.spaces.items.forEach((space) => {
      spacesById[space.id] = space;
    });
    const out = indata.occupancy.allocations
      .filter(allocationIsValid)
      .map(a => fromBahnparkAllocation(spacesById, a));

    output.sendDone({ out });
  });

  return c;
};

