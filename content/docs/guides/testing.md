---
id: testing
title: Testing & CI
permalink: docs/testing-and-ci.html
---

Testing is the art that the programmer learns in order to write the code faster, cleaner, and make sure it will not collapse into a dark abyss later on.

---

Some programmers think that writing tests is a waste of time, or they think that it slows you down. On the contrary, whenever you are writing backend logic, it's much faster (after you get the hang of it) to write a backend test, rather than manually testing with your frontend, and especially when you're dealing with complex logic, there's no way your human mind can comprehend the deep implications that changing a simple `if` may have, we humans are limited, this is why we need testing. Case closed.

We discussed in our [Services](/docs/services.html) chapter about injecting dependencies into our services to allow it to be nicely tested. Here we'll explore how to do exactly that.

```bash
meteor add hubroedu:mocha meteortesting:mocha
metoer npm i --save-dev chai
```

We create files that end with `.test.js` they will be automatically loaded. And they have to be put in either `server` or `client` folder, depending where we want to run them. If we don't do that, they will be executed in both environments.

```js
// file: src/modules/core/services/ItemService.js
class ItemService {
  constructor({ itemsCollection }) {
    this.itemsCollection = itemsCollection;
  }

  createItem(item) {
    return this.itemsCollection.insert(item);
  }
}
```

```js
// file: src/modules/core/services/__tests__/server/ItemService.test.js
import ItemServiceModel from '../../ItemService';
import { Items } from 'core/db';
import { assert } from 'chai';

describe('ItemService', function () {
  it('Should create an item', function () {
    const service = new ItemServiceModel({
      itemsCollection: Items
    });

    const itemId = service.createItem({
      title: 'My new item'
    });

    assert.isObject(Items.findOne(itemId));
  }
});
```

### Viewing Test Results in UI

Now to run our tests, let's first add a script inside our `package.json`:

```json
{
  "scripts": {
    "test-ui": "meteor test --driver-package hubroedu:mocha --port 3200"
  }
}
```

```bash
meteor npm run test-ui
```

Now open your interface: http://localhost:3200 you will see your tests running. Tests, and groups are clickable if you only want to run specific tests.

### Viewing Test Results in Console

Let's go again to our `package.json`:

```json
{
  "scripts": {    
    "test-console": "TEST_WATCH=1 meteor test --driver-package meteortesting:mocha --port 3200",
    "test-console-headless": "TEST_WATCH=1 TEST_BROWSER_DRIVER=chrome meteor test --driver-package meteortesting:mocha --port 3200",
  }
}
```

`test-console` will work fine, it will show in your console the results for `server`, and on http://localhost:3200 the results for frontend, but there's a problem. If we want our script to also display the frontend tests in console, then we need the `headless` chrome driver. And for it you have to install two very heavy packages, it's not recommended, because this will slow down development and bundling process. 

```bash
meteor npm i --save-dev selenium-webdriver@3.6.0 chromedriver@2.36.0
```

So what can we do? Well, viewing results with our recommended `hubroedu:mocha` package is more comfortable, but when we want our `CI` to execute our tests, we'll install those npm packages right before.

## Setup CI

You can use any `CI` tool you like, the main concepts are these:

- Make sure you have Node v8 installed
- Make sure you have Meteor installed
- Install the dependencies for headless testing
- Run the `test-console-headless` script

Example of `.travis.yml` file:

```yaml
sudo: required
language: node_js

addons:
  chrome: stable

node_js:
  - "8.11.4"

cache:
  directories:
    - $HOME/.meteor
    - $HOME/.npm
    - node_modules

before_install:
  # Download Meteor - Keep in mind that you need
  # to remove your travis cache to get meteor updates
  - export PATH="$HOME/.meteor:$PATH"
  - curl https://install.meteor.com/?release=1.8.1 | /bin/sh

  # Install dependencies
  - npm install -g selenium-webdriver@3.6.0 chromedriver@2.36.0

before_script:
  - "export DISPLAY=:99.0"
  - "sh -e /etc/init.d/xvfb start"

script:
  - meteor npm install
  - meteor npm run test-console-headless
```

## Coverage

If you are looking to integrate code coverage you will find all resources here: https://github.com/serut/meteor-coverage
