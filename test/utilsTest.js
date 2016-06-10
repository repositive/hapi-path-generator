'use strict';

const chai = require('chai');
const should = chai.should();
const hapi = require('./serverSetup');
const R = require('ramda');

describe('utils', () => {

  let server;
  let models;
  let sequelize;

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
      return sequelize.sync();
    });
  });

  describe('modelIdentifiers', () => {
    const modelIdentifiers = require('../src/utils/modelIdentifiers');
    let identifiers;

    before(() => {
      identifiers = modelIdentifiers(models.user);
    });

    it('should return an array', () => {
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
  });

  describe('Model Relations', () => {
    const modelRelations = require('../src/utils/modelRelations');


    describe('Relation Extractor Helper', () => {
      const relationExtractor = modelRelations.relationExtractor;

      it('relationExtractor should return an array', () => {
        let relations = relationExtractor(models.user);
        should.exist(relations);
        relations.should.be.a('array');
      });

      it('should return all the relations of a table', () => {
        let relations = relationExtractor(models.address);
        JSON.stringify(relations).should.equal(JSON.stringify(['users', 'poscodes']));
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
          addresses: 'external'
        },
        addresses: {
          users: 'own',
          poscodes: 'own'
        },
        poscodes: {
          addresses: 'external'
        },
        nonrelated: {}
      };
      let relations = modelRelations(sequelize);
      relations.should.deep.equal(example);
    });


  });
});
