import { expect } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from '../src/parser/parser';

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

    test('can parse the example rules', () => {
        const exampleRulesPath = resolve(__dirname + '/../example.rules');
        const exampleRules = readFileSync(exampleRulesPath).toString();

        const result = parse(exampleRules);

        expect(result).to.be.an('array').with.length.gt(0);
    });
});