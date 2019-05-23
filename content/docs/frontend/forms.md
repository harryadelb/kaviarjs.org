---
id: frontend-forms
title: Forms
permalink: docs/frontend-forms.html
---

For handling forms we recommend using: [Uniforms](https://vazco.github.io/uniforms/docs/installation).

---

One of the reasons for choosing Uniforms is the fact that it blends with `SimpleSchema` the same schema we use on the backend
for enforcing a collection's shape. 

Another reason for it is that you have validation and form generation in one place, so when you're building your web app that needs to look professional enough but just get the job done, you'll setup your schema with propper validation, and generate the form based on your schema, then on the backend validate the data with the same schema.

```bash
meteor npm i -S uniforms uniforms-bridge-simple-schema-2 uniforms-unstyled simpl-schema
```

To illustrate how simple it is:

```js
// file: src/client/pages/MyForm/index.js
import React from 'react';
import SimpleSchema from 'simpl-schema';
import { AutoForm } from 'uniforms-antd';

const Schema = new SimpleSchema({
  firstName: String,
  lastName: String
});

const MyForm = ({ client }) => 
  <AutoForm 
    schema={Schema}
    onSubmit={(data) => {/* do something */}}
  />
```

## Custom Field

Creating a custom field is very easy:

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectField } from 'uniforms';

class MyFieldBare extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    label: PropTypes.string,
    name: PropTypes.string,
  };

  render() {
    const { onChange } = this.props;

    return (
      <Something onChange={v => onChange(v)} />
    );
  }
}

const MyField = connectField(MyFieldBare);

export default FileField;
```

Using it is either directly in the form via `<MyField name="something">` either in the `SimpleSchema`:

```js
new SimpleSchema({
  firstName: String,
  something: {
    type: String,
    uniforms: {
      component: MyField
    }
  }
})
```