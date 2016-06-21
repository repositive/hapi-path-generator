
module.exports = function(sequelize, Types) {
  return sequelize.define('address',
    {
      line1: Types.STRING,
      line2: Types.STRING,
      anotherUnique: {
        type: Types.UUID,
        unique: true
      }
    },
    {
      classMethods: {
        associate: function(models) {
          models.address.belongsTo(models.user);
          models.address.belongsTo(models.poscode);
        }
      }
    }
  );
};
