---
id: deployment-and-apm
title: Deployment & APM
permalink: docs/deployment-and-apm.html
---

In this topic we'll learn how to monitor our application, query times, errors and also deploy it

---

## APM

For application monitoring, we are going to use [Apollo Engine](https://engine.apollographql.com/). Create an account and project, and once you get the API_KEY, you can safely use it:

```js
// file: src/startup/server/index.js
initialize({
  engine: {
    apiKey: 'service:theodorDiaconu-9705:X0r-FTxJra75Wuk-Ov2Ovw',
  },
})
```

For more `engine` options [look here](https://www.apollographql.com/docs/apollo-server/api/apollo-server#enginereportingoptions)

> Tip!
>
> It'll be a good idea to store `ENGINE_API_KEY` inside the `settings.json` file, and use it here.

## Deployment

We recommend you store deployment options inside `.deploy` folder in your project. And make sure to add a propper `.gitignore` that would ignore things such as PEM Keys, Production Settings, and be sure to never commit them.

We have the following ways to deploy with Meteor:

- [PM2 Meteor](https://github.com/andruschka/pm2-meteor) - Recommended way for single server deployment (scalable)
- [MUP](https://github.com/zodern/meteor-up) - Recommended way from containerized via docker deployments
- [AWS Beanstalk Deployment](https://github.com/zodern/mup-aws-beanstalk) - Autoscaling solution using Mup & AWS
- [Google Cloud App Engine](https://github.com/EducationLink/meteor-google-cloud) 


## Deployment with PM2

Our favorite way of quickly deploying is using `pm2-meteor` because it's very simple and straight forward:

You can setup your server on AWS or DigitalOcean. We recommend you use `Ubuntu 16.04` to quickly deploy without hassles.

We have the ability to quickly deploy our apps. One of the easiest way to do it, is to use `pm2-meteor`:

```
npm i -g pm2-meteor
```

Now go to your project root:

```
mkdir -p .deploy/qa
cd .deploy/qa
pm2-meteor init
```

Answer all the questions asked by pm2-meteor.

## Setting up the server

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```

Run a new shell so it can recognise `nvm`, sometimes it doesn't:

```
bash
```

Install the node version

```
nvm i 8.15.1
npm i -g pm2
```

Setup links because `pm2-meteor` might complain:

```bash
sudo ln -s `which node` /usr/bin/node
sudo ln -s `which npm` /usr/bin/npm
sudo ln -s `which pm2` /usr/bin/pm2
```

Install MongoDB:
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

Quicker:

```bash
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org --allow-unauthenticated
sudo service mongod start
```

Deploy:

```bash
cd .deploy/qa
pm2-meteor deploy
```

If you have a multi-core server with 4 processors you can quickly scale like this:

```bash
pm2-meteor scale 4
```

Setup deployment script:

```js
{
  "scripts": {
    "deploy:qa": "cd .deploy/qa && pm2-meteor deploy"
  }
}
```