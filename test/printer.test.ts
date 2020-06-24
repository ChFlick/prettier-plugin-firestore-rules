import { format } from 'prettier';

describe('the parser', () => {
  it('can format basic rules', () => {
    const basicRule = `rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if false;
            }
          }
        }`;

    const result = format(basicRule, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    console.log(result);
  });

  it('can format more complex rules', () => {
    const rules = `rules_version = '2';
    service cloud.firestore {
       match /databases/{database}/documents {
          function hasValue(value, uid, carId) {
             return get(/databases/$(database)/documents/someData/$(uid)/subCollection/$(carId)).data.someData.hasAll([value])
          }
    
          match /someData/{targetUserId} {
             allow write, read: if false;
             allow read: if request.auth.uid == targetUserId 
             match /subCollection/{carId} {
                allow read: if hasValue('bla', request.auth.uid, carId);
                allow update: if false;
             }
          }
        }
      }`;

    const result = format(rules, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts'],
      printWidth: 200,
    });

    console.log(result);
  });
});