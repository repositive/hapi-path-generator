'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('../serverSetup');
const hapiPaths = require('../../dist/sequelize/sequelizePaths').default;
const R = require('ramda');
const util = require('util');

describe('Create', () => {
  let server;
  let sequelize;
  let paths;

  function getRoute(method, path) {
    return paths.filter((r) => {
      return r.method == method && r.path == path;
    })[0];
  }

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      let defaultOptions = {
        relationLimit: 3,
        prefix: '',
        idFormat: 'curly'
      };
      return sequelize.sync().then(() => {
        paths = hapiPaths(sequelize, defaultOptions);
      });

    });
  });

  it('should be able to crate a new user', () => {
    let route = getRoute('post', '/users');

    let context = {
      payload: {
        name: 'Istar'
      }
    };

    return route.query(context).then((result) => {
      should.exist(result.id);
      should.exist(result.name);
      result.name.should.equal('Istar');
    });

  });

  it('should return a list of users', () => {

    let route = getRoute('get', '/users');
    should.exist(route);

    let context = {
      query: {
        limit: 1
      }
    };

    return route.query(context).then((result) => {
      should.exist(result);
      result.should.be.a('array');
      result.length.should.equal(1);
      should.exist(result[0].id);
    });

  });

  it('should update a user', () => {
    let get = getRoute('get', '/users');
    let getContext = {query: {limit:1}};
    return get.query(getContext).then((userR) => {
      let user = userR[0];
      let put = getRoute('put', `/users/{user_id}`);
      let putContext = {
        identifiers: {
          user_id: user.id
        },
        payload: {
          name: user.name + 'updated'
        }
      };

      return put.query(putContext).then((response) => {
        should.exist(response);
        should.exist(response.id);
        response.id.should.equal(user.id);
        response.name.should.equal(putContext.payload.name);
      });
    });
  });

  it('should delete a user', () => {
    let create = getRoute('post', '/users');
    let createContext = {
      payload: {}
    };
    return create.query(createContext).then((userR) => {
      let del = getRoute('delete', `/users/{user_id}`);
      let delContext = {
        identifiers: {
          user_id: userR.id
        }
      };
      should.exist(del);
      return del.query(delContext).then((response) => {
        should.exist(response);
        should.exist(response.deleted);
        response.deleted.should.equal(1);
      });
    });
  });


});
