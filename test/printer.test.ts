import { format } from 'prettier';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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

    expect(result).toMatchSnapshot();
  });

  it('can format an is condition', () => {
    const basicRule = `rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow write, read: if request.resource.data.asdf is int;
            }
          }
        }`;

    const result = format(basicRule, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    expect(result).toMatchSnapshot();
  });

  it('can format &&/|| connected conditions', () => {
    const basicRule = `rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow write, read: if request.resource.data.asdf is int &&
                                    request.resource.data.asdf == 333 ||
                                    abcdef == 22;
            }
          }
        }`;

    const result = format(basicRule, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    expect(result).toMatchSnapshot();
  });

  it('can format root-level functions', () => {
    const basicRule = `rules_version = '2';
    function test() {
      return true;
    }
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow write, read: if true;
            }
          }
        }
        function test2() {
          return false;
        }`;

    const result = format(basicRule, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    expect(result).toMatchSnapshot();
  });

  it('can format service-level functions', () => {
    const basicRule = `rules_version = '2';
        service cloud.firestore {
          function test() {
            return true;
          }
          match /databases/{database}/documents {
            match /{document=**} {
              allow write, read: if true;
            }
          }
          function test2() {
            return false;
          }
        }
        `;

    const result = format(basicRule, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    expect(result).toMatchSnapshot();
  });

  it('can format let inside functions', () => {
    const basicRule = `rules_version = '2';
        service cloud.firestore {
          function test() {
            let x = true;
            return x;
          }
        }
        `;

    const result = format(basicRule, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    expect(result).toMatchSnapshot();
  });

  it('cannot parse functions before the rules version token', () => {
    const basicRule = `
    function test() {
      return true;
    }
    rules_version = '2';
    
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow write, read: if request.resource.data.asdf is int &&
                                    request.resource.data.asdf == 333 ||
                                    abcdef == 22;
            }
          }
        }`;

    const t = (): void => {
      format(basicRule, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parser: 'firestore' as any,
        plugins: ['src/index.ts']
      });
    };

    expect(t).toThrowError();
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
    
          match /users/{userId} {
             allow write, read: if false;
          }
    
          match /cars/{carId} {
             match /roles/{roleId} {
                allow delete: if get(/databases/$(database)/documents/configurations/someData).data.values.hasAll(request.resource.data.someData)
                             && request.resource.data.keys().hasOnly(['name', 'someData'])
                             && request.resource.data.size() == 2
                             && request.resource.data.name is string
                             && request.resource.data.someData is list
                             && hasValue('bla', request.auth.uid, carId);
    
                allow read: if hasValue('bla', request.auth.uid, carId);
             }
    
             match /oneLevel/{one} {
                match /twoLevel/{two} {
                   match /threeLevel/{three} {
                      allow write, read: if request.resource.data.asdf is int &&
                                        request.resource.data.asdf == 333;
                   }
                }
             }
    
             match /store/current/{doc=**} {
                allow read: if request.auth.uid != null;
    
                match /slots/{slotId} {
                   allow write: if hasValue('writeSLots', request.auth.uid, carId)
                                   && request.resource.data.keys().hasOnly(['rank', 'name', 'description', 'imageUrl', 'timeSlot'])
                                   && request.resource.data.rank is int
                                   && request.resource.data.name is string
                                   && request.resource.data.description is string
                                   && request.resource.data.imageUrl is path
                                   && request.resource.data.timeSlot.from is timestamp
                                   && request.resource.data.timeSlot.to is timestamp
                                   && request.resource.data.timeSlot.to > request.resource.data.timeSlot.from;
                }
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

    expect(result).toMatchSnapshot();
  });

  it('can format comments behind the rules version', () => {
    const basicRule = `rules_version = '2';    // this is a comment
        service cloud.firestore {
          function test() {
            let x = true;
            return x;
          }
        }
        `;

    const result = format(basicRule, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    expect(result).toMatchSnapshot();
  });

  it('can format the example rules', () => {
    const exampleRulesPath = resolve(__dirname + '/../example.rules');
    const exampleRules = readFileSync(exampleRulesPath).toString();

    const result = format(exampleRules, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: 'firestore' as any,
      plugins: ['src/index.ts']
    });

    expect(result).toMatchSnapshot();
  });
});