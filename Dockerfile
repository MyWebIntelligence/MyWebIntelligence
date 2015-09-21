FROM nodesource/trusty:0.10

MAINTAINER David Bruant <bruant.d@gmail.com>

RUN npm install nodemon -g

RUN mkdir /usr/mywi
WORKDIR /usr/mywi 

# Copy only package.json, then npm install so both can be cached by Docker if package.json hasn't changed
COPY ./package.json /usr/mywi/package.json
RUN npm install

# Copy the rest of the code over to the container
COPY . /usr/mywi

RUN npm run bundle

EXPOSE 3333