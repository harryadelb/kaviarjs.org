---
id: setup-your-project
title: Setup your Project
permalink: docs/setup-your-project.html
---

In this page you will learn how to quickly get up and running with Kaviar

---

## Step 1 - Install Meteor

You can install [Meteor](https://www.meteor.com/install) from here [https://www.meteor.com/install](https://www.meteor.com/install) and after that create your project:

```
meteor create --bare kaviar

cd kaviar
```

You don't have to learn Meteor in order to learn how to use Kaviar, Meteor is just a simple way of bundling your code and contains a lot of great packages that help you accelerate development.

## Step 2 - Install Apollo

Meteor has a lot of great packages stored in [Atmosphere](https://atmospherejs.com/), but we will try to use them to a minimum. One of the most important packages that makes Kaviar what it is, is the [cultofcoders:apollo](https://github.com/cult-of-coders/apollo) package which helps us setup Apollo quickly:

```
# Now we add the apollo package
meteor add cultofcoders:apollo
```

It's up to us to install the rest of the packages that we use
```bash
# Now we install our npm dependencies for server
meteor npm i -S graphql graphql-load apollo-server-express uuid graphql-tools graphql-type-json apollo-live-server

# Dependencies for the client
meteor npm i -S react-apollo apollo-live-client apollo-client apollo-cache-inmemory apollo-link apollo-link-http apollo-link-ws apollo-morpher subscriptions-transport-ws apollo-upload-client

# Optional but highly recommended (so you can import .gql/.graphql files)
meteor add swydo:graphql
```

Now let's setup our GraphQL server:
```js
// file: "server/main.js"
import { initialize } from 'meteor/cultofcoders:apollo';
import { load } from 'graphql-load';

load({
  typeDefs: `
    type Query {
      sayHello: String
    }
  `,
  resolvers: {
    Query: {
      sayHello: () => 'Hello world!',
    },
  },
});

initialize();
```

Now if you start your project, you will be able to access http://localhost:3000/graphql

```
meteor run
```

And run your query:

```graphql
query {
  sayHello
}
```

## Step 3 - Configure your Project

### Loading Aliasing

Now we would like to play a little bit with `.babelrc`, to give us some handy shortcuts when importing:

```js
{
  "presets": ["meteor"],
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["."],
        "alias": {
          "modules": "./src/modules",
          "core": "./src/modules/core",
          "ui": "./src/client",
        }
      }
    ]
  ]
}
```

This would allow us to avoid absolute path imports: 
```js
import X from '/src/modules/core/xxx'

// transforms into:
import X from 'core/xxx'
```

```bash
meteor npm i --save-dev babel-plugin-module-resolver
```

### Initialising Flow

Just create `.flowconfig` in the root of your project, that that's it. Use the configuration below. If you don't know what [Flow](https://flow.org/en/docs/lang/types-and-expressions/) is, [take a look here](https://flow.org/en/docs/lang/types-and-expressions/), and don't worry about it for now.

```
[options]
# Absolute path support:
# e.g. "/collections/todos"
module.name_mapper='^\/\(.*\)$' -> '<PROJECT_ROOT>/\1'

# Meteor none core package support
# e.g. "meteor/kadira:flow-router"
module.name_mapper='^meteor\/\(.*\):\(.*\)$' -> '<PROJECT_ROOT>/.meteor/local/build/programs/server/packages/\1_\2'

# Meteor core package support
# e.g. "meteor/meteor"
module.name_mapper='^meteor\/\(.*\)$' -> '<PROJECT_ROOT>/.meteor/local/build/programs/server/packages/\1'

# Fallback for Meteor core client package
# e.g. "meteor/meteor"
module.name_mapper='^meteor\/\(.*\)$' -> '<PROJECT_ROOT>/.meteor/local/build/programs/web.browser/packages/\1'

# Structural mapping
module.name_mapper='^modules\/\(.*\)$' -> '<PROJECT_ROOT>/src/modules/\1'
module.name_mapper='^core\/\(.*\)$' -> '<PROJECT_ROOT>/src/modules/core/\1'
module.name_mapper='^ui\/\(.*\)$' -> '<PROJECT_ROOT>/src/client/\1'

[ignore]
# Ignore the `.meteor/local` packages that aren't important
.*/.meteor/local/build/programs/server/app/.*
.*/.meteor/local/build/programs/server/assets/.*
.*/.meteor/local/build/programs/server/npm/.*
.*/.meteor/local/build/programs/server/node_modules/.*
.*/.meteor/local/build/programs/web.browser/app/.*
.*/.meteor/local/build/main.js
.*/.meteor/packages/.*
```

### Configure Prettier

In the `.prettierrc` file:

```js
module.exports = {
  printWidth: 90,
  trailingComma: 'es5',
  singleQuote: true,
  parser: 'flow',
};
```

### Configure ESLint

```js
module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['import', 'jsx-a11y', 'meteor', 'react', 'flowtype'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:meteor/recommended',
    'plugin:react/recommended',
    'plugin:flowtype/recommended',
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  globals: {},
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    },
    'import/resolver': {
      alias: [
        ['modules', './src/modules'],
        ['core', './src/modules/core'],
        ['ui', './src/client'],
      ],
    },
  },
  rules: {
    'prettier/prettier': 'error',
    'import/no-unresolved': ['error', { ignore: ['^meteor/', '^/'] }],
    'no-console': 0,
  },
};
```

This needs few dependencies:
```
meteor npm i --save-dev eslint eslint-import-resolver-alias eslint-config-prettier eslint-plugin-flow eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-meteor eslint-plugin-prettier eslint-plugin-react prettier-eslint babel-eslint
```

### VSCode Recommended Config

Install `Prettier`, `ESLint`, `Flow Language Support` and `Path Autocomplete` plugins.

```json
{
  "typescript.validate.enable": false,
  "javascript.validate.enable": false,
  "flow.enabled": true,
  "flow.runOnAllFiles": true,
  "prettier.eslintIntegration": true,
  "eslint.enable": true,
  "editor.formatOnSave": true,
  "path-autocomplete.pathMappings": {
    "ui": "${folder}/src/client",
    "modules": "${folder}/src/modules",
    "db": "${folder}/src/db"
  }
}
```
