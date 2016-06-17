'use strict';

const R = require('ramda');
const Boom = require('boom');
const paths = require('./sequelize/sequelizePaths');

const hapiRouteGenerator = {
  register: function(server, options, done) {
    let sequelize = options.sequelize;
    if(sequelize) {
      let generatedPaths = paths(sequelize);
      let parsedPaths = generatedPaths.map((route) => {

        server.route({
          path: route.path,
          method: route.method,
          config: {
            handler: function(req, rep) {
              let context = {
                query: req.query,
                identifiers: req.params
              };
              if(req.payload) {
                context.payload = req.payload;
              }
              route.query(context).then((response) => {
                rep(response);
              })
              .catch((err) => {
                rep(err);
              });
            }
          }
        });

        return {
          method: route.method,
          path: route.path
        };
      });

      server.route({
        path: '/routes',
        method: 'get',
        config: {
          handler: function(req, rep) {
            rep(parsedPaths);
          }
        }
      });

      done();
    }
    else {
      throw Error('You should pass an instance of sequelizer as parameter');
    }
  }

};

hapiRouteGenerator.register.attributes = {
  pkg: require('../package.json')
};


module.exports = hapiRouteGenerator;
