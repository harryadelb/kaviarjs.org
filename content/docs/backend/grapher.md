---
id: grapher
title: Grapher Server
permalink: docs/grapher-server.html
---

Grapher is a library that revolutionized MongoDB's relational capabilities. Empowering speeds [up to 200x](https://github.com/theodorDiaconu/grapher-performance/blob/master/TEST_RESULTS.md) when retrieving large relational trees.

---

## What is Grapher ?

GraphQL is about relationships and having Grapher as a driver between our application and the database to reliably get the data we need to consume, without worrying about performance. It was an important stepping stone we had to lay in order to build Kaviar.

Grapher provides a way to link MongoDB collections with each other. You have 2 ways of linking collections:

- One To One (`userId: String`) pointing to `Users` collection
- One To Many (`tagIds: [String]`) pointing to `Tags` collection

To translate it into code it looks like this:

```js
BlogPosts.addLinks({
  user: {
    field: 'userId',
    collection: Users
  },
  tags: {
    field: 'tagIds',
    type: 'many',
    collection: Tags
  }
})
```

Now if we would like to run a Grapher query it would look like this:

```js
BlogPosts.createQuery({
  title: 1,
  user: {
    fullName: 1
  },
  tags: {
    name
  }
}).fetch(); // or .fetchOne()
```

To perform filters and options, we have special $filters, $options operators:

```js
BlogPosts.createQuery({
  $filters: { _id: `blogPostId` },
  $options: {} // MongoDB Options
  title: 1,
  tags: {
    // Filters work deeply nested in collections too!
    $filters: { isAllowed: true }
  }
})
```

Learn more:
- [Linking Collections](https://github.com/cult-of-coders/grapher/blob/master/docs/linking_collections.md)
- [Reducers](https://github.com/cult-of-coders/grapher/blob/master/docs/reducers.md)
// ...


## GraphQL Bridge

astToQuery
astToFields

### Reducers & GraphQL Resolvers

If you want a smart interplay between GraphQL Type Resolvers and Grapher Reducers, this is the recommended strategy:

```js
// file: src/modules/core/entities/User/resolvers.js
export const UserReducers = {
  fullName: {
    body: { // These are the needed fields in order to resolve
      firstName: 1,
      lastName: 1
    },
    reduce(user) {
      return `${user.firstName} ${user.lastName}`;
    }
  }
}

export default {
  User: {
    fullName(user) {
      if (!user.fullName) {
        return UserReducers.fullName.reduce(user);
      }
    }
  }
}
```

And where you define your collection, make sure to add your reducers imported from the entity. This strategy allows us to use either GraphQL resolvers with or without Grapher.
