---
id: live-data
title: Live Data
permalink: docs/live-data.html
---

In this article we'll learn how to easily create reactive data on the server, and make our views react to changes that happen in the database.

---

Make sure you have the Apollo Live packages installed:

```bash
meteor npm i -S apollo-live-server apollo-live-client
```

Defining a reactive API looks like this:
```graphql
type Query {
  users: [User]
  user: User
}

type Subscription {
  users: SubscriptionEvent
  user: SubscriptionEvent
}
```

```js
// our Subscription resolvers
import { asyncIterator } from 'apollo-live-server';

const resolvers = {
  Query: {
    users(_, args, { db }) {
      return db.users.find().fetch();
    }
  }
  Subscription: {
    users: {
      resolve: payload => payload,
      subscribe(_, args, { db }) {
        const observer = db.users.find();

        return asyncIterator(observer);
      }
    }
  }
}
```

Find out more about how to customise it: https://www.npmjs.com/package/apollo-live-server

Our React components will look like this:
```jsx
import gql from 'graphql-tag';
import { ReactiveQuery } from 'apollo-live-client';

// We have the initial query fetcher
const GET_USERS = gql`
  query {
    users {
      _id
      profile {
        firstName
        lastName
      }
    }
  }
`;

// Then we follow changes
const SUBSCRIBE_USERS = gql`
  subscription {
    users {
      event
      doc
    }
  }
`;

const UsersListWithData = () => (
  <ReactiveQuery
    query={GET_USERS}
    subscription={SUBSCRIBE_USERS}
    variables={{}}
  >
    {({ data: { users }, loading, error }) => {
      if (loading) return <Loading />;
      if (error) return <Error error={error} />;

      console.log(users);

      return <UserList users={users} />;
    }}
  </ReactiveQuery>
);
```

Read more here: https://github.com/cult-of-coders/apollo-live-client

## Simulate reactivity

You could go inside the database, using a nice tool like [Robo 3T](https://robomongo.org/), or just emulate some reactivity in your code.

```js
// Simulate some reactivity ...
import { Accounts } from 'meteor/accounts-base';

Meteor.setInterval(function() {
  const userId = Accounts.createUser({
    username: 'Apollo is Live!',
  });

  Meteor.setTimeout(function() {
    Meteor.users.remove({ _id: userId });
  }, 500);
}, 2000);
```

You can even test it your query inside GraphQL Playground, to see how easily it reacts to changes:

```js
subscription {
  users {
    event
    doc
  }
}
```
