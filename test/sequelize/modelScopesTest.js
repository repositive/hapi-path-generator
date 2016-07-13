'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const R = require('ramda');


describe('Model Scopes', () => {
  const modelScopes = require('../../dist/sequelize/modelScopes').default;
  let scopes;
  let server;
  let models;
  let sequelize;

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
      scopes = modelScopes(models.user);
    });
  });

  it('should return an object', () => {
    should.exist(scopes);
    scopes.should.be.a('object');
  });

  it('should contain all the scopes of the object', () => {
    should.exist(scopes.withA);
  });

  it('should not contain stuff that is not a scope', () => {
    should.not.exist(scopes.name);
  });

});
