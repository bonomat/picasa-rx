'use strict';

let request = require('request');
import {Observable} from 'rxjs/Rx';

let executeRequest = requestOptions => {
  return Observable.create(observer => {
    requestObservable(requestOptions)
      .subscribe({
        next: result => {
          if (result.response.statusCode < 200 || result.response.statusCode > 226) {
            const unknownError = new Error('UNKNOWN_ERROR');
            unknownError.statusCode = result.response.statusCode;
            unknownError.body = result.body;
            observer.error(unknownError);
          } else if (result.body.length < 1) {
            observer.next();
          } else {
            observer.next(JSON.parse(result.body));
          }
        },
        error: err => {
          observer.error(err);
        },
        complete: () => observer.complete()
      });
  });
};

let requestObservable = options => {
  return Observable.create(observer => {
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

module.exports = {executeRequest, requestObservable};
