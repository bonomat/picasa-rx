'use strict';

import * as Picasa from '../index';
import * as fs from 'fs';
import * as Rx from 'rxjs/Rx';

let settings = require('./settings');

const accessToken = settings.accessToken;
const albumId = settings.albumId;

let photo = __dirname + '/photos/steak.jpg';

let readFileAsObservable = Rx.Observable.bindNodeCallback(fs.readFile);

readFileAsObservable(photo)
  .mergeMap(
    (binary) => {
      const photoData = {
        title: Date.now(),
        summary: 'Awesome steak!',
        contentType: 'image/jpeg',
        binary: binary
      };
      return Picasa.postPhoto(accessToken, albumId, photoData)
    })
  .subscribe({
    next: (photoResponse) => {
      console.log('photoResponse: ', photoResponse)
    },
    error: (err) => console.log('error: ', err),
    complete: () => {
      console.log('completed');
    }
  });