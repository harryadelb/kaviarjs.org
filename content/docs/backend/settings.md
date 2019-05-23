---
id: settings
title: Settings & Configuration
permalink: docs/settings.html
---

This describes where to store business logic and api keys

---

Since Meteor is our backbone, it's a good idea to learn about some of its core uses. This is where we store configuration that is different from environment to environment (dev, staging, production, etc): https://docs.meteor.com/api/core.html#Meteor-settings

Create a `settings.json` file:
```json
{
  "API_KEY": "..."
}
```

When we start our meteor project:
```bash
meteor run --settings settings.json
```

In order to use it:

```js
import { Meteor } from 'meteor/meteor';
const { API_KEY } = Meteor.settings;
```

## Email

By default Meteor reads the [MAIL_URL](https://docs.meteor.com/environment-variables.html#MAIL-URL) from env, but this can be annoying sometimes, we recommend storing it in settings:

```json
{
  "MAIL_URL": "..."
}
```

And inside `src/startup/server/index.js`:

```js
process.env.MAIL_URL = Meteor.settings.MAIL_URL;
```

## Business Logic

While `settings.json` can also be a good idea to store business logic, there are certain logic elements that don't change based on environment, for example, how many login attempts do we allow a user to have before we block him, what is the price for a certain subscription package. For this we recommend creating a `business.js` file:

```js
// file: src/modules/core/business.js
export default {
  SUBSCRIPTION_PACKAGE_PRICE: 50.99,
  ALLOWED_LOGIN_ATTEMPTS_BEFORE_LOCKING: 3,
  ...
}
```

```js
import Business from 'core/business';
// use it
```

## Collection

```js

```