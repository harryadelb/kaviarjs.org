---
id: services
title: Services
permalink: docs/services.html
---

Services are the classes/functions that contain logic. They are responsible for applying the business logic.

---

Remember those resolvers for Query and Mutation? Well, the whole idea is to abstract the resolvers:

```js
// BAD
addPost(_, args, context) {
  // Here I have logic...
},
```

```js
// GOOD
import PostService from './services/PostService';

addPost(_, { post }, { userId }) {
  PostService.addPost(userId, post);
}
```

We do this to respect the good ol' SOLID standards, keeping things decoupled, so they can be re-used, easily identifiable, and tested.

## What is a service?

A service is a unit of work (a function) or a group of very related functionality (a class)

Let's say you create a Post, and you need to notify the Admin to approve it.
Where do you store that unit of logic? Inside a resolver? Inside a function? Inside a class?

The answer is: **NOT inside the resolvers**

Usually, you tend to couple logic in your resolver which is a very very bad terrible thing, because the resolver is a `Delegator` it should not know implementation details.

## Creating a service

By default we are going to put them inside:
`/src/modules/{module}/services`

If your services need more decoupling feel free to nest them:
`/src/modules/{module}/services/{submodule}`

Name your services with uppercase if classes (ItemService), or lowercase if functions (doSomething).
If your service is a class, suffix it with service, if it's a function, make the sure the filename is a verb.

Inside a function service module, you can create additional functions, but you must export only one, if you need to
export multiple functions, it will become a service class.

Definition
```js
// file: src/modules/{module}/services/ItemService.js
class ItemService {
  createItem(item) {
    // put logic here for item creation
  }

  updateItem(id, data) {
    const item = this._getItem(id);
    // do something with it
  }

  getItem(itemId) {
    // returns the item from database or throws an exception
  }
}

export default ItemService;
```

Instantiation
```js
// file: src/modules/{module}/services/index.js
import ItemServiceModel from './ItemService';

export const ItemService = new ItemServiceModel();
```

Usage
```js
// file: src/modules/{module}/index.js
import { ItemService } from './services';

load({
  typeDefs: '...',
  resolvers: {
    Mutation: {
      itemCreate(_, args, ctx) {
        ItemService.createItem(args.item);
      },
    },
  },
})
```

## Go API-first

Go API first. Don't try to think about the logic, try to think about how you are going to use it. This is why [**TDD**](https://technologyconversations.com/2013/12/20/test-driven-development-tdd-example-walkthrough/) works so well, because it lets you think about the API and you also write a test, and passing tests means you finished implementation.

So, instead of patterns, try to think about how you would use it, and just write a test for it first. You will notice that your development speed will increase dramatically (after first tries). No kidding!

Helpful questions when you are writing your service:

1. What would be the cleanest, easiest way to use this Service?
2. How can I make it so it's easier to understand by others?
3. What comments can I leave so the next developer that comes in understands this?
4. Does my service have a single responsability? If not, how can I decouple it?
5. Is there any functionality in my service that is outside its scope so I can decouple it?

## Services Exception

There are very rare ocassions, where you don't use a service inside your resolver, because your database collection already acts as a service:

```js
// GOOD, no need to abstract to a service
load({
  typeDefs: `
    type Query {
      postSingle(_id: String): Post
    }
  `,
  resolvers: {
    postSingle(_, { _id }, ctx) {
      return Posts.findOne(_id);
    }
  }
})
```

> However!
> 
> If you have custom logic, such as security checks, or filtering different fields for different users, you have to move it in its own Service, because it has to be testable.

## Dependency Injection

It's always a good idea that your service model does not depend on any imports:

```js
import PaymentService from 'somewhere';

class ItemService {
  constructor({ paymentService }) {
    this.paymentService = paymentService;
  }

  createItem(item) {
    Items.insert(item);
    this.paymentService.charge(item.userId, 20.0);
  }
}

export default ItemService;
```

This strategy makes it easy for us test the ItemService class without actually using a real `paymentService`, because we can pass-in a [stub](http://sinonjs.org/releases/v4.0.1/stubs/) for `PaymentService` in its constructor.


## Flow

As you may nave noticed already, if you look in the service where we inject PaymentService via constructor, and we would like to use it, we have no autocomplete, we don't know how the service looks like, it's bad. You can safely use flow:

```js
import PaymentService from 'somewhere';

class ItemService {
  paymentService: PaymentService;

  constructor({ paymentService }) {
    this.paymentService = paymentService;
  }
}
```

And afterwards you could setup a new type called injection to make sure you instantiate it properly.

```js
import PaymentService from 'somewhere';

type Inject = {
  paymentService: PaymentService;
}

class ItemService {
  paymentService: PaymentService;

  constructor(inject) {
    Object.assign(this, inject);
  }
}
```


