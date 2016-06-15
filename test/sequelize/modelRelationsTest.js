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
    let example = {
      addresses: {
        model: 'address',
        identifiers: {
          id: 'INTEGER'
        },
        relations: {
          users: 'one',
          poscodes: 'one'
        }
      },
      users: {
        relations: {
          addresses: 'many',
          tags: 'many',
          usr_tags: 'many'
        },
        model: 'user',
        identifiers: {
          id: 'INTEGER',
          nationalId: 'STRING'
        }
      },
      poscodes: {
        relations: {
          addresses: 'many'
        },
        model: 'poscode',
        identifiers: {
          id: 'INTEGER'
        }
      },
      nonrelated: {
        model: 'nonrelated',
        identifiers: {
          id: 'INTEGER'
        },
        relations: {}
      },
      tags: {
        model: 'tag',
        identifiers: { id: 'INTEGER' },
        relations: {
          users: 'one',
          usr_tags: 'many'
        }
      },
      usr_tags: {
        model: 'usr_tags',
        identifiers: { tagId: 'INTEGER', userId: 'INTEGER'},
        relations: { tags: 'one', users: 'one'}
      }
    };
    let relations = util.inspect(modelRelations(sequelize));
    relations.should.deep.equal(util.inspect(example));
  });

});
