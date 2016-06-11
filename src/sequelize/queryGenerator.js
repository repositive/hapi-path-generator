'use strict';


const modelIdentifiers = require('./modelIdentifiers');
const R = require('ramda');

/**
 *  Generates queries for sequelize
 *  @param {relationSchema} relations
 *  @param {object} params
 *  @returns The generated query
 */
module.exports = function queryGenerator(parsedPath, params, query) {

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

  let pathHead = parsedPath.pop();

  let q = {
    model: pathHead.model
  };

  if(query) {
    q.include = [query];
  }

  let where = {};

  if(pathHead.potentialIds) {
    if(Object.keys(pathHead.potentialIds).length == 1) {
      where = pathHead.potentialIds;
    }
    else {
      where.$or = pathHead.potentialIds;
    }
  }


  if(Object.keys(where).length !== 0) {
    q.where = where;
  }

  if(parsedPath.length === 0) {
    return q;
  }
  else {
    return queryGenerator(parsedPath, params, q);
  }

};
