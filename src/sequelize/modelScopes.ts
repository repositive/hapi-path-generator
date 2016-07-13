import {Model} from 'sequelize';

export default function modelScopes(model: Model<any, any>): {[id: string]: any} {

  let scopes: {[id: string]: any} = {};

  Object.keys(model['options'].scopes).forEach(key => {
    scopes[key] = true;
  });

  return scopes;

}
