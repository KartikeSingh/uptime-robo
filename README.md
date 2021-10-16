# Installations
```
npm i uptime-robo
```

# What ?
An module to auto ping your websites / bots, so that they don't sleep.

# Why ?
- Easy to use
- Auto database setup
- customizable

# How ?

```js
// Importing for Node JS
const robot = require('uptime-robo').robot;

// Importing for TypeScript / vanilla JavaScript
import {robot} from 'uptime-robo';

const Robot = new robot();

// Add urls for sending auto pings
// Time is optional and it should be in milliseconds
const url = "http://localhost:3000";
const time = 10000;

Robot.add(url,time);

// Remove a url from auto pings
Robot.remove(url)
```

# Adding Mongo Database
```js
const Robot = new robot("your mongo URI");
// Everything else is same.
```

# Support
for support or issues or queries contace me on my [discord server](https://discord.gg/XYnMTQNTFh) or create a issue [here](https://github.com/KartikeSingh/uptime-robo/issues).