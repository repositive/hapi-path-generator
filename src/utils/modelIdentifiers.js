'use strict';

module.exports = function modelIdentifiers(model) {
    let identifiers = {};
    Object.keys(model.tableAttributes).forEach((value) => {
      let definition = model.tableAttributes[value];
      if(definition.primaryKey === true || definition.unique === true) {
        identifiers[value] = true;
      }
   });
   return identifiers;
};
