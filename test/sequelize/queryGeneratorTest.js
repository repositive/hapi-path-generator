'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const R = require('ramda');
const util = require('util');

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
    let query = queryGenerator(parsedPath, {});
    should.exist(query);
    query.should.be.a('object');
  });

  it('should create query for table scope', () => {
    let parsedPath = pathValidator(schema, 'get', '/users').parsedPath;
    let query = util.inspect(queryGenerator(parsedPath, {}));
    query.should.deep.equal(util.inspect(
      { model: sequelize.models.user }
    ));
  });

  it('should create query for row scope (non numbers)', () => {
    let parsedPath = pathValidator(schema, 'get', '/users/s2ln').parsedPath;
    let query = util.inspect(queryGenerator(parsedPath, {}));
    query.should.deep.equal(util.inspect({
      model: sequelize.models.user,
      where: {
        nationalId: "s2ln"
      }
    }));
  });

  it('should create query for row scope (numbers)', () => {
    let parsedPath = pathValidator(schema, 'get', '/users/1').parsedPath;
    let query = util.inspect(queryGenerator(parsedPath, {}));
    query.should.deep.equal(util.inspect({
      model: sequelize.models.user,
      where: {
        $or: {
          id: 1,
          nationalId: '1'
        }
      }
    }));
  });

  it('should create query for table though row join', () => {
    let parsedPath = pathValidator(schema, 'get', '/users/1/addresses').parsedPath;
    let query = util.inspect(queryGenerator(parsedPath, {}));
    query.should.deep.equal(util.inspect({
      model: sequelize.models.address,
      include: [
        {
          model: sequelize.models.user,
          where: {
            $or: {
              id: 1,
              nationalId: '1'
            }
          },
          attributes: []
        }
      ]
    }));
  });

  it('should create query for multiple nested tables', () => {
    let parsedPath = pathValidator(schema, 'get', '/users/1/addresses/3/poscodes').parsedPath;
    let query = util.inspect(queryGenerator(parsedPath, {}));
    query.should.deep.equal(util.inspect({
      model: sequelize.models.poscode,
      include: [
        {
          model: sequelize.models.address,
          include: [
            {
              model: sequelize.models.user,
              where: {
                $or: {
                  id: 1,
                  nationalId: '1'
                }
              },
              attributes: []
            }
          ],
          where: {
              id: 3
          },
          attributes: []
        }
      ]
    }));
  });
});
