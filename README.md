![CI](https://github.com/ChFlick/prettier-plugin-firestore-rules/workflows/CI/badge.svg)
![MIT-License](https://img.shields.io/github/license/ChFlick/prettier-plugin-firestore-rules)
![Dependencies](https://img.shields.io/david/ChFlick/prettier-plugin-firestore-rules)
![DevDependencies](https://img.shields.io/david/dev/ChFlick/prettier-plugin-firestore-rules)
![npmVersion](https://img.shields.io/npm/v/prettier-plugin-firestore-rules?color=blue)

prettier-plugin-firestore-rules
===============================

A plugin for [prettier](https://prettier.io/) to enable autoformatting for [Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started).

A custom built parser for the rules is included.

How to install it
================

With npm
```
npm i --save-dev prettier prettier-plugin-firestore-rules
```

With yarn
```
yarn add -D prettier prettier-plugin-firestore-rules
```

How to install it in the CLI
==========================

Generally
```
prettier -w <path/to/file>
```

Using yarn berry
```
yarn prettier -w <path/to/file>
```

![Example Usage](./example-usage.gif)


To be done
==========

- Fix some indentation issues
  - Array not correctly indented as function parameter
  ```
  request.resource.data.keys().hasOnly(
  ['rank', 'name', 'description', 'imageUrl', 'timeSlot']
  )
  ```
  - Function parameter in general
  ```
  get(
  /databases/$(database)/documents/configurations/someData
  ).data.values.hasAll(request.resource.data.someData)
  ```
  - if-alignments, sometimes off
  ```
           if hasValue('writeSLots', request.auth.uid, carId)
      && zxcv
      && xcvb
    ```
  - semicolon may be off
  ```
  && request.resource.data.timeSlot.to > request.resource.data.timeSlot.from
            ;
  ```
- Add formatter options:
  - newlines after matchers/allows/functions
  - && at start or end of the line
