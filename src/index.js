'use strict';

const pathValidator = require('./sequelize/pathValidator');
const modelRelations = require('./sequelize/modelRelations');
const sequelizeQueryGenerator = require('./sequelize/queryGenerator');

const hapiRouteGenerator = {
  register: function(server, options, done) {
    let sequelize = server.plugins['hapi-sequelize'].db.sequelize;
    let relationSchema = modelRelations(sequelize);

    server.ext('onRequest', function(request, reply) {

      let validation = pathValidator(relationSchema, request.method, request.path);
      if(validation.status == 'invalid') {
        reply(validation);
      }
      else {
        let parsedPath = validation.parsedPath;
        let model = parsedPath[parsedPath.length - 1].model;
        let query = sequelizeQueryGenerator(parsedPath, {});
        // reply(validation.function);
        model[validation.function](query)
        .then((response) => {
          reply(response);
        })
        .catch((err) => {
          reply(err);
        });
      }
      // reply(request.path);
    });

    done();
  }
};

hapiRouteGenerator.register.attributes = {
  pkg: require('../package.json')
};

module.exports = hapiRouteGenerator;
