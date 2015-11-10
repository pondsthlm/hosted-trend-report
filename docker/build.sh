#!/bin/bash -e

# Node.js 0.10 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:0.10 || true
docker build -f Dockerfile.nodejs-0.10 -t exp-docker.repo.dex.nu/nodejs:0.10 .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.10 exp-docker.repo.dex.nu/nodejs:0.10.40
docker push exp-docker.repo.dex.nu/nodejs:0.10
docker push exp-docker.repo.dex.nu/nodejs:0.10.40

# Node.js 0.12 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:0.12 || true
docker build -f Dockerfile.nodejs-0.12 -t exp-docker.repo.dex.nu/nodejs:0.12 .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.12 exp-docker.repo.dex.nu/nodejs:0.12.7
docker push exp-docker.repo.dex.nu/nodejs:0.12
docker push exp-docker.repo.dex.nu/nodejs:0.12.7

# Node.js 0.12 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:0.12-centos || true
docker build -f Dockerfile.nodejs-0.12-centos -t exp-docker.repo.dex.nu/nodejs:0.12-centos .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.12-centos exp-docker.repo.dex.nu/nodejs:0.12.7-centos
docker push exp-docker.repo.dex.nu/nodejs:0.12-centos
docker push exp-docker.repo.dex.nu/nodejs:0.12.7-centos

# Node.js 4 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:4 || true
docker build -f Dockerfile.nodejs-4 -t exp-docker.repo.dex.nu/nodejs:4 .
docker tag -f exp-docker.repo.dex.nu/nodejs:4 exp-docker.repo.dex.nu/nodejs:4.2
docker tag -f exp-docker.repo.dex.nu/nodejs:4 exp-docker.repo.dex.nu/nodejs:4.2.1
docker push exp-docker.repo.dex.nu/nodejs:4
docker push exp-docker.repo.dex.nu/nodejs:4.2
docker push exp-docker.repo.dex.nu/nodejs:4.2.1

# Node.js 4 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:4-centos || true
docker build -f Dockerfile.nodejs-4-centos -t exp-docker.repo.dex.nu/nodejs:4-centos .
docker tag -f exp-docker.repo.dex.nu/nodejs:4-centos exp-docker.repo.dex.nu/nodejs:4.2-centos
docker tag -f exp-docker.repo.dex.nu/nodejs:4-centos exp-docker.repo.dex.nu/nodejs:4.2.1-centos
docker push exp-docker.repo.dex.nu/nodejs:4-centos
docker push exp-docker.repo.dex.nu/nodejs:4.2-centos
docker push exp-docker.repo.dex.nu/nodejs:4.2.1-centos
