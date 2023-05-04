approot [![NPM version][npm-image]][npm-url] [![Build Status][ci-image]][ci-url] [![Dependency Status][depstat-image]][depstat-url]
================

> An utility to build path based on a base path. Useful in node.js application, such as web app server.
> Recommend to instantiate an `approot` in global namespace, to provide an specific reference path across all files in the project

## Install

Install using [npm][npm-url].

    $ npm install approot

## Usage

Suppose the code is located in `/var/application`
```javascript
// build approot based on __dirname, and __dirname is /var/application
var approot = require('approot')(__dirname);

```

**HINT:** It is recommended to expose `approot` in global, which will be helpful to share the path across the whole javascript files.
```javascript
global.approot = require('approot')(__dirname);
```

### Basic Usage

```javascript
approot()                         // return /var/application
approot('models')                 // return /var/application/models
approot('models', 'user.js')      // return /var/application/models/user.js

```
### Consolidate

`consolidate` can inject sub-directories automatically, which is still a `approot` function.

```javascript
approot.consolidate();            // Scan then inject all subdirectories automatically
approot.models()                  // return /var/application/models, exists after consolidate is called
approot.models('user.js')         // return /var/application/models/user.js

```

**HINT:** since `consolidate` method return the `approot` itself, so you can use in this way:

```javascript
var approot = require('approot')(__dirname).consolidate();
```

### Consolidate with arguments
`consolidate` with arguments will extend generate `approot` instance as argument **regardeless** the file system.
Due to this nature, it can be used in browser environment.

```javascript
var rootPath = '/'
var approot;

approot = require('approot')(rootPath);
approot()                         // return '/'

approot = require('approot')(rootPath).consolidate('models');
approot.models()                  // return '/models'

approot = require('approot')(rootPath).consolidate(['models', 'routes']);
approot.models()                  // return '/models'
approot.routes()                  // return '/routes'

approot = require('approot')(rootPath).consolidate({models: true, routes: 'admin', assets: ['js', 'css'], config: { credential: 'secret' }});
approot.models()                  // return '/models'
approot.routes()                  // return '/routes'
approot.routes.admin()            // return '/routes/admin'
approot.assets()                  // return '/routes/assets'
approot.assets.js()               // return '/routes/assets/js'
approot.assets.css()              // return '/routes/assets/css'
approot.config()                  // return '/routes/config'
approot.config.credential()       // return '/routes/config/credential'
approot.config.credential.secret()// return '/routes/config/credential/secret'
```

### List Children

```javascript
approot.listChildren()                  // list all files and folders in current folder
approot.listChildren('sub', 'grandsub') // list all files and folders in './sub/grandsub'

```

### Relative Require

`require` method is a syntactic sugar that make `require` a little bit easier

```javascript
// suppose approot is create somewhere before
var User = approot.models.require('user'); // Equivalent to "require(approot.models('user'))"
```

### Browser Support

`approot` can be used in bowser with the help of [Browserify] or [Webpack]. But there are some limitations due to lack of `fs` API support.

When used in browser, `approot` cannot scan file system automatically, so the API behavior changes in following circumstances:

* Use `consolidate` **without arguments** does not scan the file system automatically, it just return itself. Use `consolidate` with **arguments** instead.
* `listChildren` **always** returns a empty array

## Used with [lazily-require]

When used in conjunction of [lazily-require] to initialize the application environment.

```javascript
// initEnv.js
var lazy = require('lazily-require');

// suppose __dirname is /var/application
global.appRoot = require('approot')(__dirname).consolidate(); // expose the approot to global and consolidate first-layer directories

global.configuration = require(appRoot.config('configuration'));

global.Services = lazy appRoot.services();
global.Routes = lazy appRoot.routes();
global.Records = lazy appRoot.records();
global.Models = lazy appRoot.models();
global.Entities = lazy appRoot.entities();

// a differnt javascript file
var User = Models.User; // var User = require('/var/application/models/User');
```

## License
MIT

[![NPM downloads][npm-downloads]][npm-url]

[homepage]: https://github.com/timnew/approot

[npm-url]: https://npmjs.org/package/approot
[npm-image]: http://img.shields.io/npm/v/approot.svg?style=flat
[npm-downloads]: http://img.shields.io/npm/dm/approot.svg?style=flat

[ci-url]: https://drone.io/github.com/timnew/approot/latest
[ci-image]: https://drone.io/github.com/timnew/approot/status.png

[depstat-url]: https://gemnasium.com/timnew/approot
[depstat-image]: http://img.shields.io/gemnasium/timnew/approot.svg?style=flat

[lazily-require]: https://github.com/timnew/lazily-require
[Browserify]: http://browserify.org/
[Webpack]: http://webpack.github.io/
