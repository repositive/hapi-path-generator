
import * as R from 'ramda';

export type RelationMap = {[tableName: string]: 'one' | 'many'};

export type IdentifierMap = {[id: string]: string | number};

type ModelRepresentation = {
  identifiers: IdentifierMap;
  model: string;
  relations: RelationMap;
}

export type RelationTree = {[tableName: string]: ModelRepresentation }

export type HistoryStep = {
  model: string;
  table: string;
  type: 'row' | 'table',
  identifier?: string
}

export type History = HistoryStep[];

interface Options {
  relationLimit: number;
  idFormat: 'colons' | 'curly';
  prefix: string;
}

type State = {
  history?: History;
  options: Options;
  path?: string;
}

export interface Route {
  path: string;
  method: string;
  history: History;
}

const scopes = module.exports.scopes = {
  row: {
    name: 'row',
    methods: ['get', 'put', 'delete']
  },
  table: {
    name: 'table',
    rootMethods: ['get', 'post', 'delete'],
    methods: ['get', 'delete']
  }
};

export function rowGenerator(state: State, table: string, schema: RelationTree): Route[] {

  let history: History = R.clone(state.history || []);

  if (history.length >= state.options.relationLimit) {
    return [];
  }

  let last = R.last(history);

  let relation = schema[table].relations[last && last['table']];
  let identifier = `${schema[table].model}_id`;
  if (relation) {
    history.push({
      type: 'row',
      table: table,
      model: schema[table].model
    });
  }
  else {
    history[0] = {
      type: 'row',
      table: table,
      model: schema[table].model,
      identifier: identifier
    };
  }

  let identifierString = state.options.idFormat === 'colons' ?
    `:${identifier}` : `{${identifier}}`;

  let newPath = relation ?
    `${state.path}/${schema[table].model}` :  `${state.path}/${identifierString}`;

  let newState = {
    options: state.options,
    path: newPath,
    history: history
  };

  let tables = R.flatten(Object.keys(schema[table].relations).map((relation) => {
    if (schema[table].relations[relation] === 'one') {
      return rowGenerator(newState, relation, schema);
    }
    else {
      return tableGenerator(newState, relation, schema);
    }
  }));

  return R.concat(
    scopes.row.methods.map((method) => {
      return {
        path: newPath,
        method: method,
        history: history
      };
    }),
    tables
  );
};

export function tableGenerator(state: State, table: string, schema: RelationTree): Route[] {

  let history = R.clone(state.history || []);

  if (history.length >= state.options.relationLimit || (state.path || '').indexOf(table) !== -1) {
    return [];
  }
  else {
    let useRoot = history.length > 0 ? 'methods' : 'rootMethods';

    history.push({
      type: 'table',
      table: table,
      model: schema[table].model
    });
    let newPath = `${state.path || state.options.prefix}/${table}`;
    let newState = {
      options: state.options,
      path: newPath,
      history: history
    };

    let rows = rowGenerator(newState, table, schema);

    return R.concat(
      scopes.table[useRoot].map((method: string) => {
        return {
          path: newPath,
          method: method,
          history: history
        };
      }),
      rows
    );
  }
};

export default function pathGenerator(modelRelations, options: Options): Route[] {
  return R.flatten(Object.keys(modelRelations).map((model) => {
    return tableGenerator({ options: options }, model, modelRelations);
  }));
};
