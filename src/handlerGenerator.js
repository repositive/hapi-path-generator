'use strict';

const R = require('ramda');
const modelIdentifiers = require('./utils/modelIdentifiers');

const handlerGenerator = {};

handlerGenerator.getList = function getList(model) {

  /**
   * Query constructor for finding a list of objects in the db
   * @param {parsedRequest} req
   * @return {Promise} the result of the query
   * TODO: Validate the parameters.
   * TODO: Add extra query features (limit offset and so)
   */
  return function(req) {
    return model.findAll({
      where: req.where || {}
    });
  };
};

handlerGenerator.getOne = function getOne(model) {
  let identifiers = modelIdentifiers(model);

  /**
   * Query constructor for finding one object in the database
   * @param {parsedRequest} req
   * @param {identifier} value that identifies the object, primaryKey or unique field
   * @return {Promise} the result of the query
   * TODO: Validate the parameters.
   * TODO: Add extra query features (limit offset and so)
   */
  return function(req, identifier) {
    let potentialIds = {};

    identifiers.forEach((id) => {
      potentialIds[id] = identifier;
    });

    return model.findOne({
      where: R.mergeWith(req.where || {}, {$or: potentialIds})
    });
  };
};


module.exports = handlerGenerator;
