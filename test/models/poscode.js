


module.exports = function(sequelize, Types) {
  return sequelize.define('poscode',
    {
      ref: Types.STRING,
    },
    {
      classMethods: {
        associate: function(models) {
          models.poscode.hasMany(models.address);
        }
      }
    }
  );
};
