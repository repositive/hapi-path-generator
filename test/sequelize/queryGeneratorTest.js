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
  let server;
  let models;
  let sequelize;

  before(() => {
    return hapi.then((srv) => {
      server = srv;
      sequelize = server.plugins['hapi-sequelize'].db.sequelize;
      models = sequelize.models;
      let schema = modelRelations(sequelize);
    });
  });

  it('should return an object', () => {
    let history = [
      {type: 'table', table: 'users', model: 'user'}
    ];
    let query = queryGenerator(sequelize, history, {query:{}});
    should.exist(query);
    query.should.be.a('object');
  });

  it('should create query for table scope', () => {
    let history = [
      {type: 'table', table: 'users', model: 'user'}
    ];
    let query = util.inspect(queryGenerator(sequelize, history, {query: {}}));
    query.should.deep.equal(util.inspect(
      { model: sequelize.models.user }
    ));
  });

  it('should create query for row scope (non numbers)', () => {
    let history = [
      {type: 'row', table: 'users', model: 'user', identifier: 'user_id'}
    ];
    let context = {
      identifiers: {
        user_id: 's2ln'
      },
      query: {}
    };
    let query = util.inspect(queryGenerator(sequelize, history, context));
    query.should.deep.equal(util.inspect({
      model: sequelize.models.user,
      where: {
        nationalId: "s2ln"
      }
    }));
  });

  it('should create query for row scope (numbers)', () => {
    let history = [
      {type: 'row', table: 'users', model: 'user', identifier: 'user_id'}
    ];
    let context = {
      identifiers: {
        user_id: '1'
      },
      query: {}
    };
    let query = util.inspect(queryGenerator(sequelize, history, context));
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
    let history = [
      {type: 'row', table: 'users', model: 'user', identifier: 'user_id'},
      {type: 'table', table: 'addresses', model: 'address'}
    ];
    let context = {
      identifiers: {
        user_id: '1'
      },
      query: {}
    };
    let query = util.inspect(queryGenerator(sequelize, history, context));
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
    let history = [
      {type: 'row', table: 'users', model: 'user', identifier: 'user_id'},
      {type: 'row', table: 'addresses', model:'address', identifier: 'address_id'},
      {type: 'row', table: 'poscodes', model: 'poscode'}
    ];
    let context = {
      identifiers: {
        user_id: '1',
        address_id: '2'
      },
      query: {}
    };
    let query = util.inspect(queryGenerator(sequelize, history, context));
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

  it('should add context.query.attributes parameters to the mix', () => {
    let history = [
      {type: 'table', table: 'users', model: 'user'}
    ];
    let context = {
      identifiers: {},
      query: {
        attributes: {
          name: 'Istar'
        }
      }
    }
    let query = util.inspect(queryGenerator(sequelize, history, context));
    query.should.deep.equal(util.inspect({
      model: sequelize.models.user,
      where: {
        name: 'Istar'
      }
    }));
  });

  it('if embed is present show nested objects', () => {
    let history = [
      {type: 'row', table: 'users', model: 'user', identifier: 'user_id'},
      {type: 'table', table: 'address', model: 'address'}
    ];
    let context = {
      identifiers: {
        user_id: 1
      },
      query: {
        embed: {
          user: true
        }
      }
    }
    let query = util.inspect(queryGenerator(sequelize, history, context));
    query.should.deep.equal(util.inspect({
      model: models.address,
      include: [
        {
          model: models.user,
          where: {
            $or: {
              id: 1,
              nationalId: '1'
            }
          },
        }
      ]
    }));
  });

  it('add limit, offset & sort', () => {
    let history = [
      {type: 'row', table: 'users', model: 'user', identifier: 'user_id'},
      {type: 'table', table: 'address', model: 'address'}
    ];
    let context = {
      identifiers: {
        user_id: 1
      },
      query: {
        pagination: {
          limit: 10,
          offset: 20,
          order: ['name', 'DESC']
        },
        embed: {
          user: true
        }
      }
    }
    let query = util.inspect(queryGenerator(sequelize, history, context));
    // query.limit.should.equal(10);
    // query.offset.should.equal(20);
    // query.order.should.equal(['name', 'DESC']);
    query.should.deep.equal(util.inspect({
      limit: 10,
      offset: 20,
      order: ['name', 'DESC'],
      model: models.address,
      include: [
        {
          model: models.user,
          where: {
            $or: {
              id: 1,
              nationalId: '1'
            }
          },
        }
      ]
    }));
  });
});
