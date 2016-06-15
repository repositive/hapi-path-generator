'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const R = require('ramda');
const util = require('util');

describe.skip('urlQueryValidator', () => {
  const queryValidator = require('../../src/sequelize/urlQueryValidator');
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
      let result = util.inspect(queryParser(schema, models.user, {embed: ['addresses']}));
      result.should.deep.equal(util.inspect({
        embed: {
          addresses: models.address
        }
      }));
    });
  });
});
