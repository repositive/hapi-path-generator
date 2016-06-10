'use strict';

const R = require('ramda');


/**
 *  Validates if a request is valid or not
 *  @param {object} relationSchema
 *  @param {string} method
 *  @param {array} parsedPath
 *  @returns {object} With feedback about the request validation
 */
module.exports = function pathValidator(relationSchema, method, parsedPath) {

  /* [tableName, tableId, relationName, relationId ...]
   * If the length of the parsedPath is even the scope is always row.
   */
  let scope = (parsedPath.length % 2) === 0 ? scopes.row : scopes.table;

  if(scope.methods[method]) {
    let table = parsedPath.shift();

    if(relationSchema[table]) {
      if(parsedPath.length > 1) {
        parsedPath.shift();
        return pathValidator(relationSchema, method, parsedPath);
      }
      return { status: 'valid', scope: scope.name };
      
    } else {
      return { status: 'invalid', message: `The ${table} resource does not exist`};
    }
  }
  else {
    return { status: 'invalid', message: `You can't ${method} in a ${scope.name}`};
  }
};

let scopes = module.exports.scopes = {
  row: {
    name: 'row',
    methods:  {
      get: true,
      put: true,
      delete: true
    }
  },
  /* Table should probably be splitted into another scope called relation.
   * It does not have sense to post into complex paths when you can do it in the root one.
   */
  table: {
    name: 'table',
    methods: {
      get: true,
      post: true,
      delete: true
    }
  }
};
