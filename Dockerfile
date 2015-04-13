FROM nodesource/node:trusty

MAINTAINER David Bruant <bruant.d@gmail.com>

RUN mkdir /usr/mywi

WORKDIR /usr/mywi

COPY . .

RUN npm install
RUN npm run bundle

EXPOSE 3333