[![Stories in Ready](https://badge.waffle.io/repositive/hapi-path-generator.png?label=ready&title=Ready)](https://waffle.io/repositive/hapi-path-generator)
![Build Status](https://travis-ci.org/repositive/hapi-path-generator.png?branch=master)

Hapi Path Generator
---


How it works
------
The project generates routes and the crud operations based on sequelize models.

The routes generated are of two types

- Table
  - Examples: `/users`, `/users`, `/users/1/addresses?city=London`
  - Valid Methods
    - GET *Returns an array of table rows based on the generated query**
    - POST *Creates a new entry based on the payload*
    - DELETE *Deletes an entry based generated query**
- Row
  - Examples: `/users/1`, `/users/uniqueId`, `/users/1/addresses/232`
  - Valid Methods
    - GET *Returns the row matching the generated query**
    - PUT *Updates the row using the payload provided matching the generated query**
    - DELETE *Deletes the row that matches the generated query**


Querying
------

You can filter using query parameters when doing get requests:
`/users?name=Istar&age=25`

Or using sequelize scopes:
`/users?sequelizeScopeName`

Setting it up
------
```js
const Hapi = require('hapi');
const Sequelize = require('sequelize');
const hapiSeq = require('hapi-sequelize');
const hapiPath =require('hapi-path-generator');
const config = require('config');


const sequelize = new Sequelize(
  {
    database: config.get('db.database'),
    username: config.get('db.username'),
    password: config.get('db.password'),
    port: config.get('db.port'),
    host: config.get('db.host'),
    dialect: config.get('db.dialect'),
  }
);

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.register(
  {
    register: hapiSeq,
    options: {
      name: config.get('db.database'),
      sequelize: sequelize,
      sync: true,
      models: 'src/models/**/*.js'
    }
  },
  (err) => {
    if(err) {
      throw err;
    }

    server.register(
      {
        register: hapiPath,
        options: {
          sequelize: sequelize // Sequelize should be initialized with the models here
        }
      },
      (err) => {
        if(err) {
          throw err;
        }

        server.start(function (err) {
          if(err) {
            throw err;
          }
          console.log('server running');
        });
    });
});

```

Dependencies
-----
The project assumes that you will be using hapi with sequelize.

`"sequelize": "3.x"`


Contributing.
------
Run `docker-compose up`.
Docker & Docker compose are required.
