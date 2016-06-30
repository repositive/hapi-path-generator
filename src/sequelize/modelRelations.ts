
import * as R from 'ramda';
import modelIdentifiers from './modelIdentifiers';

type RelationMap = {[tableName: string]: 'one' | 'many'};

type ModelRepresentation = {
  identifiers: {[id: string]: string};
  model: string;
  relations: RelationMap;
}

type RelationTree = {[tableName: string]: ModelRepresentation }

/**
 *  Returns an array with the name of the tables related with the model provided
 *  @param {sequelizeModel} model
 *  @returns {array} List of related tables.
 */
export function relationExtractor(model): string[] {

  let keys = Object.keys(model.tableAttributes);

  function modelReducer(acc, key) {

    if (!R.isNil(model.tableAttributes[key].references)) {
      acc.push(model.tableAttributes[key].references.model);
      // references.model here is the name of the table
    }

    return acc;
  }

  return R.reduce(modelReducer, [], keys);
};

/**
 *  Creates a representation of the relations between the models
 *  {
 *    'tableName1': {
 *      'tableName2': 'own' (Table1 one holds the key that relates to table2)
 *    },
 *    'tableName2': {
 *      'tableName1': 'external' (Table1 one holds the key that relates to table2)
 *    }
 *  }
 *  @param {Sequelize} sequelize
 *  @returns {object} The representation of the relations.
 */
export default function modelRelationTree(sequelize): RelationTree {
  let globalRelations: RelationTree = {};

  Object.keys(sequelize.models).forEach((modelName) => {

    let model = sequelize.models[modelName];

    if (!globalRelations[model.tableName]) {
      globalRelations[model.tableName] = {
        model: model.name,
        identifiers: modelIdentifiers(model),
        relations: {}
      };
    }
    else {
      globalRelations[model.tableName].model = model.name;
      globalRelations[model.tableName].identifiers = modelIdentifiers(model);
    }

    let relations = relationExtractor(model);
    let own: RelationMap = {};

    relations.forEach((relation) => {
      own[relation] = 'one';
    });

    globalRelations[model.tableName].relations = R.merge(globalRelations[model.tableName].relations, own);

    relations.forEach((tableName) => {

      if (!globalRelations[tableName]) {
        globalRelations[tableName] = {
          model: null,
          identifiers: {},
          relations: {
            [model.tableName]: 'many'
          }
        };
      }
      else {
        globalRelations[tableName].relations[model.tableName] = 'many';
      }

    });
  });

  return globalRelations;

};
