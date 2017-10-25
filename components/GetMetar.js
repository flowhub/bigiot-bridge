const noflo = require('noflo');
const metar = require('metar');
// Polyfill for fetch()
require('isomorphic-fetch');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Get weather for the requested METAR station';
  c.icon = 'cloud';
  c.inPorts.add('in', {
    datatype: 'bang',
    description: 'Trigger a fetch',
  });
  c.inPorts.add('station', {
    datatype: 'string',
    description: 'ICAO code for a weather station',
    control: true,
    scoped: false,
  });
  c.outPorts.add('weather', {
    datatype: 'object',
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });
  c.process((input, output) => {
    if (!input.hasData('in', 'station')) {
      return;
    }
    input.getData('in');
    const station = input.getData('station');
    const url = `http://tgftp.nws.noaa.gov/data/observations/metar/stations/${station}.TXT`;
    fetch(url)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Failed with ${response.statusText}`);
        }
        return response.text();
      })
      .then((data) => {
        const parsed = metar(data.split('\n')[1]);
        output.sendDone(new noflo.IP('data', parsed));
      })
      .catch((err) => {
        output.done(err);
      });
  });
  return c;
};
