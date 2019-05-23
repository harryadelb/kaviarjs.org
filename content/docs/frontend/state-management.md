---
id: frontend-state-management
title: State Management
permalink: docs/frontend-state-management.html
---

There a lot of solutions, tooling out there, but we're opinionated. We like [pure FLUX](https://facebook.github.io/flux/docs/overview.html), [MobX](https://github.com/mobxjs/mobx), and [Molecule](https://github.com/cult-of-coders/react-molecule)

---

There are few scenarios that require different strategies. We'll go over them one by one.

## Reaction Strategy

React to certain events in the system, for example:
- We received a new notification or message
- A session time has expired

For this we use the good old `Observer Pattern`:

```bash
meteor npm install --save eventemitter3
```

```jsx
// file: src/client/events.js
import EventEmitter from 'eventemitter3';

export const Emitter = new EventEmitter();

export const Events = {
  NEW_NOTIFICATION: 'new-notification'
}
```

```jsx
import { Emitter, Events } from 'ui/events';

class MyView extends React.Component {
  componentDidMount() {
    Emitter.on(Events.NEW_NOTIFICATION, this.handleNewNotification, this)
  }

  componentWillUnmount() {
    Emitter.removeListener(Events.NEW_NOTIFICATION, this.handleNewNotification, this)
  }

  handleNewNotification() {
    // do something with this event, play a sound, change document.title, etc
  }
}
```

## Reactive Storage

Now, there will be places where you need information such as the current logged in users, or other info that is needed from many places, or you want to cache some information and Apollo's cache may not be what you need, and when it changes those many places need to be updated. For that we'll use [MobX](https://github.com/mobxjs/mobx).

```bash
meteor npm i -S mobx mobx-react
```

```jsx
import { observable } from 'mobx';
import { observer } from 'mobx-react';

const GlobalStorage = observable({
  loggedIn: true,
  userId: null,
})

observer(() => {
  // Whenever this changes, this component will re-render.
  const { loggedIn } = GlobalStorage;

  return (
    <div>
      Am I logged in ?
      <br />
      {loggedIn ? 'Yes': 'No'}
    </div>
  )
})

// And later you can change your store simply by doing:
GlobalStorage.loggedIn = true;
```

> Note
>
> In some scenarios it can be wise to have persisted storage of some values. For example store it inside cookies as `JSON`, and when starting the app restore it from cookies. Hint: [intercept](https://mobx.js.org/refguide/observe.html)

## Molecule Strategy

We showed you above how to do each individual, but we have a way that works with both, it's called [molecule](https://github.com/cult-of-coders/react-molecule/blob/master/docs/index.md):

```bash
meteor npm i -S react-molecule
```

To give you an idea how this works:

```js
import { Molecule } from 'react-molecule';

const store = observable({
  loggingIn: true
});

const AppMolecule = () => (
  <Molecule store={store}>
    <App />
  </Molecule>
);
```

Now your store is accessible at any level via `withMolecule` wrapper:

```jsx
const Item = withMolecule(
  ({ molecule }) => observable(() => (
    <div>Logged in: {molecule.store.loggedIn}</div>
  ))
)
```

The molecule also acts as an `Emitter` it actually uses `eventemitter3` and you can use it like that:

```jsx
molecule.emit(...)
molecule.on(...)
```

The advantage is that when you want to test functionality, you don't have to mock the global emitter. This is the strategy we recommend. 

Read more about `Molecule` as it's an important part of how we handle the frontend: https://github.com/cult-of-coders/react-molecule/blob/master/docs/index.md