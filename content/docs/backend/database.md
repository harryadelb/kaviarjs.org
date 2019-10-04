---
id: database
title: Database
permalink: docs/database.html
---

Meteor comes bundled with its own MongoDB database, so everything is already setup.

---

## Mongo Collections

You can find the API here:
https://docs.meteor.com/api/collections.html#Mongo-Collection

But to put it bluntly, here is how you would use it:

```js
const cursor = MyCollection.find(mongoSelectors, { // mongoSelectors: https://docs.mongodb.com/manual/reference/operator/query/
  limit: 10, // useful for pagination, limits the results set
  skip: 0, // useful for pagination, skips the first results found
  fields: { // specify which fields to fetch
    field: 1,
    'nested.field': 1,
  }
  sort: {
    'createdAt': -1 // sorting by fields
  }
});

cursor.fetch() // returns the results
cursor.count() // return the total items

MyCollection.findOne(mongoSelectors, mongoOptions) // returns the first found object
MyCollection.insert(document);
MyCollection.update(mongoSelectors, modifier, {multi: true});
MyCollection.remove(modifier);

MyCollection.rawCollection() // returns the collection from npm mongodb driver module
```

We store our collections inside the `db` folder in our modules:
```js
// file: src/modules/core/db/todos/collection.js
import { Mongo } from 'meteor/mongo';

const Todos = new Mongo.Collection('todos');

export default Todos;

// Optionally add some demo data for you to play with:
Meteor.startup(() => {
  const count = Todos.find().count();
  if (count === 0) {
    for (let i = 0; i < 5; i++) {
      Todos.insert({
        title: `Todo - ${i}`,
      });
    }
  }
});
```

Now we nicely export it from our `db/index.js` file, for convenience:

```js
// file: src/modules/core/db/index.js
export { default as Todos } from './todos/collection';
```

### Types & Resolvers

```js
// file: src/modules/core/index.js
import Todos from './db/todos/collection';

load({
  typeDefs: `
    type Query {
      todos: [Todo]
    }

    type Todo {
      _id: ID!
      title: String!
    }
  `,
  resolvers: {
    Query: {
      todos() {
        return Todos.find().fetch();
      },
    },
  },
});
```

### Query

```js
query {
  todos {
    _id
    title
  }
}
```

Creating a Todo is simple!

```js
type Mutation {
  todoInsert(todo: TodoInsertInput!): String
}

type TodoInsertInput {
  title: String!
}
```

```js
{
  Mutation: {
    todoInsert(_, args) {
      const { todo } = args;
      Todos.insert(todo);
    }
  }
}
```

### GraphQL Playground

Query 

```js
mutation todoInsert($todo: TodoInsertInput!) {
  todoInsert(todo: $todo)
}
```

Variables

```js
  {
    "todo": {
      "title": "My custom Todo"
    }
  }
```

## Database via Context

Inside your resolver you have access to a god object `db` from which you can access all your created databases.

```js
{
  Query: {
    todos(_, args, context) {
      const { todos } = context.db; // todos representing the collection's name

      return todos.find().fetch();
    }
  }
}
```

## Relations

Relations are very important when you deal with your database. MongoDB has many advantages but it does not have full support
for relational data, however there is an extremely performant way of handling those relations leveraging the power of [Grapher](https://github.com/cult-of-coders/grapher)

You have two ways of working with relationships, doing them manually in resolvers like so:

```graphql
type BlogPost {
  userId: String
  user: User
}
```

```js
{
  BlogPost: {
    user(post) {
      return Users.findOne(post.userId);
    }
  }
}
```

The problem is that using this strategy it can become tedious to make it performant. If you work with a lot of relations in separate collections. It's much easier to do it through Grapher.

Grapher is meant to work with pure Meteor even without Apollo, thus having some additional functionalities we will not use in here, but the rest of the functionalities are a must to understand, especially [GraphQL Bridge](https://github.com/cult-of-coders/grapher/blob/master/docs/graphql.md)

We have 2 ways of defining relationships, first we'll explore the prototipish way of doing it via Schema Directives:

`@mongo` - Creates or re-uses an already existing `Mongo.Collection`
`@link` - Defines the links with other types
`@map` - Maps a value to the database value so Grapher can interogate properly

Let's say we have a Post and a Comment and each post and comment has an `userId` that refers to a certain User:

```graphql
type Comment @mongo(name: "comments") {
  _id: ID!
  text: String!

  userId: String!
  user: User @link(field: "userId")

  postId: String!
  post: Post @link(field: "commentId")
}

type Post @mongo(name: "posts") {
  _id: ID!
  title: String!
  isPublished: Boolean!
  createdAt: Date

  authorId: String
  author: User @link(field: "authorId")

  comments: [Comment] @link(to: "post") # the storage of the link (postId) is inside Comment collection, so we reference it
}

type User @mongo(name: "users") {
  _id: ID!
  name: String
  comments: [Comment] @link(to: "user")
  posts: [Post] @link(to: "author")
}
```

## Fetch Using Relational Grapher

You request the data in the same way, and Grapher takes care of transforming your Query into something meaningful to extract all your desired data.

```js
export default {
  typeDefs: `
    type Query {
      posts(filters: JSON, options: JSON): [Post]
    }
  `,
  resolvers: {
    Query: {
      posts(_, { filters, options }, { db }, ast) {
        // This transforms the GraphQL request into a Grapher request
        const query = db.posts.astToQuery(ast, {
          $filters: filters
          $options: options
        })

        return query.fetch()
      }
    }
  }
}
```

Now if you go to your GraphQL Playground you can do something like:

```graphql
query {
  posts {
    title
    author {
      name
    }
    comment {
      text
      user {
        name
      }
    }
  }
}
```

And relations not only are done automatically, [they are extremely performant](https://github.com/cult-of-coders/grapher/blob/master/docs/hypernova.md), and it will only interogate the database for the fields you need, not all fields.

With few lines of code you have an immense amount of power. However, as your app grows, and you need database consistency and maybe other extensions, it's a good idea to move the database definitions and links outside the types (No more schema directives)

## Reducers & Resolvers

If you do have resolvers that are not used for relations and they need certain fields, Grapher is smart enough to only fetch the fields you need from the database. You could try this approach from [Grapher Reducers](https://github.com/cult-of-coders/grapher/blob/master/docs/reducers.md)

```js
Collection.addReducers({
  [reducerName]: {
    body: graphDependencyBody, // Example: { firstName: 1, lastName: 1 }
    reduce() {
      return value; // can be anything, object, date, string, number, etc
    },
  },
});
```

The idea here is that all custom resolvers you have in your Type resolvers, like:

```js
{
  User: {
    fullname: (user) => `${user.firstName} ${user.lastName}`
  }
}
```

Have to be defined as reducers in Grapher. Because it's very performant and Grapher knows exactly which fields to query, like:

```js
// Just to clarify Users represents a Mongo.Collection instance
Users.addReducers({
  fullName: {
    body: {
      firstName: 1,
      lastName: 1
    },
    reduce(user) {
      return `${user.firstName} ${user.lastName}`;
    },
  },
})
```

## Define Grapher's Links

It can feel wrong that the way you define relationships is via type definitions. The problem is that these defs shouldn't really be that smart, they describe how the API looks like, not business logic, it can be helpful in the beginning because it looks magical and cool, but besides having certain limitations, it does not feel like the right place.

To do so you define a collection as it was explained in structure and you create the equivallent of the above like this:

```js
// src/{module}/db/posts/links.js

import { Posts, Comments, Users } from '../db';

Posts.addLinks({
  author: {
    type: 'one',
    field: 'authorId',
    collection: Users,
    index: true,
  },
  comments: {
    collection: Comments,
    inversedBy: 'post',
  },
});
```

```js
// src/{module}/db/comments/links.js

import { Posts, Comments, Users } from '../db';

Comments.addLinks({
  user: {
    type: 'one',
    field: 'userId',
    collection: Users,
    index: true,
  },
  post: {
    type: 'one',
    index: true,
    field: 'postId',
    collection: Posts,
  },
});
```

```js
// src/{module}/db/users/links.js
import { Posts, Comments, Users } from '../db';

Users.addLinks({
  comments: {
    collection: Comments,
    inversedBy: 'user',
  },
  posts: {
    collection: Posts,
    inversedBy: 'author',
  },
});
```

Links have to be added separately after all collections are loaded to avoid module self-referencing issues.

```js
// src/{module}/db/links.js
import './posts/links';
import './users/links';
import './comments/links';
```

```js
// src/{module}/db/index.js
export { ... } from '...';
import './links';
```

## Entities

Ok, so above we defined `Post`, `User`, `Comment` inside a single file. This is not maintainable, and it looks ugly. For this we want to introduce a new concept, called `Entity`, and we store them like this:

```js
// file: src/modules/core/entities/index.js
import './User';
import './Comment';
import './Post';
```

```js
// file: src/modules/core/entities/User/index.js
import { load } from 'graphql-load';

import typeDefs from './types.gql';
import resolvers from './resolvers';

load({ typeDefs, resolvers });
```

And ofcourse inside `types.gql` you define the `type User` and inside resolvers you export resolvers for User:
```js
// file: src/modules/core/entities/User/resolvers.js
export default {
  User: {
    fullName: (user) => `${user.firstname} ${user.lastname}`;
  }
}
```

If you have extensions such as `type UserProfile` it is ok to store it inside the same `types.gql` file.

### Flow

If you want to setup Flow for your Documents, we would do it in one big file.

```js
// file: src/modules/core/entities/{entity}/flow.js
export const type User = {
  firstName: string
  lastName: string
  fullName: string
}
```

```js
// When using it
import type { User } from 'core/entities/User/flow';

function chargeUser(user: User) {
  // ...
}
```


## Read more

- [Grapher Documentation](https://github.com/cult-of-coders/grapher)
- [Grapher's GraphQL Bridge](https://github.com/cult-of-coders/grapher/blob/master/docs/graphql.md)
- [Defining Relations in Types](https://github.com/cult-of-coders/grapher-schema-directives)
- [Collection Hooks](https://github.com/matb33/meteor-collection-hooks)
- [Collection Schema](https://github.com/aldeed/meteor-collection2)
- [Collection Behaviors](https://github.com/zimme/meteor-collection-behaviours)

## Exercises

1. Add parameter called `search` to the `todos` query that searches for todos that contain the title (case insensitive)
2. Extend the same todo query to allow pagination with pageSize, and pageNumber.
3. Add to the Todo input a `isChecked: Boolean`
