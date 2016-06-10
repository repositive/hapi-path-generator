'use strict';

const config = require('./config.json');
const sequelize = require('hapi-sequelize');
const Hapi = require('hapi');
const R = require('ramda');

module.exports = new Promise((resolve, reject) => {
  let server = new Hapi.Server();

  server.connection();

  server.register({
    register: sequelize,
    options: R.merge(config.db, { models: ["test/models/**/*.js"] })
  }, (err) => {
    if(err) {
      reject(err);
    }
    else {
      resolve(server);
    }
  });
});
