'use strict';

const querystring = require('querystring');

import {execute} from './executeRequest';

const PICASA_SCOPE = 'https://picasaweb.google.com/data';
const PICASA_API_FEED_PATH = '/feed/api/user/default';
const PICASA_API_ENTRY_PATH = '/entry/api/user/default';
const FETCH_AS_JSON = 'json';
const photoSchema = {
  gphoto$id: 'id',
  gphoto$albumid: 'album_id',
  gphoto$access: 'access',
  gphoto$width: 'width',
  gphoto$height: 'height',
  gphoto$size: 'size',
  gphoto$checksum: 'checksum',
  gphoto$timestamp: 'timestamp',
  gphoto$imageVersion: 'image_version',
  gphoto$commentingEnabled: 'commenting_enabled',
  gphoto$commentCount: 'comment_count',
  content: 'content',
  title: 'title',
  summary: 'summary'
};
const albumSchema = {
  gphoto$id: 'id',
  gphoto$name: 'name',
  gphoto$numphotos: 'num_photos',
  published: 'published',
  title: 'title',
  summary: 'summary',
  gphoto$location: 'location',
  gphoto$nickname: 'nickname'
};

let getPhotos = (accessToken, givenOptions) => {

  const accessTokenParams = {
    alt: FETCH_AS_JSON,
    kind: 'photo',
    access_token: accessToken // eslint-disable-line
  };

  let options = givenOptions || {};

  if (options.maxResults) {
    accessTokenParams['max-results'] = options.maxResults;
  }

  const albumPart = options.albumId ? `/albumid/${options.albumId}` : '';

  const requestQuery = querystring.stringify(accessTokenParams);

  const requestOptions = {
    method: 'GET',
    url: `${PICASA_SCOPE}${PICASA_API_FEED_PATH}${albumPart}?${requestQuery}`,
    headers: {
      'GData-Version': '3'
    }
  };
  return execute(requestOptions)
    .map((body) =>
      body.feed.entry.map(
        (entry) => parseEntry(entry, photoSchema)
      ));
};

let getAlbums = (accessToken) => {
  const accessTokenParams = {
    alt: FETCH_AS_JSON,
    access_token: accessToken // eslint-disable-line
  };

  const requestQuery = querystring.stringify(accessTokenParams);

  const requestOptions = {
    url: `${PICASA_SCOPE}${PICASA_API_FEED_PATH}?${requestQuery}`,
    headers: {
      'GData-Version': '3'
    }
  };

  return execute(requestOptions)
    .map((body) =>
      body.feed.entry.map(
        (entry) => parseEntry(entry, albumSchema)
      ));
};


let postPhoto = (accessToken, albumId, photoData) => {
  const requestQuery = querystring.stringify({
    alt: FETCH_AS_JSON,
    access_token: accessToken // eslint-disable-line
  });

  const photoInfoAtom = `<entry xmlns="http://www.w3.org/2005/Atom">
                          <title>${photoData.title}</title>
                          <summary>${photoData.summary}</summary>
                          <category scheme="http://schemas.google.com/g/2005#kind" 
                          term="http://schemas.google.com/photos/2007#photo"/>
                        </entry>`;

  const requestOptions = {
    method: 'POST',
    url: `${PICASA_SCOPE}${PICASA_API_FEED_PATH}/albumid/${albumId}?${requestQuery}`,
    multipart: [
      {'Content-Type': 'application/atom+xml', body: photoInfoAtom},
      {'Content-Type': photoData.contentType, body: photoData.binary}
    ]
  };

  return execute(requestOptions)
    .map((body) => parseEntry(body.entry, photoSchema));
};


let deletePhoto = (accessToken, albumId, photoId) => {
  const requestQuery = querystring.stringify({
    alt: FETCH_AS_JSON,
    access_token: accessToken // eslint-disable-line
  });

  const requestOptions = {
    method: 'DELETE',
    url: `${PICASA_SCOPE}${PICASA_API_ENTRY_PATH}/albumid/${albumId}/photoid/${photoId}?${requestQuery}`,
    headers: {
      'If-Match': '*'
    }
  };

  return execute(requestOptions);
};

/** **************************************************** helpers ******************************************************/

let parseEntry = (entry, schema) => {
  let photo = {};

  Object.keys(schema).forEach((schemaKey) => {
    const key = schema[schemaKey];

    if (key) {
      photo[key] = checkParam(entry[schemaKey]);
    }
  });
  return photo;
};

let checkParam = (param) => {
  if (param === undefined) {
    return '';
  } else if (isValidType(param)) {
    return param;
  } else if (isValidType(param['$t'])) {
    return param['$t'];
  }
  return param;
};

let isValidType = (value) => {
  return typeof value === 'string' || typeof value === 'number';
};

module.exports = {getPhotos, getAlbums, postPhoto, deletePhoto};
