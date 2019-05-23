---
id: loading-the-api
title: Loading the API
permalink: docs/loading-the-api.html
---

In this page you will learn how to load your schema and resolvers and perform propper code separation of concerns:

---


## GraphQL-Load

As you've already noticed from the project setup we do the loading like this:

```js
// file: "server/main.js"
import { initialize } from 'meteor/cultofcoders:apollo';
import { load } from 'graphql-load';

load({
  typeDefs: `...`,
  resolvers: { ... }
});

initialize();
```

`initialize()` must be called after everything has been loaded because it will work together with [graphql-load](https://www.npmjs.com/package/graphql-load) to extract the already loaded schema. If you `load()` stuff after initialise, they will have no effect. Take a look at the [package documentation](https://www.npmjs.com/package/graphql-load) to get a little bit familiar with the concepts then we'll explore how we use it in Kaviar.


Even if we have just few lines, it already feels like we need to split things up, and have our api loaded in a separate file.

## Explicit Loading

Meteor, being a full-stack development tool, by default, auto-loads files from `client/` and `server/` folder for convenience, however it has an exception for `imports/` folder, and doesn't auto-load anything from it. However, we would like to opt-out of this functionality all together, and for this, we open `package.json` and add the following:

```json
  "meteor": {
    "mainModule": {
      "client": "src/startup/client/index.js",
      "server": "src/startup/server/index.js"
    },
  }
```

## Startup Files configuration

In case of the client, initially create a blank `index.js` file inside the `src/startup/client` folder, we don't care about it right now. But for the `server/index.js` file we do it like this:

We import the modules, then we initialise our server.
```js
// file: src/startup/server/index.js
import '../../modules';
import './apollo.js';
```

```js
// file: src/modules/index.js
// Here we will import all modules
import './core';
```

```js
// file: src/modules/core/index.js
import { load } from 'graphql-load';

load({
  typeDefs: `...`,
  resolvers: { ... }
});
```

Initialising GraphQL Server, and exporting the server, in case we need it later:

```js
// file: src/startup/server/apollo.js
import { initialize } from 'meteor/cultofcoders:apollo';

const { server } = initialize();

export { server };
```

Things start to become more organised right now, we have our own folder for storing our modules and we have a way to configure high-level stuff inside the `startup` folder.

## GraphQL Files

It can be very convenient in some cases, to store our types inside `.gql` or `.graphql` files to allow the IDE to nicely highlight it for us.

```bash
meteor add swydo:graphql
```

And now you can nicely do it like this:

```graphql
# file: src/modules/core/types.gql
type Query {
  sayHello: String
}
```

```js
// file: src/modules/core/resolvers.js
export default {
  Query: {
    sayHello: () => 'Hello world!'
  },
};
```

```js
// file: src/modules/core/index.js
import { load } from 'graphql-load';

import typeDefs from './types.gql';
import resolvers from './resolvers';

load({ typeDefs, resolvers });
```



