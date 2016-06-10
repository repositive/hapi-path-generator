
module.exports = function(sequelize, Types) {
  return sequelize.define('address',
    {
      line1: Types.STRING,
      line2: Types.STRING
    },
    {
      classMethods: {
        associate: function(models) {
          models.address.belongsTo(models.user);
          // models.address.belongsTo(models.poscode);
        }
      }
    }
  );
};
