# Ponyo

Ponyo is Expressen AB's new video player built with vanillaJS and Redux.
Depending on [hls.js](https://github.com/video-dev/hls.js/tree/master) and [Pulse Ad Player](http://pulse-sdks.ooyala.com/pulse-html5/latest/tutorial-ad_player.html)

## Ads

Ooyala is out ad service and we support pre- and post-roll and pause ads.

### Views

- Preview
- Play
- Pause
- Share
- Next countdown
- Related
- Replay
- Share
- Info

### Feature
- Postmessage, Iframe communication.
- Tracking, remove iframe dependency from [ExpressenAnalytics](https://github.com/ExpressenAB/analytics).
- Theming, DI, DN etc.
- Preview mode, thumbnail without heavy load.
- BE service providing DOM, CSS, and script
- Iframe mirroring todays embeding
- Autostart
- Play next video feed from [precis](https://github.com/ExpressenAB/precis).
- Sharing, integration with [shareizard](https://github.com/ExpressenAB/shareizard)
- Logging, better error detection

#### Wishlist
- History? remember what what is consumed?
- Klara? Can we make editor experiance better?
- EPI preview (remove old flash preview).

## Docker setup

At some point after starting the repo, but before it is built, the repo should
be setup to use docker.

```bash
ohoy container init

# Commit the generated files: docker-compose.yml, Dockerfile, .dockerignore
git add docker-compose.yml Dockerfile .dockerignore
git commit
```

## Local setup

```bash
$ npm install # install dependencies
$ npm test # run tests
$ npm install -g nodemon # install process monitor
$ nodemon # start server and restart on any file changes
```

## Utilities

Other expressen projects that you are advised to use:

https://github.com/ExpressenAB/ohoy - deployment tool
https://github.com/ExpressenAB/sidekick-containers - docker containers for external services

https://www.npmjs.com/package/exp-amqp-connection - for working with rabbitmq
https://www.npmjs.com/package/exp-fetch - for caching requests to external resources.
https://www.npmjs.com/package/exp-cachebuster - cache busting.
https://www.npmjs.com/package/exp-config - nice and easy conf mgmt.

## Branch strategy

Prefer development straight on the master branch. Make small isolated commits.
Never commit anything that breaks tests, they should work every commit so that
`git bisect` can be used if necessary.

For larger changes, or when you want feedback before committing to master, use
feature branches with [git flow][11]
inspired names such as `feature/add-cachebuster` or `spike/switch-to-iojs` and
make a pull request from [github][12].

## Testing strategy

Tests go in the `test` directory. All tests must be deterministic and fast.
Use [mocha][1] for unit style tests and follow the
naming/structure from the project. Unit tests for module `lib/foo.js` go in
`test/lib/fooTest.js`. Use [mocha-cakes-2][2]
for end to end tests and put them in `test/features`. Use [nock][5]
and [supertest][6] in the feature tests.

## Deploy

```bash
$ npm run deploy-staging
$ npm run deploy-production
```


# Common project structure

## root

```
## Directories
app/ - client code
lib/ - this is where the code is
config/ - configuration
docs/ - documentation in .md files
logs/ - logs for tests
node_modules/ - dependencies
public/ - client side resources
scripts/ - various executable bash/js-scripts for deploying, manual testing etc.
test/ - test code
tmp/ - everything in here is ignored, put your own one off experiments here

## Files
README.md - see below
nodemon.json - define nodemon config params like what to watch/ignore
package.json - define dependencies etc.
app.js - start the service in a single process
```

## app

```
app/
- containers/ - grouped functionallity
- helpers/ - utilities and helper functions
- middlewares/ - Redux middleware
- reducers.js - returns all reducers
- main.js - enter script
```

`containers/` are the seperation of state. Its directly related to combineReducers in reducers.js.

`helpers/` are where you put **commonly** used abstractions.

`middlewares/` is where you create your redux [middlewares](http://redux.js.org/docs/advanced/Middleware.html).

`reducers.js` will return all reducers in the containers.

`main.js` is the entry point of the client script

### container

```
- containers/
  - named-component/ - ie control-bar, social
    - components/ - folder for reusable components
    - actions.js - simplified functions that returns dispatchable objects
    - constants.js - self expanitory
    - index.js - export container so it accessible with a simpler import ie share.actions.like()
    - reducer.js - update state for this group
    - selectors.js - functions that van share state between containers
  - another-named-component/
    - ...
```

Container are the seperation of state. Its directly related to combineReducers in reducers.js.
The component depending on state[named-component] will be collected here.
Sharing data between containers will be done through functions from `selectors.js`.

`index.js` will export containers as an objects. This will make using them more  declarative `social.component.likedCount` or `store.dispatch(social.actions.likeVideo(id))`.

`actions.js` will return dispatchable objects like `store.dispatch(social.actions.likeVideo(id))`.

`constants.js` will handle namespace to make sure we don't have naming conflicts.
NAME will be used as a container reference and also namespace.
```
export const NAME = "social";

export const LIKE = `${NAME}/LIKE`;
export const UNLIKE = `${NAME}/UNLIKE`;
```
```
//reducers.js
import { combineReducers } from "redux";
import social from "./containers/social";

...

function reducers() {
  return combineReducers({
    [social.constants.NAME]: social.reducer,
    ....
  });
}


export default reducers;
```

`reducer.js` will export the container reducer.

`selectors.js` will contain functions to communicate data with other containers like `social.selectors.numberOfLikes()`. You can also use them in the container components for more declarative code and simple mutations.
```
import { numberOfLikesPerHour } from "path/selectors.js"
...
h1({}, state.title, span({className="like-flag"},`${numberOfLikesPerHour()} likes/h`))
```

### components

```
  - named-component/ - ie control-bar, social
    - components/ - folder for reusable components
      - index.js - export all components
      - play-button.js - returns DOM and handle events
      - play-button.styl - styles related to component
      - progress-bar.js - returns DOM and handle events
      - progress-bar.styl - styles related to component
    - actions.js
    ...
```
A component needs the store (state and dispatch) and will return return DOM nodes.
Here you also handle events related to the component.
You are not to subscribe to store here.

`index.js` code can be moved to parent index is container is small. Here you
choose what component to export. Components can still be used between them selfs.


# npm and package.json

npm is used as the task runner of choice for basic tasks. These are the standard tasks that all projects should have:

```bash
npm install # Installs dependencies and builds minified CSS/JS, etc.
npm test # Runs all tests
npm start # Runs the service locally
npm run deploy-<environment> # The number of environments may differ between projects
npm run ci # Does everything necessary for continuous integration testing
```

Minimize the need to run commands manually by bundling them in the scripts section of package.json:

Notes:

- prepublish runs on `npm install` and must return successful exit code even when only production dependencies are installed.

- The project's main file should be set in package.json's field "main". This will make the application easy to start with `node .` or `nodemon`.

- [eslint][3] should be used to verify that the code is well structured and looks nice. To make sure the code stays nice these tools are run on `npm test` (see scripts above).

- All tools used (above: [mocha][1], [eslint][3]) should be configured in such a way that they can be run manually when needed. Prefer checked in configuration files (for example `mocha.opts`) over specifying many command line arguments. When debugging a specific test case you should be able to run just [mocha][1] without any special arguments.

Avoid:

- relying on globally installed `npm` modules ([mocha][1], [eslint][3] etc.), include them in `package.json` as dependencies or dev dependencies instead. Put `node_modules/.bin` in your `PATH` to run the binaries manually!

# Configuration

Configuration is handled with [exp-config][8] via a mix of configuration files and environment variables. It reads configuration for the correct environment (controlled by the `NODE_ENV` environment variable).

Apart from reading the correct json file it will also read, if available, a file called `.env` in the project's root directory. In this file you can override entries in the config files. Here is an example .env file:

```shell
# Prod
apiUrl=http://ursula1.expressen.se
pufferBaseUrl=http://z.cdn-expressen.se/images

# Stage
#apiUrl=http://ursula.api.expressen.se
#pufferBaseUrl=http://exp-www-test7.bonnierdigitalservices.se/images

requestLogging=false
#dustjsViewCaching=true
toggle.ads=false
```

As you can see this file looks like a shell file setting environment variables. It can contain comments.

Environment variables have the highest priority: `requestLogging=true node .`

This setup makes it easy to run a service locally using production config and just override a selected few properties. This is very useful when doing performance testing etc. It keeps the need to introduce more and more environments in check.

# Shared code

If you have a piece of code that you feel would be useful to other teams, release it as a public npm module.
Most of our common code is fairly generic (logging, configuration, cacheBusting) and can be turned into real
open source modules.

# Testing

Tests are run using `npm test` which in turn runs tools that test the code and verify that it follows certain code conventions.

Test tools that we use:

- [mocha][1] - for running tests and formatting results
- [mocha-cakes-2][2] - BDD-plugin for mocha, use for full stack tests
- [eslint][3] - javascript static code & style analysis
- [nock][5] - http mocking
- [supertest][6] - http test framework
- [chai][7] - assertion library

Tests should be deterministic, fast and full stack. Static code analysis and code style is part of the tests.

To make the application possible to test with [supertest][6] you need to export the application from the main file:

```javascript
// In app.js
var express = require("express");
var app = express();

app.get(...) // Setup routes

modules.exports = app; // Expose app to tests

// Only listen if started, not if included
if (require.main === module) {
  app.listen(...)
}
```

Now the tests can include [supertest][6] to make requests to the application on a random port which avoids a port conflict if the application is already running:

```javascript
var request = require("supertest");
var app = require("../");

describe("/", function () {
  it("gives 200 OK", function (done) {
    request(app)
      .get("/")
      .expect(200, done);
  });
});
```

# Code style

When writing node code you don't need to work around browser quirks and you can use modern JavaScript features such as array.map, array.forEach etc.

We rely on [eslint][3] to detect certain errors such as unused variables, duplicate declaration etc. This means that you should not adapt your coding style because of hoisting. Declare variables when they are needed, not at the top of the scope.

To avoid calling a callback twice, always return the result of the callback. Since calling the callback with an error is done so much this should be done as a one-liner:

```javascript
function doStuff(id, callback) {
  database.find(id, function (err, data) {
    if (err) return callback(err);

    // do your thing...

    return callback(null, data);
  });
}
```

# Operations

Install and use the ohoy tool for operational tasks such as deploying, monitoring etc.

https://github.com/ExpressenAB/ohoy

[1]: http://visionmedia.github.io/mocha/
[2]: https://github.com/iensu/mocha-cakes-2
[3]: http://eslint.org/
[5]: https://github.com/pgte/nock
[6]: http://visionmedia.github.io/superagent/
[7]: http://chaijs.com/
[8]: https://github.com/ExpressenAB/exp-config
[10]: https://github.com/ExpressenAB/exp-asynccache
[11]: http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/
[12]: https://github.com/
[13]: https://github.com/nodejitsu/forever
