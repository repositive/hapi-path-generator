'use strict';
const chai = require('chai');
const should = chai.should();
const plugin = require('../src/');
const Hapi = require('hapi');

describe('hapi-route-generator', () => {

  let server;

  beforeEach((done) => {
    server = new Hapi.Server();
    console.log('before');
    server.connection();
    done();
  });

  it('should load', (done) => {
    server.register(plugin, (err) => {
      should.not.exist(err);
      done();
    });
  });
});
