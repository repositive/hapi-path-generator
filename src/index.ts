
import * as R from 'ramda';
import {Request} from 'hapi';
import * as Boom from 'boom';

import paths from './sequelize/sequelizePaths';

function deepMerge(v1, v2) {
  if (Array.isArray(v1) && Array.isArray(v2)) {
    return R.uniq(R.concat(v1, v2));
  }
  else if (typeof v1 === 'object' && typeof v2 === 'object') {
    return R.mergeWith(deepMerge, v1, v2);
  }
  else {
    return v2;
  }
}

const hapiRouteGenerator = {
  register: function(server, options, done) {
    let sequelize = options.sequelize;

    // Set the default relation limit to three if it is 0 ignore it.
    options.relationLimit = options.relationLimit || 3;

    // Set a prefix to all the enpoints generated
    options.prefix = options.prefix || '';

    // This object is added as configuration to all the endpoints
    options.config = options.config || {};

    // Allow the user to change the format of the ids in the path
    // Valid options:
    // curly {identifier}
    // colons :identifier
    options.idFormat = options.idFormat || 'curly';

    // Sets the maximun ammount of items a user can get from get queries.
    // If the limit in the query is forced by the user the api return as max this number of items
    // If the user sets 0 ignores it
    options.maxItems = options.maxItems || 100;

    // Default limit for getTable queries
    // If the user sets 0 ignores it
    options.limit = options.limit || 10;

    if (sequelize) {
      let generatedPaths = paths(sequelize, options);

      // Used to convert the path into an id
      let matchBars = new RegExp('[\/]', 'g');

      generatedPaths.map((route) => {

        let routeId = `${route.method}${route.path.replace(matchBars, '.')}`;

        server.route({
          path: route.path,
          method: route.method,
          config: R.mergeWith(deepMerge, options.config, {
            handler: function(req: Request, rep) {
              req.app.route = route;

              let context = {
                query: req.query,
                identifiers: req.params
              };
              if (req.payload) {
                context['payload'] = req.payload;
              }
              route.query(context).then((response) => {
                rep(response);
              })
              .catch((err) => {
                Boom.badImplementation(err);
              });
            },
            id: routeId
          })
        });

        return {
          method: route.method,
          path: route.path
        };
      });

      done();
    }
    else {
      throw Error('You should pass an instance of sequelizer as parameter');
    }
  }

};

hapiRouteGenerator.register['attributes'] = {
  pkg: require('../package.json')
};

module.exports = hapiRouteGenerator;
