'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const R = require('ramda');

describe('Model Relations', () => {
  const modelRelations = require('../../src/sequelize/modelRelations');
  let server;
  let models;
  let sequelize;

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
    });
  });

  describe('Relation Extractor Helper', () => {
    const relationExtractor = modelRelations.relationExtractor;

    it('relationExtractor should return an array', () => {
      let relations = relationExtractor(models.user);
      should.exist(relations);
      relations.should.be.a('array');
    });

    it('should return all the relations of a table', () => {
      let relations = relationExtractor(models.address);
      relations.should.deep.equal(['users', 'poscodes']);
    });
  });

  it('should return an object', () => {
    let relations = modelRelations(sequelize);
    should.exist(relations);
    relations.should.be.a('object');
  });

  it('should contain a representation of the relations in the db', () => {
    let example = {
      users: {
        model: 'user',
        addresses: 'external'
      },
      addresses: {
        model: 'address',
        users: 'own',
        poscodes: 'own'
      },
      poscodes: {
        model: 'poscode',
        addresses: 'external'
      },
      nonrelated: {
        model: 'nonrelated'
      }
    };
    let relations = modelRelations(sequelize);
    relations.should.deep.equal(example);
  });

});
