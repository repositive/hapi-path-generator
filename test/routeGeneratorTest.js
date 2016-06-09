'use strict';

const chai = require('chai');
const should = chai.should();
const generator = require('../src/routeGenerator');
const User = require('./models').User;


describe('Route Generator', () => {

  it('should return an array of routes', () => {
    let routes = generator(User);
    should.exist(routes);
    routes.should.be.a('array');
  });

  describe('readList', () => {

    let route;

    before(() => {
      route = generator.readList(User);
    });

    it('should return a new route', () => {
      should.exist(route);
    });

    it('should return GET as the method for the route', () => {
      should.exist(route.method);
      route.method.should.equal('GET');
    });

    it('should return the path to list the models', () => {
      should.exist(route.path);
      route.path.should.equal('/users');
    });


  });

  describe('readOne', () => {

    let route;

    before(() => {
      route = generator.readOne(User);
    });

    it('should return a new route', () => {
      should.exist(route);
    });

    it('should return GET as the method for the route', () => {
      should.exist(route.method);
      route.method.should.equal('GET');
    });

    it('should return the path to get the model', () => {
      should.exist(route.path);
      route.path.should.equal('/users/{identifier}');
    });

  });

  describe('create', () => {

    let route;

    before(() => {
      route = generator.create(User);
    });

    it('should return a new route', () => {
      should.exist(route);
    });

    it('should return POST as the method for the route', () => {
      should.exist(route.method);
      route.method.should.equal('POST');
    });

    it('should return the path to create the model', () => {
      should.exist(route.path);
      route.path.should.equal('/users');
    });

    //TODO Validators

  });

  describe('update', () => {

    let route;

    before(() => {
      route = generator.update(User);
    });

    it('should return a new route', () => {
      should.exist(route);
    });

    it('should return PUT as the method for the route', () => {
      should.exist(route.method);
      route.method.should.equal('PUT');
    });

    it('should return the path to update the model', () => {
      should.exist(route.path);
      route.path.should.equal('/users/{identifier}');
    });

    //TODO Validators

  });
});
