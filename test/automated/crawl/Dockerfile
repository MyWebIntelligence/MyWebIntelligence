FROM nodesource/node:trusty

MAINTAINER David Bruant <bruant.d@gmail.com>

RUN apt-get update && apt-get install -y supervisor
RUN npm install -g mocha

WORKDIR /usr/mywi
ENV NODE_ENV test

COPY . .