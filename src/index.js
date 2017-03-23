'use strict';

const querystring = require('querystring');

import {execute} from './executeRequest';

const PICASA_SCOPE = 'https://picasaweb.google.com/data';
const PICASA_API_FEED_PATH = '/feed/api/user/default';
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

let getPhotos = (accessToken, givenOptions) => {

  const accessTokenParams = {
    alt: FETCH_AS_JSON,
    kind: 'photo',
    access_token: accessToken
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
      'GData-Version': '2'
    }
  };
  return execute(requestOptions)
    .map((body) =>
      body.feed.entry.map(
        (entry) => parseEntry(entry, photoSchema)
      ));
};

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

module.exports = {getPhotos};
