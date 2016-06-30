
import {Model} from 'sequelize';

export default function modelIdentifiers(model: Model<any, any>): {[id: string]: string | number } {
  let identifiers: {[id: string]: string} = {};
  Object.keys(model['tableAttributes']).forEach((value) => {
    let definition = model['tableAttributes'][value];
    if (definition.primaryKey === true || definition.unique === true) {
      identifiers[definition.field] = definition.type.constructor.key;
    }
  });
  return identifiers;
};
