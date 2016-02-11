#!/bin/bash -e

docker pull alpine:3.3
docker pull centos:7

# Node.js 0.10 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:0.10 || true
docker build -f Dockerfile.nodejs-0.10 -t exp-docker.repo.dex.nu/nodejs:0.10 .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.10 exp-docker.repo.dex.nu/nodejs:0.10.42
docker push exp-docker.repo.dex.nu/nodejs:0.10
docker push exp-docker.repo.dex.nu/nodejs:0.10.42

# Node.js 0.12 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:0.12 || true
docker build -f Dockerfile.nodejs-0.12 -t exp-docker.repo.dex.nu/nodejs:0.12 .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.12 exp-docker.repo.dex.nu/nodejs:0.12.10
docker push exp-docker.repo.dex.nu/nodejs:0.12
docker push exp-docker.repo.dex.nu/nodejs:0.12.10

# Node.js 0.12 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:0.12-centos || true
docker build -f Dockerfile.nodejs-0.12-centos -t exp-docker.repo.dex.nu/nodejs:0.12-centos .
docker tag -f exp-docker.repo.dex.nu/nodejs:0.12-centos exp-docker.repo.dex.nu/nodejs:0.12.10-centos
docker push exp-docker.repo.dex.nu/nodejs:0.12-centos
docker push exp-docker.repo.dex.nu/nodejs:0.12.10-centos

# Node.js 4 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:4 || true
docker build -f Dockerfile.nodejs-4 -t exp-docker.repo.dex.nu/nodejs:4 .
docker tag -f exp-docker.repo.dex.nu/nodejs:4 exp-docker.repo.dex.nu/nodejs:4.3
docker tag -f exp-docker.repo.dex.nu/nodejs:4 exp-docker.repo.dex.nu/nodejs:4.3.0
docker push exp-docker.repo.dex.nu/nodejs:4
docker push exp-docker.repo.dex.nu/nodejs:4.3
docker push exp-docker.repo.dex.nu/nodejs:4.3.0

# Node.js 4 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:4-centos || true
docker build -f Dockerfile.nodejs-4-centos -t exp-docker.repo.dex.nu/nodejs:4-centos .
docker tag -f exp-docker.repo.dex.nu/nodejs:4-centos exp-docker.repo.dex.nu/nodejs:4.3-centos
docker tag -f exp-docker.repo.dex.nu/nodejs:4-centos exp-docker.repo.dex.nu/nodejs:4.3.0-centos
docker push exp-docker.repo.dex.nu/nodejs:4-centos
docker push exp-docker.repo.dex.nu/nodejs:4.3-centos
docker push exp-docker.repo.dex.nu/nodejs:4.3.0-centos

# Node.js 5 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:5 || true
docker build -f Dockerfile.nodejs-5 -t exp-docker.repo.dex.nu/nodejs:5 .
docker tag -f exp-docker.repo.dex.nu/nodejs:5 exp-docker.repo.dex.nu/nodejs:5.6
docker tag -f exp-docker.repo.dex.nu/nodejs:5 exp-docker.repo.dex.nu/nodejs:5.6.0
docker push exp-docker.repo.dex.nu/nodejs:5
docker push exp-docker.repo.dex.nu/nodejs:5.6
docker push exp-docker.repo.dex.nu/nodejs:5.6.0

# Node.js 5 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:5-centos || true
docker build -f Dockerfile.nodejs-5-centos -t exp-docker.repo.dex.nu/nodejs:5-centos .
docker tag -f exp-docker.repo.dex.nu/nodejs:5-centos exp-docker.repo.dex.nu/nodejs:5.6-centos
docker tag -f exp-docker.repo.dex.nu/nodejs:5-centos exp-docker.repo.dex.nu/nodejs:5.6.0-centos
docker push exp-docker.repo.dex.nu/nodejs:5-centos
docker push exp-docker.repo.dex.nu/nodejs:5.6-centos
docker push exp-docker.repo.dex.nu/nodejs:5.6.0-centos

