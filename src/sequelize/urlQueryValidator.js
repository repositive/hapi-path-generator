

module.exports = function(relationSchema, model, urlQuery) {
  return urlQueryParser(relationSchema, model, urlQuery);
};

const urlQueryParser = module.exports.urlQueryParser = function(relationSchema, model, urlQuery) {

  if(urlQuery.embed) {
    let models = {};
    urlQuery.embed.forEach((model) => {
      models[model] = relationSchema[model].model;
    });
    urlQuery.embed = models;
  }
  return urlQuery;
};
