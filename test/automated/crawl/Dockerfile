FROM nodesource/node:trusty

MAINTAINER David Bruant <bruant.d@gmail.com>

RUN apt-get update && apt-get install -y supervisor

RUN npm install -g mocha

ENV NODE_ENV test

WORKDIR /usr/mywi