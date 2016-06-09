const config = require('./config.json');
const Sequelize = require('sequelize');
const sequelize  = new Sequelize(config.db);

const User = sequelize.define('user', {
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
  nationalId: {
    type: Sequelize.STRING,
    unique: true
  }
});

module.exports = {
  User: User
};
