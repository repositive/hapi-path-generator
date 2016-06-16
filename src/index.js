'use strict';

const R = require('ramda');
const Boom = require('boom');
const paths = require('./sequelize/sequelizePaths');

const hapiRouteGenerator = {
  register: function(server, options) {
    let sequelize = options.sequelize;
    if(sequelize) {
      paths(sequelize).forEach((route) => {
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
            },
            id: getId(route)
          }

        });
      });
    }

    else {
      throw Error('You should pass an instance of sequelizer as parameter');
    }
  }

};

hapiRouteGenerator.register.attributes = {
  pkg: require('../package.json')
};

function getId(route) {
  let code = route.history.reduce((acc, val, i) => {
    return acc === '' ? val.table : `${acc}.${val.table}`;
    },
    `${route.method}:${route.history[route.history.length -1].type}`
  );
}

module.exports = hapiRouteGenerator;
