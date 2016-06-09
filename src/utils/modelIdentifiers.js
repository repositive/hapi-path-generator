'use strict';

module.exports = function modelIdentifiers(model) {
   return Object.keys(model.tableAttributes).filter((value) => {
     let definition = model.tableAttributes[value];
     return definition.primaryKey === true || definition.unique === true;
   });
};
