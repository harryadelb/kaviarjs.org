---
id: frontend-styling
title: Styling
permalink: docs/frontend-styling.html
---

Let's learn a strategy to work with SASS and components to avoid collisions and make it easy to work with.

---

## Styling

For styling we use SCSS and we recommend to keep your styles next to your components.

Create a file `main.scss` inside `src/client/styles` folder:

```scss
@import '_variables';
@import '../components/_style';
@import '../pages/_style';
```

From now on all scss files will start with a `_` and they have to be explicitly imported. Let's create `src/client/pages/_style.scss`:

```scss
@import './Home/_style';
```

And now the `_style.scss` file inside Home folder:

```scss
.page-Home {
  h1 {
    text-align: center;
  }
}
```

All pages and components should have unique names to allow unique classnames to avoid clashes: `page-Home`, `component-Avatar`, etc.

## Component Library (antd)

We recommend [Ant Design](https://ant.design/docs/react/introduce) library because it's complex and comprehensive. Below we show you how to install it:

```bash
meteor npm i -S antd
```

Inject the styling via symlink:
```bash
ln -s node_modules/antd/dist/antd.css src/client/styles/_antd.scss
```

File: `src/client/styles/main.scss`:
```scss
@import '_antd';
```