'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const R = require('ramda');


describe('Model Identifiers', () => {
  const modelIdentifiers = require('../../src/sequelize/modelIdentifiers');
  let identifiers;
  let server;
  let models;
  let sequelize;

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
      identifiers = modelIdentifiers(models.user);
    });
  });

  it('should return an object', () => {
    should.exist(identifiers);
    identifiers.should.be.a('object');
  });

  it('should contain all the identifiers of the object', () => {
    should.exist(identifiers.id);
  });

  it('should not contain stuff that is not identifier', () => {
    should.not.exist(identifiers.name);
  });

  it('should contain also unique fields', () => {
    should.exist(identifiers.nationalId);
  });

  it('should contain tye type of the fields', () => {
    identifiers.id.should.equal('INTEGER');
  });
});
