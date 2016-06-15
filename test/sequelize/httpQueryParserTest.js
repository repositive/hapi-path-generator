'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const R = require('ramda');
const util = require('util');

describe('Query Validator', () => {
  const queryValidator = require('../../src/sequelize/httpQueryParser');
  const modelRelations = require('../../src/sequelize/modelRelations');

  let server;
  let models;
  let sequelize;
  let schema;

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
      schema = modelRelations(sequelize);
    });
  });

  describe('urlQueryParser', () => {
    const queryParser = queryValidator.urlQueryParser;

    it('should return an object', () => {
      let result = queryParser(schema, models.user, {});
      should.exist(result);
      result.should.be.a('object');
    });

    it('should return the models of the embedded properties', () => {
      let result = queryParser(schema, models.user, {embed: ['addresses', 'tags']});
      should.exist(result.embed.addresses);
      should.exist(result.embed.tags);
    });

    it('should return the models of the embedded attributes', () => {
      let result = queryParser(schema, models.user, {name: 'Istar'});
      should.exist(result.attributes.name);
      result.attributes.name.should.equal('Istar');
    });

    it('should add limit, offset & sort to pagination', () => {
      let result = queryParser(schema, models.user, {limit: 10, offset: 10, sort: ['name', 'desc']});
      result.should.deep.equal({
        attributes: {},
        pagination: {
          limit: 10,
          offset: 10,
          sort: ['name', 'desc']
        }
      });
    });

    it('if sort is not an array convert it', () => {
      let result = queryParser(schema, models.user, {limit: 10, offset: 10, sort: 'name'});
      result.should.deep.equal({
        attributes: {},
        pagination: {
          limit: 10,
          offset: 10,
          sort: ['name']
        }
      });
    });
  });
});