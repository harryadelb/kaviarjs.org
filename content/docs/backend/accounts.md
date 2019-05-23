---
id: accounts
title: Accounts
permalink: docs/accounts.html
---

In this article you'll learn how to quickly setup accounts, GraphQL types, Email strategies and, SSO and Security.

---

## Setting Up

Here we are going to add the core functionality of Meteor's accounts system, then we'll add the bridge to GraphQL using `cultofcoders:apollo-accounts`

```
meteor add accounts-password
meteor npm i -S bcrypt meteor-apollo-accounts
meteor add cultofcoders:apollo-accounts
```

First you create a new module `accounts`.

Create the entity `User`. This is how Meteor's default user schema looks like:

```js
type User {
  _id: ID!
  username: String
  email: String
  profile: UserProfile
  emails: [UserEmail]
  roles: [String]
}

type UserProfile {
  firstName: String
  lastName: String
}

type UserEmail {
  address: String
  verified: Boolean
}
```

```js
// file: src/modules/accounts/index.js
import { load } from 'graphql-load';

import { Accounts } from 'meteor/accounts-base';
import { initAccounts } from 'meteor/cultofcoders:apollo-accounts';

// Load all accounts related resolvers and type definitions into graphql-loader
const AccountsModule = initAccounts({
  loginWithFacebook: false,
  loginWithGoogle: false,
  loginWithLinkedIn: false,
  loginWithPassword: true,

  // This will be the schema allowed to create the user with a given `profile`
  CreateUserProfileInput: `
    firstName: String
    lastName: String
  `,

  overrideCreateUser: async (createUser, _, args, context) => {
    // You have the ability to override some default logic of user creation
    const { email, profile } = args;
    const response = await createUser(_, args, context);

    // If you do not want to automatically login the user,
    // Please make sure that you remove `token` and `tokenExpires`
    return response;
  },
});

load(AccountsModule);

// Read more:
// https://docs.meteor.com/api/accounts-multi.html#AccountsCommon-config
Accounts.config({
  sendVerificationEmail: true,

  // If you want to create a custom user creation and disallow the default one
  // By setting this to true, you have to write your own custom logic for createUser in a separate mutation
  // inside the overrideCreateUser option in `initAccounts`
  forbidClientAccountCreation: false,
});

Accounts.validateLoginAttempt(({ user }) => {
  // If you want for example to not allow logging in for suspended users
  // or users that don't have their email verified, just return false
  return true;
});

```

If you want to learn more about `initAccounts`, check the docs here:
https://github.com/cult-of-coders/meteor-apollo-accounts

## Usage

You can register an account like this:

```js
mutation {
  createUser(
    username: "cultofcoders",
    plainPassword: "12345",
  ) {
    token
  }
}
```

Now copy that token and inside `HTTP Headers` inside GraphQL Playground use:
`"meteor-login-token": THE_TOKEN_YOU_COPIED`, and that's how your resolvers know who is requesting data.

Your resolver function receives `root`, `args` and `context`. Inside `context` we store the current `userId` and `user`.

Now you can create a `me` query:

```js
// file: src/modules/accounts/main.js
// Make sure to import this file inside your index.js
import { load } from 'graphql-load';

load({
  typeDefs: `
    type Query {
      me: User
    }
  `,
  resolvers: {
    Query: {
      me(_, args, { db, userId, user }) {
        return db.users.findOne(userId, {
          fields: {
            profile: 1,
            emails: 1,
            username: 1,
            roles: 1,
          },
        });
      },
    },
  },
});
```


And try it out:

```graphql
query {
  me {
    _id
  }
}
```

You notice that we also inject the `user` object. We can customise which fields to fetch for the user at every request (be careful here as it can be dangerous)


```js
// file: src/startup/server/apollo.js
initialize({}, {
  // You can configure your default fields to fetch on each GraphQL request
  userFields: {
    _id: 1,
    roles: 1,
  }
}),
```

## Emails

In order to customise emails, we have to hook into the way Meteor's accounts handle the emails. By default if you don't have a `MAIL_URL` env variable set when starting the project, all emails will be shown in console.

```js
// file: src/modules/accounts/emails/index.js
import React from 'react';
import ReactDOM from 'react-dom/server';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import ResetPasswordEmail from './templates/ResetPassword';

Accounts.emailTemplates.siteName = 'Kaviar';
Accounts.emailTemplates.from = 'no-reply@kaviarjs.org';

Accounts.emailTemplates.resetPassword = {
  subject() {
    return `Reset Your Password`;
  },
  html(user, url) {
    const userEmail = user.emails[0].address;
    const urlWithoutHash = url.replace('#/', '');

    console.log('[Testing Purposes] Reset Password URL:', urlWithoutHash); // Remove this

    return ReactDOM.renderToString(
      <ResetPasswordEmail userEmail={userEmail} url={urlWithoutHash} />
    );
  },
};
```

Same principle for overriding email applies to email types: `enrollAccount` and `verifyEmail`. By default `verifyEmail` is sent when creating the user, however if you want to fully customise the createUser logic you will have to use either: [Accounts.sendEnrollmentEmail()](https://docs.meteor.com/api/passwords.html#Accounts-sendEnrollmentEmail) or [Accounts.sendVerificationEmail()](https://docs.meteor.com/api/passwords.html#Accounts-sendVerificationEmail)


## Fixtures

Create some dummy users to play with:

```js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

const PASSWORD = '12345';

function createUser(email, roles) {
  const userId = Accounts.createUser({
    email,
    password: PASSWORD,
    profile: {
      firstName: 'John',
      lastName: 'Smith',
    },
  });

  Roles.addUsersToRoles(userId, roles);
}

function loadFixtures() {
  // USERS
  createUser('user@app.com', ['CONSUMER']);
  createUser('user-1@app.com', ['CONSUMER']);
  createUser('user-2@app.com', ['CONSUMER']);
  createUser('admin@app.com', ['ADMIN']);
}

Meteor.startup(() => {
  // Meteor.users is actually a Mongo.Collection
  if (Meteor.users.find().count() === 0) {
    console.log(`Started loading user fixtures ...`);
    loadFixtures();

    console.log(`Created user@app.com : 12345`);
    console.log(`Created user-1@app.com : 12345`);
    console.log(`Created user-2@app.com : 12345`);
    console.log(`Created admin@app.com : 12345`);
  }
});
```

## Facebook & Google

# TODO:




## Read more

- [Apollo Accounts Documentation](https://github.com/cult-of-coders/meteor-apollo-accounts)
- [Authentication inside Meteor](https://docs.meteor.com/api/passwords.html)
- [Handling User Roles in Meteor](https://github.com/alanning/meteor-roles)




