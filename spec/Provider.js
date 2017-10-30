const { expect } = require('chai');
const noflo = require('noflo');
const path = require('path');
// Polyfill for fetch()
require('isomorphic-fetch');

describe('Provider graph', () => {
  describe('With a simple response handler', () => {
    let loader = null;
    let graph = null;
    let nw = null;
    before(function (done) {
      this.timeout(8000);
      graph = new noflo.Graph('Test');
      graph.addNode('Provider', 'flowhub-bigiot-bridge/Provider');
      graph.addNode('Invert', 'test/Invert');
      graph.addNode('ServerCallback', 'core/Callback');
      graph.addEdge('Provider', 'request', 'Invert', 'in');
      graph.addEdge('Invert', 'out', 'Provider', 'response');
      graph.addEdge('Provider', 'app', 'ServerCallback', 'in');
      graph.addInitial({
        hostname: 'localhost',
        port: 5000,
        provider_id: process.env.BIGIOT_PROVIDER_ID,
        provider_secret: process.env.BIGIOT_PROVIDER_SECRET,
      }, 'Provider', 'config');
      graph.addInitial({
        name: 'test offering',
        rdfUri: 'http://example.org/test',
        inputData: [
          {
            name: 'temperature',
            rdfUri: 'http://schema.org/airTemperatureValue',
          }
        ],
        outputData: [
          {
            name: 'temperature',
            rdfUri: 'http://schema.org/airTemperatureValue',
          }
        ],
        extent: {
          city: 'Berlin',
        },
        endpoints: {
          uri: '/foo'
        },
      }, 'Provider', 'offering');
      loader = new noflo.ComponentLoader(path.resolve(__dirname, '../'));
      loader.listComponents((err) => {
        if (err) {
          done(err);
          return;
        }
        graph.componentLoader = loader;
        loader.registerComponent('test', 'Invert', () => {
          const c = new noflo.Component();
          c.inPorts.add('in');
          c.outPorts.add('out');
          c.process((input, output) => {
            const data = input.getData('in');
            const result = {};
            Object.keys(data).forEach((key) => {
              result[key] = !data[key];
            });
            output.sendDone(result);
          });
          return c;
        });
        done();
      });
    });
    it('should be able to start', (done) => {
      graph.addInitial((app) => {
        done();
      }, 'ServerCallback', 'callback');
      nw = new noflo.Network(graph);
      nw.connect((err) => {
        if (err) {
          done(err);
          return;
        }
        nw.start((err) => {
          if (err) {
            done(err);
            return;
          }
        });
      });
    }).timeout(8000);
    it('should respond to a request', () => {
      return fetch('http://localhost:5000/foo?temperature=true')
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`Provider failed with ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.temperature).to.equal(false);
        });
    });
    it('should be able to stop', (done) => {
      setTimeout(() => {
        nw.stop(done);
      }, 1000);
    }).timeout(4000);
  });
});
