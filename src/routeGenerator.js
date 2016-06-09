
const handlers = require('./handlerGenerator');

function routeGenerator(model) {
  return [readList(model), readOne(model), create(model), update(model)];
  // TODO Generate routes for relations
}

routeGenerator.readList = readList = function readList(model) {
  return {
    path: `/${model.tableName}`,
    method: 'GET'
  };
};

routeGenerator.readOne = readOne = function readOne(model) {
  return {
    path: `/${model.tableName}/{identifier}`,
    method: 'GET'
  };
};

routeGenerator.create = create = function create(model) {
  return {
    path: `/${model.tableName}`,
    method: 'POST'
  };
};

routeGenerator.update = update = function update(model) {
  return {
    path: `/${model.tableName}/{identifier}`,
    method: 'PUT'
  };
};

module.exports = routeGenerator;

// {
//   method: 'GET/POST/PUT/DELETE',
//   path: '/models/{modelId}/relations/{relationId}...',
//   model: 'SequelizeModel'
// }
