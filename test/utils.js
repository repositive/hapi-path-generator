'use strict';

const chai = require('chai');
const should = chai.should();
const User = require('./models').User;
const R = require('ramda');


describe('utils', () => {

  describe('modelIdentifiers', () => {
    const modelIdentifiers = require('../src/utils/modelIdentifiers');
    let identifiers;

    before(() => {
      identifiers = modelIdentifiers(User);
    });

    it('should return an array', () => {
      should.exist(identifiers);
      identifiers.should.be.a('array');
    });

    it('should contain all the identifiers of the object', () => {
      R.contains('id', identifiers).should.equal(true);
    });

    it('should not contain stuff that is not identifier', () => {
      R.contains('name', identifiers).should.equal(false);
    });

    it('should contain also unique fields', () => {
      R.contains('nationalId', identifiers).should.equal(true);
    });
  });
});
