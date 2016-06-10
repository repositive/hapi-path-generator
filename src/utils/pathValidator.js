'use strict';

const R = require('ramda');


/**
 *  Validates if a request is valid or not
 *  @param {object} relationSchema
 *  @param {string} method
 *  @param {array} path
 *  @returns {object} With feedback about the request validation
 */
module.exports = function pathValidator(relationSchema, method, path) {

  try {
    let parsedPath = pathParser(relationSchema, path);
    let scope = R.isNil(parsedPath[0].identifier) ? scopes.table : scopes.row;

    if(scope.methods[method]) {
      return { status: 'valid', scope: scope.name, parsedPath: parsedPath };
    }
    else {
      return { status: 'invalid', message: `You can't ${method} in a ${scope.name}`};
    }
  }
  catch(error) {
    return { status: 'invalid', message: error.message };
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



/**
 *  Returns the path properly formated for future computation
 *  @param {string} path
 *  @returns {object} The path parsed
 */
let pathParser = module.exports.pathParser = function pathParser(relationSchema, path) {
  let pathArray = path.split('/');
  pathArray.shift();

  if (pathArray[pathArray.length -1] === '') {
    pathArray.pop();
  }


  function reducer(acc, arr) {
    if(arr.length === 0) {
      return acc;
    }

    let val = arr.pop();

    if(acc.length % 2 === 0) {
      if(R.isNil(relationSchema[val])) {
        throw new Error(`The resource ${val} does not exist`);
      }
      if(acc.length === 0) {
        acc.push({table: val});
      }
      else {
        acc[acc.length -1].table = val;
      }
    }
    else {
      acc.push({ identifier: val });
    }

    return reducer(acc, arr);
  }


  return reducer([], pathArray);

};
