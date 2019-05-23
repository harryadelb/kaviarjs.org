---
id: frontend-basics
title: Basics
permalink: docs/frontend-basics.html
---

In this article you'll learn about Kaviar's way of handling frontend part for your web application.

---

First we'll need the following packages:
```bash
meteor add static-html fourseven:scss seba:minifiers-autoprefixer
```

Remember `src/startup/client` ? Let's go there, and create our entry points.

```js
// file: src/startup/client/apollo.js
import { initialize } from 'meteor/cultofcoders:apollo';

const { client } = initialize({});

export default client;
```

```html
<!-- file: src/startup/client/main.html -->
<head>
  <title>Kaviar</title>
</head>

<body>
  <div id="react-root"></div>
</body>
```

```js
// file: src/startup/client/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter } from 'react-router-dom';

import { App } from 'ui';
import apolloClient from './apollo';

const ApolloApp = () => (
  <ApolloProvider client={apolloClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
);

ReactDOM.render(<ApolloApp />, document.getElementById('react-root'));
```

Now moving on to creating our first component:
```jsx
// file: src/client/App.jsx
import React, { Component, Fragment } from 'react';
import { Route } from 'react-router';
import routes from 'ui/routes';

export default class App extends Component {
  render() {
    return (
      <>
        {routes.map((route, idx) => (
          <Route key={idx} exact={true} {...route} />
        ))}
      </>
    );
  }
}
```

Create a folder `pages` and add an `index.js` file to it:
```jsx
import './pages';

export { default as App } from './App';
```

Create the routes file `src/client/routes.js`:

```js
let routes = [];

export default routes;
```

As you will notice in our `Home` page, before we render the App we allow routes to be manipulated from components. Allowing us to decentralize them, often making it much easier to work with them.

And finally we can now create our first page!

```jsx
// file: src/client/pages/Home/index.js
import React from 'react';
import routes from 'ui/routes';

const Home = () => (
  <div className="page-Home">
    <h1>Kaviar</h1>
  </div>
);

routes.push({
  path: '/',
  component: Home,
});

export default Home;
```

```jsx
// file src/client/pages/index.js
export { Home } from './Home';
```

## Pages vs Components

When you want to create components that are re-usable they have to be stored inside `src/client/components`. And we follow the same pattern as for pages.

> Note
>
> If we have a page that contains components that won't be used anywhere else other than the page it's ok to keep it in the folder of the page: `src/client/pages/Home/components/*`

## Code Splitting

When you have components that are very heavy, they use a charts library, and you don't want it in your initial bundle, you can use [react-loadable](https://github.com/jamiebuilds/react-loadable) directly. And check [this guide here](https://www.erichartzog.com/blog/code-splitting-with-meteor-dynamic-imports-and-react-loadable).

## Webpack

If you prefer other frontend bundling solution, you are free to use anything you like, for connecting to Apollo client with all the goodies checkout this file: https://github.com/cult-of-coders/apollo/blob/master/client/index.js

