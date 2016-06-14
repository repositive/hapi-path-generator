'use strict';

const pathValidator = require('./pathValidator');
const queryValidator = require('./sequelize/urlQueryValidator');
const modelRelations = require('./sequelize/modelRelations');
const sequelizeQueryGenerator = require('./sequelize/queryGenerator');
const R = require('ramda');
const Boom = require('boom');
const subtext = require('subtext');

const hapiRouteGenerator = {
  register: function(server, options, done) {
    let sequelize = options.sequelize;
    let relationSchema = modelRelations(sequelize);

    server.ext('onRequest', function(request, reply) {

      let validation = pathValidator(relationSchema, request.method, request.path);
      if(validation.status == 'invalid') {
        reply.continue(validation);
      }
      else {
        let parsedPath = validation.parsedPath;
        let model = parsedPath[parsedPath.length - 1].model;
        let parsedUrlQuery = queryValidator(relationSchema, model, request.query);
        let func = model[validation.function];

        new Promise((complete, reject) => {
          let funcParams = [];
          if(R.contains(validation.function, ['update', 'findOne','findAll','destroy'])) {
            let query = sequelizeQueryGenerator(parsedPath, parsedUrlQuery);
            if(validation.function === 'update') {
              query.returning = true;
            }
            funcParams.push(query);
          }

          if(R.contains(validation.function, ['create', 'update'])) {
            subtext.parse(request.raw.req, null, { parse: true, output: 'data' } ,(err, parsed) => {
              if(err) {
                reject(err);
              }
              else {
                funcParams.unshift(parsed.payload);
                complete(funcParams);
              }
            });
          }
          else {
            complete(funcParams);
          }

        })
        .then((funcParams) => {

          return func.apply(model, funcParams)
          .then((response) => {

            if(validation.function === 'update') {
              reply((response && response[1][0]) || Boom.badRequest("Non existing id"));
            }
            else if(validation.function === 'destroy') {
              reply(response == 1? {message: "deleted"} : Boom.badRequest('Non existing resource'));
            }
            else if(!response) {
              reply({});
            }
            else {
              reply(response);
            }

          });

        })
        .catch((err) => {
          reply(Boom.badRequest(err));
        });
      }

    });

    done();
  }
};

hapiRouteGenerator.register.attributes = {
  pkg: require('../package.json')
};

module.exports = hapiRouteGenerator;
