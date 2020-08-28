![CI](https://github.com/ChFlick/prettier-plugin-firestore-rules/workflows/CI/badge.svg)

**This Plugin is still WIP**

prettier-plugin-firestore-rules
===============================

A plugin for [prettier](https://prettier.io/) to enable autoformatting for [Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started).

A custom built parser for the rules is included.

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
- Add formatter options:
  - newlines after matchers/allows/functions
  - && at start or end of the line
