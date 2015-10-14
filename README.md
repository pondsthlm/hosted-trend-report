# Node Starter App

## Description

Fork this project when creating new Node.js projects. The goal of the project structure is:

- Any developer should be able to quickly understand the project, develop it and deploy it

Checking out the code and running `npm install && npm test` should take you most of the way.

## The correct way to start a new repo

- Create a repo on github (or ask someone with permissions to create it for you)
- `git clone git@github.com:ExpressenAB/<your-new-repo>.git`
- `cd <your-new-repo>`
- `git remote add starterapp git@github.com:ExpressenAB/node-starterapp.git`
- `git fetch starterapp`
- `git merge starterapp/master`

Now you have a project to start developing in!

## To get changes/files

To get changes or files from this repo do

```bash
git remote add starterapp git@github.com:ExpressenAB/node-starterapp.git
git fetch starterapp

# apply a commit
git cherry-pick <some-commit>

# get a file from the starterapp
git checkout starterapp -- <path-to-file>
```

## Local setup

```bash
$ npm install # install dependencies
$ npm test # run tests
$ npm install -g nodemon # install process monitor
$ nodemon # start server and restart on any file changes
```

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
`test/lib/fooTest.js`. Use [mocha-cakes][2]
for end to end tests and put them in `test/features`. Use [nock][5]
and [supertest][6] in the feature tests.

## Deploy

```bash
$ npm run deploy-staging
$ npm run deploy-production
```


# Common project structure

```
## Directories
app/ or lib/ - this is where the code is
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
cluster.js - start the service clustered
nodemon.json - define nodemon config params like what to watch/ignore
package.json - define dependencies etc.
server.js - start the service in a single process
```

### Readme

A `README.md` must be included and include:

- *Description*: Describe the service, what does it do?
- *Local setup*: How to get the application up and running locally (software to install, hosts-file/`$PATH` changes etc) and possibly information on how to develop/debug the application effectively
- *Branch strategy*: How to work with branches, pull requests, code review etc. in this project
- *Testing strategy*: What is tested and how? What kinds of tests exists. When introducing new functionality what new tests should be written?
- *Deploy*: How to deploy the application in the environments where it runs

## Clustering and cluster.js

To use all server processing power the service should run clustered in production.

The main file (`server.js` above) starts the service once but must be able to work when started multiple times on the same computer. This makes it easy to debug the service locally using the main file but run with high performance in production using the `cluster.js` file.

# npm and package.json

npm is used as the task runner of choice for basic tasks. These are the standard tasks that all projects should have:

```bash
npm install # Installs dependencies and builds minified CSS/JS, etc.
npm test # Runs all tests
npm start # Runs the service locally
npm run deploy-<environment> # The number of environments may differ between projects
npm run ci # Does everything necessary for continuous integration testing
npm run dev # Runs the service for development with watching/building/linting assets like stylus/js
```

Minimize the need to run commands manually by bundling them in the scripts section of package.json:

```json
{
  "scripts": {
    "test": "parallelshell 'mocha' 'npm run eslint' 'npm run stylint'",
    "test-cov": "istanbul cover --report lcov ./node_modules/.bin/_mocha",
    "watch": "parallelshell 'npm run watch:eslint' 'npm run watch:stylint' 'npm run watch:static' 'npm run watch:css' 'npm run watch:js' 'npm run nodemon'",
    "build": "npm run prebuild && parallelshell 'npm run build:static' 'npm run build:css' 'npm run build:js' 'npm run build:submodules' 'npm run build:vendor'",
    "prebuild": "rm -rf ./public && mkdir -p public/js public/css",
    "dev": "npm run build && npm run watch",
    "prepublish": "npm run revision && npm run build",
    "revision": "which git && [[ -d .git ]] && git rev-parse HEAD > config/_revision || true",
    "ci": "npm install && npm prune && npm ls && npm test",
    "deploy-epitest": "exp-deploy epitest",
    "deploy-epistage": "exp-deploy epistage",
    "deploy-livedata": "exp-deploy livedata",
    "deploy-production": "exp-deploy production",
    "predeploy-production": "exp-ensure-tests && exp-ensure-unmodified && exp-ensure-master",
    "build:static": "cpx \"./app/assets/{img,swf}/**/*\" public",
    "watch:static": "npm run build:static -- -w",
    "build:submodules": "cp ./submodule/**/dist/*.js public/js 2>/dev/null || :",
    "build:vendor": "cat ./app/assets/js/vendor/*.js > public/js/vendor.js 2>/dev/null || :",
    "build:css": "stylus ./app/assets/stylus/style.styl -c -m -u autoprefixer-stylus -o public/css/style.min.css",
    "watch:css": "stylus ./app/assets/stylus/style.styl --disable-cache -l -w -u autoprefixer-stylus -o public/css/style.css",
    "build:js": "browserify ./app/assets/js/bootstrap.js  -t uglifyify -o public/js/all.min.js",
    "watch:js": "watchify ./app/assets/js/bootstrap.js -o public/js/all.js -v",
    "nodemon": "nodemon",
    "eslint": "esw",
    "watch:eslint": "esw -w",
    "stylint": "stylint ./app/assets/stylus",
    "watch:stylint": "npm run stylint -- -w"
  }
}
```

Notes:

- prepublish runs on `npm install` and must return successful exit code even when only production dependencies are installed.

- The project's main file should be set in package.json's field "main". This will make the application easy to start with `node .` or `nodemon`.

- The tools [eslint][3], [stylint][4] should be used to verify that the code is well structured and looks nice. To make sure the code stays nice these tools are run on `npm test` (see scripts above).

- All tools used (above: [mocha][1], [eslint][3], [stylint][4]) should be configured in such a way that they can be run manually when needed. Prefer checked in configuration files (for example `mocha.opts`) over specifying many command line arguments. When debugging a specific test case you should be able to run just [mocha][1] without any special arguments.

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

This is a sore point in the current setup for which there are several alternatives each with their pros and cons:

1. Copy paste code (current situation): No hard dependencies between projects but lots of manual administration when code changes. Code can diverge into many branches which can be hard to maintain.
2. Extract common code to private npm modules: Requires us to either setup a private npm repository or buy such a service. Requires every environment to have special configuration to use the private npm repository. Npm modules can also be hosted in an S3-bucket with a secret url. This was done at Viaplay and it wasn't pretty.
3. Extract common code to public npm modules: Most of our common code is fairly generic (logging, configuration, cacheBusting) and could be turned into real open source modules. This is currently only used for [exp-asynccache][10]. This is the solution I believe is the nicest.

# Testing

Tests are run using `npm test` which in turn runs tools that test the code and verify that it follows certain code conventions.

Test tools that we use:

- [mocha][1] - for running tests and formatting results
- [mocha-cakes][2] - BDD-plugin for mocha, use for full stack tests
- [eslint][3] - javascript static code & style analysis
- [stylint][4] - stylus static code & style analysis
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

# Deploying

A [bash script](https://github.com/ExpressenAB/quiz/blob/master/scripts/deploy.sh) is used to deploy Node.js services in a [capistrano](http://capistranorb.com/) like fashion. It packages and uploads a release of the service, keeps all releases in a releases directory and selects the current release with a symlink.

[forever][13] is used to run the service which means it will restart on crashes and collect all output on stdout and stderr in a log file.

These are the pre-requisites for someone to deploy using `deploy.sh`:

- The server has been setup with [Triton][9] which contains server configuration for each service.
- Environment configuration stored in the config/ directory one json file per environment
- The deployer need to have password-less SSH access to the target servers as the `web` user
- Generated resources, such as minified CSS, must be generated at `npm install`, preferably by using a `prepublish` task in `package.json` scripts (see above)
- Necessary files must be included in the project package generated by `npm pack`. To avoid including irrelevant files, specify the resource roots in [package.json files field](https://github.com/ExpressenAB/ariel/blob/5c84bfa462558e4987c577b2ebe4484457b59085/package.json#L60). To avoid [an npm bug](https://github.com/npm/npm/issues/2619) be sure to include an empty `.npmignore` file in the project (remove this when npm bug fix is available on everyone's computers)
- The service must listen on the port from the environment variable PORT

NOTE: Some services still use an old, custom [grunt task](https://github.com/ExpressenAB/ariel/blob/master/tasks/deploy.js) for this. Don't do this in new projects. The grunt task has this additional prerequisite:

- A [config/deploy.json](https://github.com/ExpressenAB/ursula/blob/a6ec4ffea2eee2385132f56e50ef16857f855de4/config/deploy.json) file that specifies the available servers with information such as configuration file name, port etc.


# TODO

- npm test should detect which required software (redis, elasticsearch, mongodb etc) that is missing and clearly specify what's missing

## Repeatable Builds

### Summary

We use `npm shrinkwrap` to produce the `npm-shrinkwrap.json` file on a regular basis. We do this by having Jenkins run the script
`./scripts/shrinkwrap.sh` on some form of schedule (maybe once a night?)

This script compares the shrinkwrap file checked in, with one created from scratch. If they differ, the script will fail and Jenkins will report an error. If
the script was started with an argument (a branch name for a branch that will be committed to and pushed to github) if `npm-shrinkwrap.json` was updated. There
will also be a PR created for this branch which should contain only an update to `npm-shrinkwrap.json`.

The team is then responsible for accepting (or rejecting) the PR.

Run without the branch name argument, the script does everything except branching and issuing the PR.

### What about `package.json`?

This file will still need to be present. It contains the source of truth and should be modified when dependencies change (added, removed or version changes).
The `npm-shrinkwrap.json` will have to be updated accordingly though. I.e. if `package.json` changed (from a dependency perspective), it is highly unlikely that
the `npm-shrinkwrap.json` file will remain unchanged. Run the `./scripts/shrinkwrap.sh` file locally and check in the new version or run `npm shrinkwrap --dev`

### Jenkins

A suggested Jenkins job could be configured as follows.

```
source /home/jenkins/nvm/nvm.sh
nvm install
./scripts/shrinkwrap.sh master-shrinkwrapped
```

Maybe with a schedule like the following:

```
H H(0-3) * * *
```

which will run the job sometime between midnight and 03.00 every night.

[1]: http://visionmedia.github.io/mocha/
[2]: https://github.com/quangv/mocha-cakes
[3]: http://eslint.org/
[4]: https://rosspatton.github.io/stylint/
[5]: https://github.com/pgte/nock
[6]: http://visionmedia.github.io/superagent/
[7]: http://chaijs.com/
[8]: https://github.com/ExpressenAB/exp-config
[9]: https://github.com/ExpressenAB/triton
[10]: https://github.com/ExpressenAB/exp-asynccache
[11]: http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/
[12]: https://github.com/
[13]: https://github.com/nodejitsu/forever
