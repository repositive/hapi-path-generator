'use strict';


const modelIdentifiers = require('./modelIdentifiers');
const R = require('ramda');

/**
 *  Generates queries for sequelize
 *  @param {relationSchema} relations
 *  @param {sequelizeModel} model
 *  @param {object} params
 *  @returns The generated query
 */
module.exports = function queryGenerator(sequelize, parsedPath, params, query) {

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

  let pathHead = parsedPath.shift();

  let q = {
    model: sequelize.models[pathHead.model]
  };

  if(query) {
    q.include = [query];
  }

  let where = {};

  if(pathHead.identifier) {
    let identifiers = modelIdentifiers(q.model);
    let nId = Number(pathHead.identifier);
    if(!Number.isNaN(nId)) {
      pathHead.identifier = nId;
    }
    let idMatch = {};
    Object.keys(identifiers).forEach((id) => {
      if(!(Number.isNaN(nId) && identifiers[id] === 'INTEGER')) {
        idMatch[id] = pathHead.identifier;
      }
    });

    if(Object.keys(idMatch).length == 1) {
      where = idMatch;
    }
    else if(Object.keys(idMatch).length > 1) {
      where.$or = idMatch;
    }
  }


  if(Object.keys(where).length !== 0) {
    q.where = where;
  }

  if(parsedPath.length === 0) {
    return q;
  }
  else {
    return queryGenerator(sequelize, parsedPath, params, q);
  }

};
