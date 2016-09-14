'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const hapi = require('./serverSetup');
const R = require('ramda');
const util = require('util');

describe('Integration', () => {
  const pathGenerator = require('../dist');
  let server;
  let sequelize;
  let inject;
  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;

      inject = function(options) {
        return new Promise((resolve, reject) => {
          server.inject(options, resolve);
        });
      };

      return new Promise((resolve, reject) => {
        server.register(
          {
            register: pathGenerator,
            options: {
              sequelize: sequelize,
              config: {
                tags: ['test']
              }
            }
          },
          (err) => {
            if(err) {
              reject(err);
            }
            else {
              return sequelize.sync()
              .then(resolve);
            }
          }
        );
      });
    });
  });

  after(() => {
    return sequelize.models.user.destroy({where: {}});
  })

  it('should create a new user', () => {
    return inject({
      method: 'post',
      url: '/users',
      payload: {
        name: 'Istar'
      }
    })
    .then((rep) => {
      should.exist(rep.payload);
      let result = JSON.parse(rep.payload);
      result.name.should.equal('Istar');
      rep.statusCode.should.equal(200);
    });
  });

  it('should list users', () => {
    return inject({
      method: 'get',
      url: '/users?name=Istar'
    })
    .then((rep) => {
      should.exist(rep.payload);
      let result = JSON.parse(rep.payload);
      result.should.be.a('array');
      let user = result[0];
      user.name.should.equal('Istar');
    });
  });

  it('should list users', () => {
    return inject({
      method: 'get',
      url: '/users?name=Istar'
    })
    .then((rep) => {
      should.exist(rep.payload);
      let result = JSON.parse(rep.payload);
      result.should.be.a('array');
      let user = result[0];
      user.name.should.equal('Istar');
      rep.statusCode.should.equal(200);
    });
  });

  it('should update users', () => {
    return inject({
      method: 'get',
      url: '/users?limit=1&name=Istar'
    })
    .then((rep) => {
      should.exist(rep.payload);
      let result = JSON.parse(rep.payload);
      result.should.be.a('array');
      let user = result[0];

      return inject({
        method: 'put',
        url: `/users/${user.id}`,
        payload: {
          name: 'Oscar'
        }
      })
      .then((rep) => {
        should.exist(rep.payload);
        let result = JSON.parse(rep.payload);
        result.id.should.equal(user.id);
        result.name.should.equal('Oscar');
        rep.statusCode.should.equal(200);
      });
    });
  });

  it('should throw an error if payload is not valid', () => {
    return inject({
      method: 'post',
      url: '/users',
      payload: {
        name: null
      }
    })
    .then(rep => {
      rep.statusCode.should.equal(400);
    })
  })

  it('should delete users',() => {
    return inject({
      method: 'get',
      url: '/users?limit=1&name=Oscar'
    })
    .then((rep) => {
      should.exist(rep.payload);
      let result = JSON.parse(rep.payload);
      result.should.be.a('array');
      let user = result[0];

      return inject({
        method: 'delete',
        url: `/users/${user.id}`
      })
      .then((rep) => {
        rep.statusCode.should.equal(200);
        let res = JSON.parse(rep.payload);
        Number(res.id).should.equal(user.id);
      });
    });
  });

  it.skip('should return a list of routes',() => {
    return inject({
      method: 'get',
      url: '/routes'
    })
    .then((rep) => {
      should.exist(rep.payload);
      let result = JSON.parse(rep.payload);
      result.should.be.a('array');
      let route = result[0];
      should.exist(route.path);
      should.exist(route.method);
    });
  });

  it('should contains custom tags when config modified',() => {
    let route = server.lookup('get.users');
    route.settings.tags.should.contain('test');
  });

  it('should return empty if nothing matches the scope', () => {
    return inject({
      method: 'get',
      url: '/users?withA'
    })
    .then(rep => {
      should.exist(rep.payload);
      let result = JSON.parse(rep.payload);
      result.should.be.a('array');
      rep.statusCode.should.equal(200);
    });
  });

  it('should return empty if nothing matches the scope', () => {
    return inject({
      method: 'post',
      url: '/users',
      payload: {
        name: 'andrea'
      }
    })
    .then(rep => {
      rep.statusCode.should.equal(200);
      
      return inject({
        method: 'get',
        url: '/users?limit=1&withA=true'
      })
      .then(rep => {
        should.exist(rep.payload);
        let result = JSON.parse(rep.payload);
        result.should.be.a('array');
        result[0].name.should.equal('andrea');
      });
  
    })
  });

});
