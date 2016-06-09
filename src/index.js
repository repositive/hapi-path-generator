'use strict';

const hapiRouteGenerator = {
  register: function(server, options, done) {
    //TODO Define options & parse them
    done();
  }
};

hapiRouteGenerator.register.attributes = {
  pkg: require('../package.json')
};

module.exports = hapiRouteGenerator;
