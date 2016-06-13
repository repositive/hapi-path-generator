[![Stories in Ready](https://badge.waffle.io/repositive/hapi-path-generator.png?label=ready&title=Ready)](https://waffle.io/repositive/hapi-path-generator)
Hapi Path Generator
---


How it works
------
The project generates routes and the crud operations based on sequelize models.

The routes generated are of two types

- Table
  - Examples: `/users`, `/users/`, `/users/1/addresses`
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

Setting it up
------
```js
const Hapi = require('hapi');
const server = new Hapi.Server();
const sequelize = require('hapi-sequelize');
const config = require('./sequelize-config.json');
const hapiPath =require('hapi-path-generator');

server.connection({ port: 3000 });

server.register({
    register: sequelize,
    options: config.db
  }, (err) => {
  if(err) {
    throw err;
  }

  server.register(hapiPath, (err) => {
    if(err) {
      throw err;
    }

    const sequelize = server.plugins['hapi-sequelize'].db.sequelize;

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

`"hapi-sequelize": ">= 2.x < 4"`



Contributing.
------
Run the `./project.sh test dev` script.
Docker & Docker compose are required.
