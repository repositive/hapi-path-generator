'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
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

    it('should contain tye type of the fields', () => {
      identifiers.id.should.equal('INTEGER');
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

  describe('Request Validator', () => {
    const pathValidator = require('../src/utils/pathValidator');
    const modelRelations = require('../src/utils/modelRelations');
    let relationSchema;

    before(() => {
      relationSchema = modelRelations(sequelize);
    });

    describe('Path Parser', () => {
      const pathParser = pathValidator.pathParser;

      it('should return an array', () => {
        let result = pathParser(relationSchema, '/users');
        should.exist(result);
        result.should.be.a('array');
      });

      it('should be able to parse table scopes', () => {
        let usertable = pathParser(relationSchema, '/users');
        usertable.should.deep.equal([{table:'users', model: 'user'}]);
      });

      it('should be able to parse more complex table scopes', () => {
        let usertable = pathParser(relationSchema, '/users/someId/addresses');
        usertable.should.deep.equal([{table: 'addresses', model: 'address'},{table:'users', model: 'user', identifier: 'someId'}]);
      });

      it('should throw an exception if the table does not exist', () => {
        function wrapper() {
          pathParser(relationSchema, '/nonexist/someId/addresses');
        }
        expect(wrapper).to.throw('The resource nonexist does not exist');
      });
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
      let result = pathValidator(relationSchema, 'get', '/users/id');
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

  describe('sequelizeQueryGenerator', () => {
    const queryGenerator = require('../src/utils/sequelizeQueryGenerator');
    const modelRelations = require('../src/utils/modelRelations');
    const pathValidator = require('../src/utils/pathValidator');
    let schema;

    before(() => {
      schema = modelRelations(sequelize);
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
            nationalId: 1,
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
                nationalId: 1,
                id: 1
              }
            }
          }
        ]
      });
    });
  });
});
