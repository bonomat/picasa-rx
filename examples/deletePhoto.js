'use strict';

import * as Picasa from '../index';

let settings = require('./settings');

const accessToken = settings.accessToken;
const albumId = settings.albumId;
const photoId = settings.photoId;

Picasa.deletePhoto(accessToken, albumId, photoId).subscribe({
  next: (result) =>
    console.log('deleting photo successful ', result),
  error: (error) => console.log('could not delete photo: ', error),
  complete: () => console.log('all done')
});
