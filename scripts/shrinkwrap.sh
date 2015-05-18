#!/bin/bash

scripts=./scripts
tmp=./tmp/shrinkwrap
branch=$1
token=708001b9d94e1b489d2d0eff10c85974aee08ada
repo=node-starterapp
base=master

# cleanup tmp
rm -rf $tmp
mkdir -p $tmp

# If there is a shrinkwrap file already, move it or npm install will not be interesting
diffStatusCode=1
if [[ -f npm-shrinkwrap.json ]]; then
  echo "npm-shrinkwrap.json exists, cleaning to $tmp and removing"
  node $scripts/clean-json.js npm-shrinkwrap.json > $tmp/npm-shrinkwrap-current-clean.json
  rm npm-shrinkwrap.json
  diffStatusCode=0
fi

# Brute for npm install to really make sure we get the latest possible versions
if [[ -d node_modules ]]; then
  echo "node_modules directory exists, moving to $tmp"
  if [[ -d $tmp/node_modules ]]; then
    rm -r $tmp/node_modules
  fi
  mv node_modules $tmp/node_modules
fi

npm install --loglevel error
npm shrinkwrap --dev --loglevel error

# If a shrinkwrap file existed already, compare it to the one just created, cleaned
if [[ -f $tmp/npm-shrinkwrap-current-clean.json ]]; then
  node $scripts/clean-json.js npm-shrinkwrap.json > $tmp/npm-shrinkwrap-new-clean.json
  diff $tmp/npm-shrinkwrap-new-clean.json $tmp/npm-shrinkwrap-current-clean.json > /dev/null
  diffStatusCode=$?
fi

if [[ $diffStatusCode != 0 && $branch != "" && $branch != "master" ]]; then

  echo "Removing existing branch (if it exists), remote and local:" $branch
  git push origin --delete $branch || true
  git branch -d $branch || true

  echo "Creating branch:" $branch
  git checkout -b $branch
  git commit -am "npm-shrinkwrap.json updated"
  git push origin $branch
  curl -H "Authorization: token $token" -XPOST "https://api.github.com/repos/ExpressenAB/$repo/pulls" -d '{"title":"npm-shrinkwrap.json updated","head":"'$branch'","base":"'$base'"}'

fi

echo exiting with status $diffStatusCode
exit $diffStatusCode
