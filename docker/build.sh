#!/bin/bash -e

docker pull alpine:3.3
docker pull centos:7

# Node.js 0.10 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:0.10 || true
docker build -f Dockerfile.nodejs-0.10 -t exp-docker.repo.dex.nu/nodejs:0.10 .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:0.10 -c "node --version | grep v0.10.42"
docker tag -f exp-docker.repo.dex.nu/nodejs:0.10 exp-docker.repo.dex.nu/nodejs:0.10.42
docker push exp-docker.repo.dex.nu/nodejs:0.10
docker push exp-docker.repo.dex.nu/nodejs:0.10.42

# Node.js 0.12 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:0.12 || true
docker build -f Dockerfile.nodejs-0.12 -t exp-docker.repo.dex.nu/nodejs:0.12 .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:0.12 -c "node --version | grep v0.12.10"
docker tag -f exp-docker.repo.dex.nu/nodejs:0.12 exp-docker.repo.dex.nu/nodejs:0.12.10
docker push exp-docker.repo.dex.nu/nodejs:0.12
docker push exp-docker.repo.dex.nu/nodejs:0.12.10

# Node.js 0.12 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:0.12-centos || true
docker build -f Dockerfile.nodejs-0.12-centos -t exp-docker.repo.dex.nu/nodejs:0.12-centos .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:0.12-centos -c "node --version | grep v0.12.10"
docker tag -f exp-docker.repo.dex.nu/nodejs:0.12-centos exp-docker.repo.dex.nu/nodejs:0.12.10-centos
docker push exp-docker.repo.dex.nu/nodejs:0.12-centos
docker push exp-docker.repo.dex.nu/nodejs:0.12.10-centos

# Node.js 4 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:4 || true
docker build -f Dockerfile.nodejs-4 -t exp-docker.repo.dex.nu/nodejs:4 .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:4 -c "node --version | grep v4.4.0"
docker tag -f exp-docker.repo.dex.nu/nodejs:4 exp-docker.repo.dex.nu/nodejs:4.4
docker tag -f exp-docker.repo.dex.nu/nodejs:4 exp-docker.repo.dex.nu/nodejs:4.4.0
docker push exp-docker.repo.dex.nu/nodejs:4
docker push exp-docker.repo.dex.nu/nodejs:4.4
docker push exp-docker.repo.dex.nu/nodejs:4.4.0

# Node.js 4 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:4-centos || true
docker build -f Dockerfile.nodejs-4-centos -t exp-docker.repo.dex.nu/nodejs:4-centos .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:4-centos -c "node --version | grep v4.4.0"
docker tag -f exp-docker.repo.dex.nu/nodejs:4-centos exp-docker.repo.dex.nu/nodejs:4.4-centos
docker tag -f exp-docker.repo.dex.nu/nodejs:4-centos exp-docker.repo.dex.nu/nodejs:4.4.0-centos
docker push exp-docker.repo.dex.nu/nodejs:4-centos
docker push exp-docker.repo.dex.nu/nodejs:4.4-centos
docker push exp-docker.repo.dex.nu/nodejs:4.4.0-centos

# Node.js 5 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:5 || true
docker build -f Dockerfile.nodejs-5 -t exp-docker.repo.dex.nu/nodejs:5 .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:5 -c "node --version | grep v5.9.0"
docker tag -f exp-docker.repo.dex.nu/nodejs:5 exp-docker.repo.dex.nu/nodejs:5.9
docker tag -f exp-docker.repo.dex.nu/nodejs:5 exp-docker.repo.dex.nu/nodejs:5.9.0
docker push exp-docker.repo.dex.nu/nodejs:5
docker push exp-docker.repo.dex.nu/nodejs:5.9
docker push exp-docker.repo.dex.nu/nodejs:5.9.0

# Node.js 5 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:5-centos || true
docker build -f Dockerfile.nodejs-5-centos -t exp-docker.repo.dex.nu/nodejs:5-centos .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:5-centos -c "node --version | grep v5.9.0"
docker tag -f exp-docker.repo.dex.nu/nodejs:5-centos exp-docker.repo.dex.nu/nodejs:5.9-centos
docker tag -f exp-docker.repo.dex.nu/nodejs:5-centos exp-docker.repo.dex.nu/nodejs:5.9.0-centos
docker push exp-docker.repo.dex.nu/nodejs:5-centos
docker push exp-docker.repo.dex.nu/nodejs:5.9-centos
docker push exp-docker.repo.dex.nu/nodejs:5.9.0-centos

# Node.js 6 Alpine
docker pull exp-docker.repo.dex.nu/nodejs:6 || true
docker build -f Dockerfile.nodejs-6 -t exp-docker.repo.dex.nu/nodejs:6 .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:6 -c "node --version | grep v6.1.0"
docker tag -f exp-docker.repo.dex.nu/nodejs:6 exp-docker.repo.dex.nu/nodejs:6.1
docker tag -f exp-docker.repo.dex.nu/nodejs:6 exp-docker.repo.dex.nu/nodejs:6.1.0
docker push exp-docker.repo.dex.nu/nodejs:6
docker push exp-docker.repo.dex.nu/nodejs:6.1
docker push exp-docker.repo.dex.nu/nodejs:6.1.0

# Node.js 6 CentOS
docker pull exp-docker.repo.dex.nu/nodejs:6-centos || true
docker build -f Dockerfile.nodejs-6-centos -t exp-docker.repo.dex.nu/nodejs:6-centos .
docker run --entrypoint /bin/bash exp-docker.repo.dex.nu/nodejs:6-centos -c "node --version | grep v6.1.0"
docker tag -f exp-docker.repo.dex.nu/nodejs:6-centos exp-docker.repo.dex.nu/nodejs:6.1-centos
docker tag -f exp-docker.repo.dex.nu/nodejs:6-centos exp-docker.repo.dex.nu/nodejs:6.1.0-centos
docker push exp-docker.repo.dex.nu/nodejs:6-centos
docker push exp-docker.repo.dex.nu/nodejs:6.1-centos
docker push exp-docker.repo.dex.nu/nodejs:6.1.0-centos
