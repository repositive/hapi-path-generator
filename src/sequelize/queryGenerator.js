'use strict';


const modelIdentifiers = require('./modelIdentifiers');
const validator = require('validator');
const R = require('ramda');

/**
 *  Generates queries for sequelize
 *  @param {relationSchema} relations
 *  @param {object} params
 *  @returns The generated query
 */
module.exports = R.curry(function queryGenerator(sequelize, pathHistory, context) {
  let history = R.clone(pathHistory);
  return generator(sequelize, history, context);
});

const generator = module.exports.generator = function generator(sequelize, history, context, queryAcc) {
  // Parameters is an object wich can define the following rules.
  // {
  //   attributes: ['', '', ...], //The attributes to query,
  //   where: {
  //     x: 'a',
  //     y: {
  //       $lt: 3
  //     },
  //     relation: { // embedded automatically
  //
  //     }
  //   },
  //   identifier: 'someid', // Received in the path,
  //   offset: 2,
  //   limit: 10,
  //   order: ''
  // }

  let first = history.shift();
  // throw first;
  let q = {
    model: sequelize.models[first.model]
  };

  if(queryAcc) {
    //TODO Add embedded objects to the query
    if(context.query.embed && context.query.embed[queryAcc.model.name]) {
      delete context.query.embed[queryAcc.model.name];
    }
    else {
      queryAcc.attributes = [];
    }
    q.include = [queryAcc];
  }

  let where = {};

  if(context.identifiers && context.identifiers[first.identifier]) {
    let modelIds = modelIdentifiers(sequelize.models[first.model]);
    Object.keys(modelIds).forEach((id) => {
      let _id = context.identifiers[first.identifier];
      if(modelIds[id] == 'INTEGER' && validator.isInt(String(_id))) {
        modelIds[id] = Number(_id);
      }
      else if(modelIds[id] == 'UUID' && validator.isUUID(String(_id))) {
        modelIds[id] = _id;
      }
      else if(modelIds[id] != 'INTEGER' && modelIds[id] != 'UUID') {
        modelIds[id] = String(_id);
      }
      else {
        delete modelIds[id];
      }
    });

    if(Object.keys(modelIds).length == 1) {
      where = modelIds;
    }
    else {
      where.$or = modelIds;
    }
  }


  if(Object.keys(where).length !== 0) {
    q.where = where;
  }

  if(history.length === 0) {

    if(context.query.embed && Object.keys(context.query.embed).length > 0) {
      let remainingToEmbed = [];

      Object.keys(context.query.embed).forEach((model) => {
        remainingToEmbed.push({
          model: sequelize.models[model]
        });
      });
      q.include = R.concat(q.include || [], remainingToEmbed);
    }

    if(context.query.attributes) {
      q.where = R.merge(context.query.attributes, q.where);
    }

    if(context.query.pagination) {
      q = R.merge(context.query.pagination, q);
    }

    if(context.method == 'put' || context.method == 'post') {
      q.returning = true;
    }

    return q;
  }
  else {
    return generator(sequelize, history, context, q);
  }

};
