

module.exports = function(sequelize, Types) {
  return sequelize.define('nonrelated',
    {
      line1: Types.STRING
    },
    {
      tableName: 'nonrelated'
    }
  );
};
