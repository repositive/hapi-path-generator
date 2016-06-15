
module.exports = function(sequelize, Types) {
  return sequelize.define('tag',
    {
      text: Types.STRING,
    },
    {
      classMethods: {
        associate: function(models) {
          models.tag.belongsTo(models.user, {as: 'creator'});
          models.tag.belongsToMany(models.user, {through: 'usr_tags'});
        }
      }
    }
  );
};
