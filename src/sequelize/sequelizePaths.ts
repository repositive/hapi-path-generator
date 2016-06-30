
import * as R from 'ramda';

import sequelizeSchema from './modelRelations';
import {Route} from '../pathGenerator';
import pathGenerator from '../pathGenerator';

const sequelizeQueryParser = require('./httpQueryParser');
const sequelizeQueryGenerator = require('./queryGenerator');

const methodMap = module.exports.methodMap = {
  table: {
    get: 'findAll',
    post: 'create',
    delete: 'destroy'
  },
  row: {
    get: 'findOne',
    put: 'update',
    delete: 'destroy'
  }
};

interface HandleRoute extends Route {
  query: <T>(context: any) => Promise<T>;
}

export default function paths(sequelize, options): HandleRoute[] {

  let schema = sequelizeSchema(sequelize);

  return pathGenerator(schema, options).map((route: HandleRoute) => {
    let state = R.clone(route.history[route.history.length - 1]);
    let model = sequelize.models[state.model];

    let queryParser = sequelizeQueryParser(schema, model);
    let queryGenerator = sequelizeQueryGenerator(sequelize, route.history);

    route.query = function(context) {
      // console.log(context);
      context.query = queryParser(context.query || {});
      context.method = route.method;

      if (route.method === 'get') {
        context.query.limit = context.query.limit || options.defaultLimit;
        if (context.query.limit > options.maxItems) {
          context.query.limit = options.maxItems;
        }
      }

      let query = queryGenerator(context);

      let f = sequelize.models[state.model][methodMap[state.type][route.method]];

      let fParams = [query];

      if (R.contains(route.method, ['put', 'post', 'update'])) {
        fParams.unshift(context.payload);
      }

      return f.apply(model, fParams).then((response) => {
        if (route.method === 'put') {
          let updated = response[1];
          if (state.type === 'row') {
            return updated.length === 0 ? null : updated[0];
          }
          else {
            return updated;
          }
        }
        if (route.method === 'delete') {
          return {deleted: response};
        }
        else {
          return response;
        }
      });
    };

    return route;
  });
};
