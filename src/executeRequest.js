'use strict';

let request = require('request');
import {Observable} from 'rxjs/Rx';

let execute = (requestOptions) => {
  return requestObservable(requestOptions)
    .mergeMap((result) => {
      if (result.response.statusCode > 400 && result.response.statusCode < 500) {
        const error = new Error('Token Authentication Error');
        error.statusCode = result.response.statusCode;
        error.body = result.body;
        return Observable.throw(error);
      }
      if (result.response.statusCode < 200 || result.response.statusCode > 226) {
        const unknownError = new Error('UNKNOWN_ERROR');
        unknownError.statusCode = result.response.statusCode;
        unknownError.body = result.body;
        return Observable.throw(unknownError);
      } else if (result.body.length < 1) {
        return Observable.of();
      }
      return Observable.of(JSON.parse(result.body));
    });
};

let requestObservable = (options) => {
  return Observable.create((observer) => {
    request(options, (err, response, body) => {
      if (err) {
        observer.error(err);
      } else {
        observer.next({response, body});
      }
      observer.complete();
    });
  });
};

module.exports = {execute, requestObservable};
