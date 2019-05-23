---
id: event-driven-system
title: Event Driven System
permalink: docs/event-driven-system.html
---

As your application grows, your logic grows, instead of explicitly calling logic from a single place, dispatch an event, and let other pieces of code handle that event.

---

## The Problem

Let's start with the problem. Something happens in your system, like: you add a new item for sale.

When this happens you need to do:

- Notify people that may be interested in your sale
- Send an email to the Admin
- Charge the person 0.02$ for the fact he posted a new item for sale on your platform

So far so good, you know that you need to have units of logic (services) for this, so after some coding hours (or minutes!) you come up with these functions:

```js
notifyInterestedPeopleInSale(itemId);
notifyAdmins(itemId);
processCharging(itemId);
```

Now you go to your `ItemService` and have something like:

```js
static createItem(data) {
    const itemId = Items.insert(data);

    notifyInterestedPeopleInSale(itemId);
    notifyAdmins(itemId);
    processCharging(itemId);
}
```

And it seems that you are happy with this. It looks modular and decoupled. However it's not ok because:

- **It knows too much** about other services
- **It does too much**, it's purpose is to merely create an item, that's it.
- **It depends on too many modules**, if by any chance you decide to remove admin notifications you need to see wherever you use it and remove it.

Besides that, the name we have is not very verbose, what if we change it?

```js
// one way to desperate other developers
createPostAndNotifyAdminsAndInterestedPeopleInSaleThenProcessCharging(data);
```

## The Solution

Ok we can't work with something like that, name too long, and we break the single responsability principle.
Is there any hope for us in this? Can we have good code when we have a lot of functionality?

Ofcourse, let's rock and roll with the Observer pattern.
In code translation:

```js
// file: src/modules/core/events.js
import EventEmitter from 'events';

const Emitter = new EventEmitter();

const Events = {
  ITEM_CREATED: 'item_created',
};

export { Emitter, Events };
```

Now we need to say to the system that an item has been created:

```js
// some service file
import { Emitter, Events } from 'core/events';

function createItem(userId, data) {
  const itemId = Items.insert(data);

  Emitter.emit(Events.ITEM_CREATED, { itemId, userId });
}
```

Now, notifications and payment are two modules that aren't necessarily related, they don't really need to know about each other. This is why our listeners, should be close to their code:

```js
// file: /src/modules/notifications/listeners.js
import { Emitter, Events } from '/src/modules/events';

Emitter.on(Events.ITEM_CREATED, function({ itemId }) {
  notifyInterestedPeopleInSale(itemId);
  notifyAdmins(itemId);
});
```

```js
// file: /src/modules/payments/listeners.js
import { Emitter, Events } from '/src/modules/events';

Emitter.on(Events.ITEM_CREATED, function({ itemId }) {
  processCharging(itemId);
});
```

What do we exactly gain by using this strategy ?

- You can plug-in additional functionality by listening to events
- If item creation is done from multiple places, if you want to remove/add functionality you do it in one place
- It's easy to find what listeners you have if you respect the pattern, simply searching for `Events.ITEM_CREATED` in your project finds you everything you need (listeners, emitters)
- The code is independent and doesn't know about other functionality, which is the way it should be

Naming pattern: `MODEL_ACTION: 'model_action'`. Begin all your event names with the subject of interest, and if the event name also needs to contain the one who did an action, suffix it: `MODEL_ACTION_BY_ADMIN`

Be very careful with verb tenses, if it's present, then it's before the item creation, if it's past-tense it's after that action has been made:

```js
Emitter.emit(Events.ITEM_CREATE, { item });
const _id = Items.insert(item);
Emitter.emit(Events.ITEM_CREATED, { _id, item });
```

> Remember
>
> When we are doing non-related logic inside the service, just dispatch an event and hook in a listener. You are doing yourself a big favor!

## Event Params

When you emit an event, send an object as a single parameter, instead of multiple parameters or other types.
This gives verbosity to the code.

A common mistake is the fact that when you dispatch an event, you tend to send data, which would help the listener, especially if it's your first one.

For example, you want to withdraw some cash when an item is created, and you think as if you were calling a service

```js
Emitter.emit(Events.ITEM_CREATED, {
  userId,
  itemPrice,
});
```

However, this is a bad way of sending events, events should be dispatched with object or objectId of their interest and other data related to the Event itself.

> The rule
>
> When you dispatch events, imagine that you don't know about who is going to use them.

It's not bad to send the full item, it's up to you and your use-cases, I would prefer to send identificators and if you realise you're doing a lot of fetches, you can apply a pattern like [data-loader](https://github.com/graphql/dataloader) from Facebook.

## When to use

You can use them in most situations but I strongly recommend using them when:

- You have to create notifications of any kind (push, app, emails)
- You have a service that knows too much
- You want to have something easily pluggable and upluggable in your system

## Testing

Event listeners **must** delegate their job to services directly, they are proxies. Event Listeners should not contain any logic. Create unit-tests for services, and then you can run an integration test easily.

Just to make sure you understand:

```js
// listeners.js
EventEmitter.on(event, () => {
  PaymentProcessor.handleItemCreatedEvent(event);
})
```
