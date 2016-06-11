'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const R = require('ramda');

describe('sequelizeQueryGenerator', () => {
  const queryGenerator = require('../../src/sequelize/queryGenerator');
  const modelRelations = require('../../src/sequelize/modelRelations');
  const pathValidator = require('../../src/sequelize/pathValidator');
  let schema;
  let relationSchema;
  let server;
  let models;
  let sequelize;

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
      schema = modelRelations(sequelize);
      relationSchema = modelRelations(sequelize);
    });
  });

  it('should return an object', () => {
    let parsedPath = pathValidator(schema, 'get', '/users').parsedPath;
    let query = queryGenerator(sequelize, parsedPath, {});
    should.exist(query);
    query.should.be.a('object');
  });

  it('should create query for table scope', () => {
    let parsedPath = pathValidator(schema, 'get', '/users').parsedPath;
    let query = queryGenerator(sequelize, parsedPath, {});
    query.should.deep.equal({model: sequelize.models.user});
  });

  it('should create query for row scope (non numbers)', () => {
    let parsedPath = pathValidator(schema, 'get', '/users/s2ln').parsedPath.reverse();
    let query = queryGenerator(sequelize, parsedPath, {});
    query.should.deep.equal({
      model: sequelize.models.user,
      where: {
        nationalId: "s2ln"
      }
    });
  });

  it('should create query for row scope (numbers)', () => {
    let parsedPath = pathValidator(schema, 'get', '/users/1').parsedPath.reverse();
    let query = queryGenerator(sequelize, parsedPath, {});
    query.should.deep.equal({
      model: sequelize.models.user,
      where: {
        $or: {
          nationalId: '1',
          id: 1
        }
      }
    });
  });

  it('should create query for table though row join', () => {
    let parsedPath = pathValidator(schema, 'get', '/users/1/addresses').parsedPath.reverse();
    let query = queryGenerator(sequelize, parsedPath, {});
    query.should.deep.equal({
      model: sequelize.models.address,
      include: [
        {
          model: sequelize.models.user,
          where: {
            $or: {
              nationalId: '1',
              id: 1
            }
          }
        }
      ]
    });
  });
});
