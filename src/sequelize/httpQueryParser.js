
const R = require('ramda');

module.exports = function(relationSchema, model, query) {
  return urlQueryParser(relationSchema, model, query);
};

const urlQueryParser = module.exports.urlQueryParser = function(relationSchema, model, raw) {
  let query = {
    attributes: {},
    pagination: {
      limit : 10
    }
  };

  if(raw.embed) {
    let models = {};
    raw.embed.forEach((model) => {
      models[model] = true;
    });
    query.embed = models;
  }

  Object.keys(raw).filter((key) => {
    return !R.isNil(model.tableAttributes[key]);
  })
  .forEach((key) => {
    query.attributes[key] = raw[key];
  });

  let pagination = ['limit', 'offset', 'sort'];

  pagination.filter((key) => {
    // throw raw[key];
    return !R.isNil(raw[key]);
  })
  .forEach((key) => {
    if(key == 'sort' && !Array.isArray(raw[key])) {
      raw[key] = [raw[key]];
    }
    query.pagination[key] = raw[key];
  });




  return query;
};
