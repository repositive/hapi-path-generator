'use strict';


const modelIdentifiers = require('./modelIdentifiers');
const R = require('ramda');

/**
 *  Generates queries for sequelize
 *  @param {relationSchema} relations
 *  @param {object} params
 *  @returns The generated query
 */
module.exports = function queryGenerator(parsedPath, urlQuery, query) {

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
    model: pathHead.model
  };

  if(query) {
    if(urlQuery.embed && urlQuery.embed[query.model.tableName]) {
      delete urlQuery.embed[query.model.tableName];
    }
    else {
      query.attributes = [];
    }
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

    if(urlQuery.embed && Object.keys(urlQuery.embed).length > 0) {
      let remainingToEmbed = [];

      Object.keys(urlQuery.embed).forEach((model) => {
        remainingToEmbed.push({
          model: urlQuery.embed[model]
        });
      });
      q.include = R.concat(q.include || [], remainingToEmbed);
    }


    delete urlQuery.embed;
    if(Object.keys(urlQuery).length > 0) {
      q.where = R.merge(urlQuery, q.where);
    }
    return q;
  }
  else {
    return queryGenerator(parsedPath, urlQuery, q);
  }

};
