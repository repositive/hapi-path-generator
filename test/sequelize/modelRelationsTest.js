'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const R = require('ramda');
const util = require('util');

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
    let example = util.inspect({
      addresses: {
        model: sequelize.models.address,
        identifiers: {
          id: 'INTEGER'
        },
        users: 'own',
        poscodes: 'own'
      },
      users: {
        addresses: 'external',
        model: sequelize.models.user,
        identifiers: {
          id: 'INTEGER',
          nationalId: 'STRING'
        },
      },
      poscodes: {
        addresses: 'external',
        model: sequelize.models.poscode,
        identifiers: {
          id: 'INTEGER'
        },
      },
      nonrelated: {
        model: sequelize.models.nonrelated,
        identifiers: {
          id: 'INTEGER'
        },
      }
    });
    let relations = util.inspect(modelRelations(sequelize));
    relations.should.deep.equal(example);
  });

});
