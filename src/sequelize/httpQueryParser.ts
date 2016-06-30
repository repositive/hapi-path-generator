
import * as R from 'ramda';

module.exports = R.curry(function(relationSchema, model, query) {
  return urlQueryParser(relationSchema, model, query);
});

const urlQueryParser = module.exports.urlQueryParser = function(relationSchema, model, raw) {
  let query = {
    attributes: {},
    pagination: {
      limit : 10
    }
  };

  if (raw.embed) {
    let models = {};
    raw.embed.forEach((_model) => {
      models[_model] = true;
    });
    query['embed'] = models;
  }

  Object.keys(raw).filter((key) => {
    return !R.isNil(model.tableAttributes[key]);
  })
  .forEach((key) => {
    query.attributes[key] = raw[key];
  });

  let pagination = ['limit', 'offset', 'order'];

  pagination.filter((key) => {
    // throw raw[key];
    return !R.isNil(raw[key]);
  })
  .forEach((key) => {
    if (key === 'order' && !Array.isArray(raw[key])) {
      raw[key] = [raw[key]];
    }
    query.pagination[key] = raw[key];
  });

  return query;
};
