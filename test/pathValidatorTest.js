'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('./serverSetup');
const R = require('ramda');
const util = require('util');

describe('Request Validator', () => {
  const pathValidator = require('../src/pathValidator');
  const modelRelations = require('../src/sequelize/modelRelations');
  let relationSchema;
  let server;
  let models;
  let sequelize;

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
      relationSchema = modelRelations(sequelize);
    });
  });

  describe('Path Parser', () => {
    const pathParser = pathValidator.pathParser;

    it('should return an array', () => {
      let result = pathParser(relationSchema, '/users');
      should.exist(result);
      result.should.be.a('array');
    });

    it('should be able to parse table scopes', () => {
      let usertable = util.inspect(pathParser(relationSchema, '/users'));
      usertable.should.deep.equal(util.inspect(
        [{ table:'users', model: sequelize.models.user }]
      ));
    });

    it('should show the potential ids for row scopes', () => {
      let usertable = util.inspect(pathParser(relationSchema, '/users/1/'));
      usertable.should.deep.equal(util.inspect(
        [
          {
            table: 'users', model: sequelize.models.user,
            potentialIds: {
              id: 1,
              nationalId: '1'
            }
          }
        ]
      ));
    });

    it('should be able to parse more complex table scopes', () => {
      let usertable = util.inspect(pathParser(relationSchema, '/users/1/addresses'));
      usertable.should.deep.equal(util.inspect(
        [
          {
            table:'users', model: sequelize.models.user,
            potentialIds: {
              id: 1,
              nationalId: '1'
            }
          },
          { table: 'addresses', model: sequelize.models.address }
        ]
      ));
    });

    it('should throw an exception if the table does not exist', () => {
      function wrapper() {
        pathParser(relationSchema, '/nonexist/someId/addresses');
      }
      expect(wrapper).to.throw('The resource nonexist does not exist');
    });

    it('should throw an exception if the table in row scope does not exist', () => {
      function wrapper() {
        pathParser(relationSchema, '/nonexist/someId/');
      }
      expect(wrapper).to.throw('The resource nonexist does not exist');
    });

    it('should throw an exception if the identifier is not valid for the model', () => {
      function wrapper() {
        pathParser(relationSchema, '/addresses/someId/');
      }
      expect(wrapper).to.throw('The identifier someId is not valid');
    });
  });

  it('should return valid for get row in user non number id', () => {
    let result = pathValidator(relationSchema, 'get', '/users/s2ln');
    result.status.should.equal('valid');
  });

  it('should return invalid when sending POST with row scope', () => {
    let result = pathValidator(relationSchema, 'post', '/users/id');
    result.status.should.equal('invalid');
  });

  it('should return invalid when sending put with table scope', () => {
    let result = pathValidator(relationSchema, 'put', '/users/id/addresses');
    result.status.should.equal('invalid');
  });

  it('should return invalid when the table does not exist', () => {
    let result = pathValidator(relationSchema, 'get', '/users/id/nonvalid');
    result.status.should.equal('invalid');
  });

  it('should return valid when the table exists and get', () => {
    let result = pathValidator(relationSchema, 'get', '/users');
    result.status.should.equal('valid');
  });

  it('should return valid when the table exists and post', () => {
    let result = pathValidator(relationSchema, 'post', '/users');
    result.status.should.equal('valid');
  });

  it('should return valid when the table exists and delete', () => {
    let result = pathValidator(relationSchema, 'delete', '/users');
    result.status.should.equal('valid');
  });

  it('should return invalid when the table does not exist and get row', () => {
    let result = pathValidator(relationSchema, 'get', '/users/1');
    result.status.should.equal('valid');
  });

  it('should return invalid when the table does not exist and get row', () => {
    let result = pathValidator(relationSchema, 'get', '/nonexist/id');
    result.status.should.equal('invalid');
  });

  it('should return invalid when the table does not exist and put row', () => {
    let result = pathValidator(relationSchema, 'put', '/nonexist/id');
    result.status.should.equal('invalid');
  });

  it('should return invalid when the table does not exist and delete row', () => {
    let result = pathValidator(relationSchema, 'delete', '/nonexist/id');
    result.status.should.equal('invalid');
  });
});
