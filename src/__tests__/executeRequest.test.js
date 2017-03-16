'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {describe, it, beforeEach, afterEach} = global;
const expect = chai.expect;
chai.use(sinonChai);

import ExecuteRequestModul from '../executeRequest';
import {executeRequest} from '../executeRequest';

describe('executeRequest', () => {
  let requestMock;

  beforeEach(() => {
    requestMock = sinon.mock();

    ExecuteRequestModul.__Rewire__('request', requestMock);

  });

  afterEach(() => {
    ExecuteRequestModul.__ResetDependency__('request');
  });

  describe('on status code between 200 and 226', () => {
    describe('on status code 200 with body', () => {
      beforeEach(() => {
        const body = '{"photoId":1}';
        const response = {statusCode: 200};

        requestMock.callsArgWithAsync(1, null, response, body);
      });

      it('should return an object', done => {
        executeRequest('get', {})
          .subscribe({
            next: response => {
              expect(response).to.be.an('object');
              expect(response.photoId).to.be.eq(1);
            },
            error: err => {
              expect(err).to.be.equals(null);
            },
            complete: () => done()
          });
      });
    });

    describe('on status code 200 without body', () => {
      beforeEach(() => {
        const body = '';
        const response = {statusCode: 200};

        requestMock.callsArgWithAsync(1, null, response, body);
      });

      it('should return error and response undefined', done => {
        executeRequest('get', {})
          .subscribe({
            next: response => {
              expect(response).to.be.eq(undefined);
            },
            error: err => {
              expect(err).to.be.equals(undefined);
            },
            complete: () => done()
          });
      });
    });
  });

  describe('on status code < 200 and status code > 226', () => {
    describe('on error 403', () => {
      beforeEach(() => {
        const body = 'weird error';
        const response = {statusCode: 403};

        requestMock.callsArgWithAsync(1, null, response, body);
      });

      it('should return an error from the body', done => {
        executeRequest('get', {})
          .subscribe({
            next: response => {
              expect(response).to.be.eq(undefined);
            },
            error: err => {
              expect(err.statusCode).to.be.equals(403);
              expect(err.body).to.be.equals('weird error');
              done();
            },
            complete: () => done(new Error('Should not complete'))
          });
      });
    });

    describe('on unknown error code', () => {
      beforeEach(() => {
        const body = '<html>Nasty error</html>';
        const response = {statusCode: 500};

        requestMock.callsArgWithAsync(1, null, response, body);
      });

      it('should return an error from the body', done => {
        executeRequest('get', {})
          .subscribe({
            next: response => {
              expect(response).to.be.eq(null);
            },
            error: err => {
              expect(err.message).to.be.equals('UNKNOWN_ERROR');
              expect(err.body).to.be.equals('<html>Nasty error</html>');
              expect(err.statusCode).to.be.equals(500);
              done();
            },
            complete: () => done(new Error('Should not complete'))
          });
      });
    });
  });
});
