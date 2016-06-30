'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('./serverSetup');
const R = require('ramda');
const util = require('util');

describe('Path Generator', () => {
  const modelRelations = require('../dist/sequelize/modelRelations').default;
  const pathGenerator = require('../dist/pathGenerator').default;
  let server;
  let sequelize;
  let models;
  let schema;

  let defaultOptions = {
    relationLimit: 3,
    prefix: '',
    idFormat: 'curly'
  };

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
      schema = modelRelations(sequelize);
    });
  });

  it('should return an array', () => {
    let result = pathGenerator(schema, defaultOptions);
    should.exist(result);
    result.should.be.a('array');
  });

  it('should limit the relations', () => {
    let result = pathGenerator(schema, {relationLimit: 0, prefix: ''});
    result.length.should.equal(0);
  });

  describe('table generator', () => {
    const tableGenerator = require('../dist/pathGenerator').tableGenerator;

    it('should return an array', () => {
      let result = tableGenerator({options: defaultOptions}, 'users', schema);
      should.exist(result);
      result.should.be.a('array');
    });

    it('routes should contain path, method and query', () => {
      let result = tableGenerator({options: defaultOptions}, 'users', schema)[0];

      should.exist(result.path);
      result.path.should.be.a('string');
      should.exist(result.method);
      result.method.should.be.a('string');
      should.exist(result.history);
      result.history.should.be.a('array');
      result.history.length.should.equal(1);
    });

    it('should concatenate {identifier} to the path', () => {
      let result = tableGenerator({options: defaultOptions}, 'users', schema)[0];

      result.path.should.equal('/users');
    });

    it('should generate routes with colon ids', () => {
      let result = tableGenerator({options: {
        relationLimit: 3,
        prefix: '',
        idFormat: 'colons'
      }}, 'addresses', schema);

      let paths = result.map((route) => {return route.path; });
      paths.should.contain('/addresses/:address_id/poscode');
    });

    it('it append prefix if present in the options', () => {
      let options = {
        relationLimit: 3,
        prefix: '/api',
        idFormat: 'curly'
      };
      let result = tableGenerator({options: options}, 'users', schema)[0];

      result.path.should.equal('/api/users');
    });

    it('should generate routes for get put & delete', () => {
      let result = tableGenerator({
        history: [],
        options: defaultOptions
      }, 'users', schema);

      let methods = result.map((route) => {return route.method; });

      methods.should.contain('get');
      methods.should.contain('post');
      methods.should.contain('delete');
    });

    it('should generate routes for the child rows', () => {
      let result = tableGenerator({options: defaultOptions}, 'users', schema);

      let paths = result.map((route) => {return route.path; });

      paths.should.contain('/users/{user_id}');
    });

    it('If the table exist in the history do not generate paths', () => {
      let state = { options: defaultOptions,path: '/users/3', history: [
        {
          type: 'row',
          table: 'users'
        },
        {
          type: 'table',
          table: 'users'
        }
      ]};
      let result = tableGenerator(state, 'users', schema);
      result.length.should.equal(0);
    });

    it('should increase the history', () => {
      let result = tableGenerator({options: defaultOptions}, 'users', schema);

      result[0].history.length.should.equal(1);
    });

    it('should add the table and model to the history', () => {
      let result = tableGenerator({
        options: defaultOptions,
        path: '/addresses',
        history: [{type: 'table', table: 'addresses'}]
      }, 'poscodes', schema);

      let history = result[0].history[1];
      should.exist(history && history.table);
      history.table.should.equal('poscodes');
      history.model.should.equal('poscode');
    });

  });


  describe('row generator', () => {
    const rowGenerator = require('../dist/pathGenerator').rowGenerator;

    it('should return an array', () => {
      let result = rowGenerator({options: defaultOptions,options: defaultOptions}, 'users', schema);
      should.exist(result);
      result.should.be.a('array');
    });

    it('routes should contain path, method and query', () => {
      let result = rowGenerator({options: defaultOptions,options: defaultOptions}, 'users', schema)[0];

      should.exist(result.path);
      result.path.should.be.a('string');
      should.exist(result.method);
      result.method.should.be.a('string');
      should.exist(result.history);
      result.history.should.be.a('array');
    });

    it('should concatenate {identifier} to the path', () => {
      let state = { options: defaultOptions,
        path: '/users',
        history: [{
          type: 'table',
          table: 'usres'
        }]
      };
      let result = rowGenerator(state, 'users', schema)[0];

      result.path.should.equal('/users/{user_id}');
    });

    it('should concatenate the singular name to path if the resource is many related', () => {
      let state = { options: defaultOptions,
        history: [
          {table: 'addresses', type: 'row'},
          {table: 'addresses', type: 'table'}
        ],
        path: '/addresses/{address_id}'
      };

      let result = rowGenerator(state, 'poscodes', schema);
      let paths = result.map((route) => {return route.path; });

      paths.should.contain('/addresses/{address_id}/poscode');
    });

    it('should generate routes for get put & delete', () => {
      let state = { options: defaultOptions,
        path: '/users',
        history: [{
          table: 'users',
          type: 'table'
        }]
      };
      let result = rowGenerator(state, 'users', schema);

      let methods = result.map((route) => {return route.method; });

      methods.should.contain('get');
      methods.should.contain('put');
      methods.should.contain('delete');
    });

    it('dont increase the history if the table is the same', () => {
      let result = rowGenerator({options: defaultOptions,
        path: '/users',
        history: [{type: 'table', table: 'users'}]
      }, 'users', schema);

      result[0].history.length.should.equal(1);
    });

    it('should increase the history when relations', () => {
      let result = rowGenerator({options: defaultOptions,
        path: '/addresses',
        history: [{type: 'table', table: 'addresses'}]
      }, 'poscodes', schema);

      result[0].history.length.should.equal(2);
    });

    it('should add the table and model to the history', () => {
      let result = rowGenerator({options: defaultOptions,
        path: '/addresses',
        history: [{type: 'table', table: 'addresses'}]
      }, 'poscodes', schema);

      let history = result[0].history[1];
      should.exist(history && history.table);
      history.table.should.equal('poscodes');
      history.model.should.equal('poscode');
    });


    it('should generate routes for the related tables', () => {
      let state = { options: defaultOptions,
        path: '/users',
        history: [
          {type: 'table', table: 'users'}
        ]
      };
      let result = rowGenerator(state, 'users', schema);

      let paths = result.map((route) => {return route.path; });

      paths.should.contain('/users/{user_id}/addresses');
    });

    it('should generate routes for the related tables when relation one to many', () => {
      let result = rowGenerator({options: defaultOptions,
        path: '/addresses',
        history: [
          {type: 'table', table: 'addresses'}
        ]
      }, 'addresses', schema);

      let paths = result.map((route) => {return route.path; });
      paths.should.contain('/addresses/{address_id}/poscode');
    });



  });



});
