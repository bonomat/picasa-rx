'use strict';

import * as Picasa from '../index';

const accessToken = require('./settings').accessToken;

Picasa.getAlbums(accessToken, null)
  .subscribe({
    next: (album) => console.log('received album: ', album),
    error: (err) => console.log('error occurred: ', err),
    complete: () => console.log('complete')
  });