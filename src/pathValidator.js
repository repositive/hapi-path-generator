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
    let scope = R.isNil(parsedPath[parsedPath.length - 1].potentialIds) ? scopes.table : scopes.row;

    if(scope.methods[method]) {
      return { status: 'valid', scope: scope.name, parsedPath: parsedPath, function: scope.methods[method] };
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
      get: 'findOne',
      put: 'update',
      delete: 'destroy'
    }
  },
  /* Table should probably be splitted into another scope called relation.
   * It does not have sense to post into complex paths when you can do it in the root one.
   */
  table: {
    name: 'table',
    methods: {
      get: 'findAll',
      post: 'create',
      delete: 'destroy'
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



    if(arr.length % 2 === 0) {
      //TODO Check if the relation is possible and if it was queried already
      if(R.isNil(relationSchema[val])) {
        //TODO Add support for Many2One relations/ Throw error if the relation is not possible or if it's recursive

        throw new Error(`The resource ${val} does not exist`);
      }
      if(acc.result.length === 0) {
        acc.result.unshift({});
      }
      acc.result[0].table = val;
      acc.result[0].model = relationSchema[val].model;

      if(acc.result[0].identifier) {

        let identifiers = relationSchema[val].identifiers;
        let nId = Number(acc.result[0].identifier);
        let idMatch = {};

        Object.keys(identifiers).forEach((id) => {
          if(identifiers[id] === 'INTEGER' && !Number.isNaN(nId)) {
            idMatch[id] = nId;
          }
          else if(identifiers[id] !== 'INTEGER') {
            idMatch[id] = acc.result[0].identifier;
          }
        });

        if(Object.keys(idMatch).length > 0) {
          acc.result[0].potentialIds = idMatch;
        } else {
          throw new Error(`The identifier ${acc.result[0].identifier} is not valid for ${acc.result[0].model.name}.`);
        }

        delete acc.result[0].identifier;
      }

    }
    else {
      acc.result.unshift({ identifier: val });
    }

    return reducer(acc, arr);
  }


  return reducer({ result: [], mem: {}}, pathArray).result;

};
