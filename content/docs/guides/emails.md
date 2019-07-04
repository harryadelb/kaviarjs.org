---
id: emails
title: Emails
permalink: docs/emails.html
---

How to send emails written in React.

---

We are using [Email](https://docs.meteor.com/api/email.html) from Meteor, it works by setting a `MAIL_URL` environment variable. But we can have a strategy of keeping it inside `settings.json` like this:

```json
{
  MAIL_URL: "smtp://{email}:{password}@{host}:587"
}
```

```bash
meteor add email
```


And when we create our new module `emails`:

```js
// file: src/modules/emails/index.js
import { Meteor } from 'meteor/meteor';

process.env.MAIL_URL = Meteor.settings.MAIL_URL;
```

We want emails to:
- Be able to be found easily in a centralized place. It's very important that they are not spread all over the app so we have control over them.
- Be able to have a nice layout for everyone of them
- Be easy to develop and easy to maintain

So, if we want to keep them centralized, it's clear that we must use [Events](/docs/event-driven-system). Therefore,
whenever we want to send an email we need to dispatch an event.

So we want to create a service that sends an email based on a React template. Let's see how it would look like:

```js
// file: src/modules/emails/send.js
import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactDOM from 'react-dom/server';

const debug = Meteor.isDevelopment;
// const debug = false;

export default function (mailConfig, Component, props) {
  const element = React.createElement(Component, props);
  
  let options = Object.assign({}, {
    from: 'notifications@app.com',
    html: ReactDOM.renderToString(element)
  }, mailConfig);

  if (debug) {
    console.log(options);
  } else {
    // When sending via SMTP it can take a while, and we don't want to block the response
    // Using Meteor.defer() basically we execute this function async
    Meteor.defer(() => {
      Email.send(options);
    })
  }
}
```

Here is how it would look in a real-life scenario:

```jsx
// file: src/modules/emails/templates/NewItemCreated.jsx
import React from 'react';
import PropTypes from 'prop-types';

const NewItem = ({item}) {
  return (
    <div>{item.title}</div>
  )
}

NewItem.propTypes = {
  item: PropTypes.object,
};

export default NewItem;
```

And to actually send it:

```js
// file: src/modules/emails/listeners.js
import send from './send';
import { Items } from 'core/db';
import { Emitter, Events } from 'core/events';

import ItemNewEmail from './templates/NewItemCreated.jsx'

Emitter.on(Events.ITEM_NEW, function ({itemId}) {
  const item = Items.findOne(itemId);
  
  send({
    to: 'rick.astley@never-gonna-give-you-up.com',
    subject: 'Never gonna let you down!'
  }, ItemNewEmail, { item })
});
```

Now if you want to create a layout enveloping your template it's quite easy, you would do something like:

```js
// file: src/modules/emails/templates/layouts/index.js
export const Layout = function({children, header}) {
  return (
    <table>
      <tbody>
        <tr>
          <td>{headerText}</td>
        </tr>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  )
}
```

And because we want to keep the send email as flexible as possible we will use the layout inside our templates:

```js
import { Layout } from './layouts';

const ItemNewEmail = ({ item }) {
  return (
    <Layout headerText={'You received a new item'}>
        This is your new item: <strong>{item.title}</strong>
    </Layout>
  );
}
```

Both `Layout` and `ItemNewEmail` can change in anyway you like, depending on your context. 

> Note
>
> You can have multiple layouts, or no layout, it's up to the email template to decide.


