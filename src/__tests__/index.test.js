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

        const subject = testScheduler.createHotObservable(
          next(20, fakeSuccessBody),
          complete(30)
        );
        executorMockFunction = (option) => {
          options = option;
          return subject;
        };
        PicasaRewireAPI.__Rewire__('execute', executorMockFunction);


        options = {maxResults: 1};

        getPhotos(accessToken, options)
          .subscribe({
            next: (photosResponse) => photos = photosResponse,
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

});
