import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from '../out/parser/parser';

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

        parse(basicRule);
    });

    test('can parse the example rules', () => {
        const exampleRulesPath = resolve(__dirname + '/../example.rules');
        const exampleRules = readFileSync(exampleRulesPath).toString();

        parse(exampleRules);
    });
});