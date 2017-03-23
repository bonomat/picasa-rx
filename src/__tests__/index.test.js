'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const {describe, it, beforeEach, afterEach} = global;
const expect = chai.expect;
chai.use(sinonChai);

import {TestScheduler, next, complete} from '@kwonoj/rxjs-testscheduler-compat';

import {getPhotos, __RewireAPI__ as PicasaRewireAPI} from '../index';


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
        expect(headers).to.be.eql({'GData-Version': '2'});
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
          headers: {'GData-Version': '2'},
          url: 'https://picasaweb.google.com/data/feed/api/user/default?' +
          'alt=json&' +
          'kind=photo&' +
          'access_token=someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&' +
          'max-results=1'
        });
      });
    });
  });

  /*
   describe('deletePhoto', () => {
   });
   describe('on success', () => {
   let photo;

   beforeEach((done) => {
   stub = sinon.stub(picasa, 'executeRequest');
   stub.callsArgWithAsync(2, null, '');

   const accessToken = 'someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
   const albumId = 'anAlbumId';
   const photoId = 'aPhotoId';

   picasa.deletePhoto(accessToken, albumId, photoId, (error) => {
   expect(error).to.be.equals(null);
   done()
   });
   });

   afterEach(() => stub.restore());

   it('should make delete request', () => {
   const firstArgument = stub.args[0][0];

   expect(firstArgument).to.be.eql('del');
   });

   it('should prepare headers request and the URL', () => {
   const secondArgument = stub.args[0][1];

   expect(secondArgument).to.be.eql({
   "headers": {
   'If-Match': '*'
   },
   url: "https://picasaweb.google.com/data/entry/api/user/default/albumid/anAlbumId/photoid/aPhotoId?alt=json
   &access_token=someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
   });
   });
   });

   describe('postPhoto', () => {
   describe('on success', () => {
   const fakeSuccessBody = {
   "entry": {
   "title": {
   "$t": "IMG_0001.JPG"
   },
   "content": {
   "type": "image/jpeg",
   "src": "https://lh3.googleusercontent.com/-1111111/1111/11111/1111/IMG_0001.JPG"
   }
   }
   };
   let photo;

   beforeEach((done) => {
   stub = sinon.stub(picasa, 'executeRequest');
   stub.callsArgWithAsync(2, null, fakeSuccessBody);

   const accessToken = 'someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
   const albumId = 'anAlbumId';
   const photoData = {
   title: 'An awesome title',
   description: 'Yolo',
   contentType: 'image/jpeg',
   binary: 'ImaginaryBinaryContent'
   };

   picasa.postPhoto(accessToken, albumId, photoData, (error, photoResponse) => {
   expect(error).to.be.equals(null);
   photo = photoResponse;

   done();
   });
   });

   afterEach(() => stub.restore());

   it('returns a photo object', () => {
   expect(photo).to.be.an('object');
   });

   it('returns a photo with its props', () => {
   expect(photo.title).to.be.equals('IMG_0001.JPG');
   expect(photo.content.src).to.contain('IMG_0001.JPG');
   expect(photo.content.type).to.be.equals('image/jpeg');
   });

   it('should make post request', () => {
   const firstArgument = stub.args[0][0];

   expect(firstArgument).to.be.eql('post');
   });

   it('should prepare a multipart request and the URL', () => {
   const secondArgument = stub.args[0][1];

   expect(secondArgument).to.be.eql({
   "multipart": [
   {
   "Content-Type": "application/atom+xml",
   "body": "<entry xmlns=\"http://www.w3.org/2005/Atom\">\n
   <title>An awesome title</title>\n
   <summary>undefined</summary>\n
   <category scheme=\"http://schemas.google.com/g/2005#kind\" term=\"http://schemas.google.com/photos/2007#photo\"/>\n
   </entry>"
   },
   {
   "Content-Type": "image/jpeg",
   "body": "ImaginaryBinaryContent"
   }
   ],
   url: "https://picasaweb.google.com/data/feed/api/user/default/albumid/anAlbumId?alt=json
   &access_token=someAccessTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
   });
   });
   });
   });

   describe('getAuthURL', () => {
   it('returns valid URI', () => {
   expect(picasa.getAuthURL(config))
   .to.be.equals('https://accounts.google.com/o/oauth2/auth?access_type=offline
   &scope=https%3A%2F%2Fpicasaweb.google.com%2Fdata&response_type=code&client_id=apps.google.com
   &redirect_uri=http%3A%2F%2Flocalhost')
   });
   });

   describe('getAccessToken', () => {
   beforeEach(() => {
   const fakeBody = {
   access_token: 'ya29.KwLDeXsw1jNAavZ8jEMFgikhDg_CnUX1oMr5RQUyeqTBf229YV4HzhhXvRgBBvFGqTqxdw',
   token_type: 'Bearer',
   expires_in: 3580
   };

   stub = sinon.stub(picasa, 'executeRequest');

   stub.callsArgWithAsync(2, null, fakeBody);
   });

   afterEach(() => stub.restore());

   it('returns access token response', (done) => {
   picasa.getAccessToken(config, '4/DxoCTw8Rf3tQAAW94h6lK7ioEjnu6K8kEqVZ0d-cRA8', (error, accessToken) => {
   expect(stub).to.have.been.calledWith('post', {url: 'https://www.googleapis.com/oauth2/v3/token?
   grant_type=authorization_code&code=4%2FDxoCTw8Rf3tQAAW94h6lK7ioEjnu6K8kEqVZ0d-cRA8&
   redirect_uri=http%3A%2F%2Flocalhost&client_id=apps.google.com&client_secret=client_secretABC'});

   expect(error).to.be.equal(null);
   expect(accessToken).to.be.equals('ya29.KwLDeXsw1jNAavZ8jEMFgikhDg_CnUX1oMr5RQUyeqTBf229YV4HzhhXvRgBBvFGqTqxdw');

   done();
   });
   });
   });*/
});
