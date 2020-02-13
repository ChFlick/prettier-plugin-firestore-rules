import { format } from 'prettier';

describe('the parser', () => {
  it('can format a basic rule', () => {
    const basicRule = `rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if false;
            }
          }
        }`;

    const result = format(basicRule, {
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    console.log(result);
  });
});