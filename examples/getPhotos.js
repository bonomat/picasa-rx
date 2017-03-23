'use strict';
// run with babel-node --presets es2015,stage-2 getPhotos.js

import * as Picasa from '../index';

const accessToken = require('./settings').accessToken;

const options = {maxResults: 1};

Picasa.getPhotos(accessToken, options)
  .subscribe({
    next: (photosResponse) => console.log('received photo: ', photosResponse),
    error: (err) => console.log('error occurred: ', err),
    complete: () => console.log('complete')
  });