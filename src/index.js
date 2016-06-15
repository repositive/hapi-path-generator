'use strict';

const queryValidator = require('./sequelize/urlQueryValidator');
const modelRelations = require('./sequelize/modelRelations');
const sequelizeQueryGenerator = require('./sequelize/queryGenerator');
const pathGenerator = require('./pathGenerator');
const R = require('ramda');
const Boom = require('boom');

const hapiRouteGenerator = {
  register: function(server, options, done) {
    let sequelize = options.sequelize;
    let relationSchema = modelRelations(sequelize);

    pathGenerator(relationSchema).forEach((route) => {
      server.route({
        path: route.path,
        method: route.method,
        handler: function(req, rep) {
          rep(Boom.notImplemented());
        }
      });
    });

    done();
  }
};

hapiRouteGenerator.register.attributes = {
  pkg: require('../package.json')
};

module.exports = hapiRouteGenerator;
