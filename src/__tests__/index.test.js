'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const {describe, it, beforeEach, afterEach} = global;
const expect = chai.expect;
chai.use(sinonChai);

import {TestScheduler, next, complete} from '@kwonoj/rxjs-testscheduler-compat';

import {getPhotos, getAlbums, postPhoto, deletePhoto, __RewireAPI__ as PicasaRewireAPI} from '../index';


describe('PicasaTest', () => {
  const accessToken = 'someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  let executorMockFunction;
  let testScheduler;


  beforeEach(() => {
    testScheduler = new TestScheduler();
  });

  describe('getPhotos', () => {
    describe('on success', () => {
      const fakeSuccessBody = {
        feed: {
          entry: [
            {
              title: {
                $t: 'IMG_0001.JPG'
              },
              content: {
                type: 'image/jpeg',
                src: 'https://lh3.googleusercontent.com/-1111111/1111/11111/1111/IMG_0001.JPG'
              }
            }
          ]
        }
      };

      let photos;
      let options;

      beforeEach((done) => {
        /* eslint-disable */
        const subject = testScheduler.createHotObservable(
          next(20, fakeSuccessBody),
          complete(30)
        );
        /* eslint-enable */

        executorMockFunction = (option) => {
          options = option;
          return subject;
        };
        PicasaRewireAPI.__Rewire__('execute', executorMockFunction);


        options = {maxResults: 1};

        getPhotos(accessToken, options)
          .subscribe({
            next: (photosResponse) => {
              photos = photosResponse;
              return;
            },
            error: (err) => expect(err).to.be.equals(null),
            complete: () => done()
          });

        testScheduler.advanceTo(31);
      });

      afterEach(() => {
        PicasaRewireAPI.__ResetDependency__('execute');
      });

      it('returns an array of photos', () => {
        expect(photos).to.be.an('Array');
      });

      it('returns a photo with its props', () => {
        expect(photos[0].title).to.be.equals('IMG_0001.JPG');
        expect(photos[0].content.src).to.contain('IMG_0001.JPG');
        expect(photos[0].content.type).to.be.equals('image/jpeg');
      });

      it('should make get request', () => {
        const calledMethod = options.method;
        expect(calledMethod.toLowerCase()).to.be.eql('get');
      });

      it('should hold specific GData-Version in header', () => {
        const headers = options.headers;
        expect(headers).to.be.eql({'GData-Version': '3'});
      });

      it('should have specific URL', () => {
        const url = options.url;
        expect(url).to.be.eql('https://picasaweb.google.com/data/feed/api/user/default?' +
          'alt=json&' +
          'kind=photo&' +
          'access_token=someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&' +
          'max-results=1');
      });

      it('should not have more than those three values', () => {
        expect(options).to.be.eql({
          method: 'GET',
          headers: {'GData-Version': '3'},
          url: 'https://picasaweb.google.com/data/feed/api/user/default?' +
          'alt=json&' +
          'kind=photo&' +
          'access_token=someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&' +
          'max-results=1'
        });
      });
    });
  });

  describe('getAlbums', () => {
    describe('on success', () => {
      const fakeSuccessBody = {
        feed: {
          entry: [
            {
              id: {
                $t: 'https://picasaweb.google.com/data/entry/api/user/00001/albumid/001?alt=json'
              },
              published: {
                $t: '2017-03-21T17:00:35.000Z'
              },
              title: {
                $t: 'Auto Backup',
                type: 'text'
              },
              gphoto$id: {
                $t: '001'
              },
              gphoto$name: {
                $t: 'InstantUpload'
              },
              gphoto$numphotos: {
                $t: 25411
              },
              gphoto$nickname: {
                $t: 'Max Mustermann'
              }
            }
          ]
        }
      };

      let albums;
      let options;

      beforeEach((done) => {
        /* eslint-disable */
        const subject = testScheduler.createHotObservable(
          next(20, fakeSuccessBody),
          complete(30)
        );
        /* eslint-enable */

        executorMockFunction = (option) => {
          options = option;
          return subject;
        };
        PicasaRewireAPI.__Rewire__('execute', executorMockFunction);


        options = {maxResults: 2};

        getAlbums(accessToken, options)
          .subscribe({
            next: (albumResponse) => {
              albums = albumResponse;
              return;
            },
            error: (err) => expect(err).to.be.equals(null),
            complete: () => done()
          });

        testScheduler.advanceTo(31);
      });

      afterEach(() => {
        PicasaRewireAPI.__ResetDependency__('execute');
      });

      it('returns an array of album', () => {
        expect(albums).to.be.an('Array');
      });

      it('returns a photo with its props', () => {
        expect(albums[0].id).to.be.equals('001');
        expect(albums[0].name).to.be.equals('InstantUpload');
        expect(albums[0].num_photos).to.be.equals(25411);
        expect(albums[0].published).to.be.equals('2017-03-21T17:00:35.000Z');
        expect(albums[0].title).to.be.equals('Auto Backup');
        expect(albums[0].summary).to.be.equals('');
        expect(albums[0].location).to.be.equals('');
        expect(albums[0].nickname).to.be.equals('Max Mustermann');
      });

    });
  });

  describe('postPhoto', () => {
    describe('on success', () => {
      const fakeSuccessBody = {
        entry: {
          title: {
            $t: 'IMG_0001.JPG'
          },
          content: {
            type: 'image/jpeg',
            src: 'https://lh3.googleusercontent.com/-1111111/1111/11111/1111/IMG_0001.JPG'
          }
        }
      };
      let photo;
      let options;

      beforeEach((done) => {
        /* eslint-disable */
        const subject = testScheduler.createHotObservable(
          next(20, fakeSuccessBody),
          complete(30)
        );
        /* eslint-enable */

        executorMockFunction = (option) => {
          options = option;
          return subject;
        };
        PicasaRewireAPI.__Rewire__('execute', executorMockFunction);

        const albumId = 'anAlbumId';
        const photoData = {
          title: 'An awesome title',
          description: 'Yolo',
          contentType: 'image/jpeg',
          binary: 'ImaginaryBinaryContent'
        };

        postPhoto(accessToken, albumId, photoData).subscribe({
          next: (photoResponse) => {
            photo = photoResponse;
            return;
          },
          error: (err) => expect(err).to.be.equals(null),
          complete: () => {
            done();
          }
        });
        testScheduler.advanceTo(31);
      });

      afterEach(() => {
        PicasaRewireAPI.__ResetDependency__('execute');
      });
      it('returns a photo object', () => {
        expect(photo).to.be.an('object');
      });

      it('returns a photo with its props', () => {
        expect(photo.title).to.be.equals('IMG_0001.JPG');
        expect(photo.content.src).to.contain('IMG_0001.JPG');
        expect(photo.content.type).to.be.equals('image/jpeg');
      });

      it('should make post request', () => {
        const calledMethod = options.method;
        expect(calledMethod.toLowerCase()).to.be.eql('post');
      });

      it('should prepare a multipart request and the URL and the method type', () => {
        expect(options).to.be.eql({
          method: 'POST',
          multipart: [
            {
              'Content-Type': 'application/atom+xml',
              body: `<entry xmlns="http://www.w3.org/2005/Atom">
                          <title>An awesome title</title>
                          <summary>undefined</summary>
                          <category scheme="http://schemas.google.com/g/2005#kind" 
                          term="http://schemas.google.com/photos/2007#photo"/>
                        </entry>`
            },
            {
              'Content-Type': 'image/jpeg',
              body: 'ImaginaryBinaryContent'
            }
          ],
          url: 'https://picasaweb.google.com/data/feed/api/user/default/albumid/anAlbumId?' +
          'alt=json&' +
          'access_token=someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
        });
      });
    });
  });

  describe('deletePhoto', () => {
    describe('on success', () => {
      let options;

      beforeEach((done) => {
        /* eslint-disable */
        const subject = testScheduler.createHotObservable(
          next(20),
          complete(30)
        );
        /* eslint-enable */

        executorMockFunction = (option) => {
          options = option;
          return subject;
        };
        PicasaRewireAPI.__Rewire__('execute', executorMockFunction);

        const albumId = 'anAlbumId';
        const photoId = 'aPhotoId';

        deletePhoto(accessToken, albumId, photoId).subscribe({
          next: (result) => expect(result).to.be.equals(undefined),
          error: (err) => expect(err).to.be.equals(null),
          complete: () => done()
        });
        testScheduler.advanceTo(31);

      });

      afterEach(() => {
        PicasaRewireAPI.__ResetDependency__('execute');
      });

      it('should make delete request', () => {
        const method = options.method;

        expect(method.toLowerCase()).to.be.eql('delete');
      });

      it('should prepare headers request and the URL', () => {

        expect(options).to.be.eql({
          method: 'DELETE',
          headers: {
            'If-Match': '*'
          },
          url: 'https://picasaweb.google.com/data/entry/api/user/default/albumid/anAlbumId/photoid/aPhotoId?' +
          'alt=json&' +
          'access_token=someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
        });
      });
    });
  });
});
