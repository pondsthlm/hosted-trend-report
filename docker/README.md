# exp-container - Dockerized node apps #

## Description ##
This directory contains files for running node.js applications as Docker containers in a common (Expressen) way.

## Features ##
The exp-container setup adds a few "extra" for running docker containers:

- Varnish inline
  > The container may run a Varnish 4.0 inside using PM2 for process management. (See below for more info)
- Consul Template inside
  > The Consul Template package is installed. making it possible to do runtime configuration of applications from Consul
- Environment variables are used for configuration
- Service discovery. To add the container to the Consul service discovery, add environmnet variables when starting the container.

### Service discovery ###
To start the container with support for service discovery add SERVICE_NAME and SERVICE_TAGS to the docker supplied env vars, all production docker hosts runs a container namned gliderlabs/registrator which takes care of registering services:

 ```bash
docker run -d -p 80 \
    -e "SERVICE_NAME=node-starterapp" \
    -e "SERVICE_TAGS=production,exp-exporter" \
    -e NODE_ENV=production \
    -e ENABLE_VARNISH=true
    node-starterapp:latest
 ```

The above example will register the container in Consul as node-starterapp.service.exp.dex.nu, it will also be reachable at production.node-starterapp.service.exp.dex.nu.

### Varnish inline ###
The Varnish inline feature accepts a numer of environment variables (all with defaults):

```bash
ENABLE_VARNISH=${ENABLE_VARNISH:-false} # Set this to "true" to enable varnish inside the container
VARNISH_CONF=${VARNISH_CONF:-/src/docker/config/default.vcl} # The path inside the container to the vcl file
VARNISH_BACKEND_PORT=${VARNISH_BACKEND_PORT:-3000} # backend port, typically the port that the nodejs app listens on
VARNISH_BACKEND_IP=${VARNISH_BACKEND_IP:-127.0.0.1} # backend ip
VARNISH_PORT=${VARNISH_PORT:-80} # listen port for the varnish daemon.
```

Adding  -e ENABLE_VARNISH=true to the docker commandline will enable the varnish cache inside. If you intend to run Varnish inline consider running a consistent hash based loadbalancing setup.

## Getting started ##

### Adding the internal docker repo ###
Get an account on repo.dex.nu, then:

```bash
curl -u <user> https://devops-docker.repo.dex.nu/v2/auth > ~/.dockercfg
```

Check the .docker.cfg in your home directory, it should look something like:
```bash
$ cat ~/.dockercfg
{
  "https://devops-docker.repo.dex.nu" : {
    "auth" : "xxx",
    "email" : "xxx@xxx"
  }
}
```

#### Using the internal repo ####
```bash
$ docker tag 92e720e44953 devops-docker.repo.dex.nu/node-starterapp:latest
$ docker push devops-docker.repo.dex.nu/node-starterapp:latest
```

### Develop using Docker ###

First install boot2docker:
- Download the latest version from https://github.com/boot2docker/osx-installer/releases/latest
- Install the package
- Initialize the boot2docker environmnet:
```bash
$ boot2docker init
```
- add a new shared folder pointing to /Volumes/Data/${USER}/path/to/your/repos in the Virtual Box GUI, name it "src".
- start boot2docker:
```bash
$ boot2docker start && boot2docker shellinit
```

- Set environment variables for boot2docker:
```bash
$ eval "$(boot2docker shellinit)"
```


* boot2docker

### Deploying using Docker ###
* Helios json etc etc



