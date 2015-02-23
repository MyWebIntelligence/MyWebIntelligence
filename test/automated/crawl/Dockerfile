FROM node:0.10

MAINTAINER David Bruant <bruant.d@gmail.com>

RUN mkdir /usr/virtual-web

RUN apt-get update && apt-get install -y supervisor

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY virtual-web /usr/virtual-web

WORKDIR /usr/virtual-web
RUN npm install
WORKDIR /
