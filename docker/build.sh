#!/bin/bash -e

# Node.js 0.10 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:0.10
docker build -f Dockerfile.nodejs-10 -t exp-docker.repo.dex.nu/nodejs:0.10 .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.10 exp-docker.repo.dex.nu/nodejs:0.10.40
docker push exp-docker.repo.dex.nu/nodejs:0.10
docker push exp-docker.repo.dex.nu/nodejs:0.10.40

# Node.js 0.12 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:0.12
docker build -f Dockerfile.nodejs-12 -t exp-docker.repo.dex.nu/nodejs:0.12 .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.12 exp-docker.repo.dex.nu/nodejs:0.12.7
docker push exp-docker.repo.dex.nu/nodejs:0.12
docker push exp-docker.repo.dex.nu/nodejs:0.12.7

# Node.js 0.12 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:0.12-centos
docker build -f Dockerfile.nodejs-12-centos -t exp-docker.repo.dex.nu/nodejs:0.12-centos .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.12-centos exp-docker.repo.dex.nu/nodejs:0.12.7-centos
docker push exp-docker.repo.dex.nu/nodejs:0.12-centos
docker push exp-docker.repo.dex.nu/nodejs:0.12.7-centos
