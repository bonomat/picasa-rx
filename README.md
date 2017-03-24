[![Build Status](https://travis-ci.org/bonomat/picasa-rx.svg?branch=master)](https://travis-ci.org/bonomat/picasa-rx)


# picasa-rx

A picasa web album client written in ES2015 using RxJS observables.

---


## Basic Usage

### Installation

```bash
$ npm install picasa-rx
```

#### Getting photos
```javascript
import * as Picasa from 'picasa-rx';

const accessToken = 'someAccessToken';

const options = {maxResults: 1};

Picasa.getPhotos(accessToken, options)
  .subscribe({
    next: (photosResponse) => console.log('received photo: ', photosResponse),
    error: (err) => console.log('error occurred: ', err),
    complete: () => console.log('complete')
  });
```

#### Getting albums

```javascript
const accessToken = 'someAccessToken';

Picasa.getAlbums(accessToken, null)
  .subscribe({
    next: (album) => console.log('received album: ', album),
    error: (err) => console.log('error occurred: ', err),
    complete: () => console.log('complete')
  });
```


#### Upload a photo to a specific album

```javascript
const accessToken = 'someAccessToken';
const albumId = 'someAlbumId';

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
```

checkout the example folder for more details


## Linting

* ESLINT support is added to the project.
* It's configured for ES2015 and inherited configurations from [graphql/graphql-js](https://github.com/graphql/graphql-js).
* Use `npm run lint` to lint your code and `npm run lintfix` to fix common issues.

## Testing

* You can write test under `__test__` directory anywhere inside `src` including sub-directories.
* Then run `npm test` to test your code. (It'll lint your code as well).
* You can also run `npm run testonly` to run tests without linting.

## ES2015 Setup

* ES2015 support is added with babel6.
* After you publish your project to NPM, it can be run on older node versions and browsers without the support of Babel.
* This project uses ES2015 and some of the upcoming features like `async await`.
* You can change them with adding and removing [presets](http://jamesknelson.com/the-six-things-you-need-to-know-about-babel-6/).
* All the polyfills you use are taken from the local `babel-runtime` package. So, this package won't add any global polyfills and pollute the global namespace.

## Kudos

* Babel6, RXJs and the team behind of them.
* Picasa client based on this project [https://github.com/esteban-uo/picasa](https://github.com/esteban-uo/picasa)
* npm-base for the basis of this project [npm-base](https://github.com/kadirahq/npm-base)
