---
id: server-side-rendering
title: Server Side Rendering
permalink: docs/server-side-rendering.html
---

When we want the pages to be properly indexable by search engines and get rendered instantly for the user.

---

It's important to understand that anything under a `client` folder is inexistent on server-side code. This is why we'll have to rename it to `ui` and make sure to adapt the other places it's used such as: `.babelrc`, `.flowconfig`, VSCode Settings, etc. If you used aliased imports in your code instead of absolute, you don't have to change anything else in your components.

To enable SSR, we create a new file and import it inside startup's `index.js`:

```js
// file: src/startup/server/ssr.js

import React from 'react';
import { StaticRouter } from 'react-router';
import { setClient } from 'apollo-morpher';

import { getRenderer } from 'meteor/cultofcoders:apollo';
import { onPageLoad } from 'meteor/server-render';

import { server } from './apollo';
import { App } from 'ui';

const render = getRenderer({
  app: sink => (
    <StaticRouter location={sink.request.url} context={{}}>
      <App />
    </StaticRouter>
  ),
  server,
  handler(sink, apolloClient) {
    setClient(apolloClient);
  },
});

onPageLoad(render);
```

That's it. If you want it to work with Authentication, then you'll have to set the token inside a cookie, so the server can identify the user and inject it into the context: 

```js
Cookies.set('meteor-login-token', token);
```

> Note
>
> If you want this to work with `react-loadable` because you do code-splitting, you'll have to use: `Loadable.preloadAll()` in the `app` resolver.
