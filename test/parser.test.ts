import { parse } from '../src/parser/parser';
import { expect } from 'chai';

describe('the parser', () => {
    it('generates a valid result', () => {
        const basicRule = `rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if false;
            }
          }
        }`;

        const result = parse(basicRule);

        expect(result).to.be.an('array').with.length.gt(0);
    });
});