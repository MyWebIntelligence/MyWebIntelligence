# MyWebIntelligence

The opensource platform MyWebIntelligence ('MyWi' for short) produced by the MICA laboratory as part of the Institute of Digital Humanities is to provide a strategic tool in the analysis and understanding of communication on the Internet. This is a "crawler" of a new generation which, from a keyword dictionary, buid a database of qualified web pages in the service of strategic intelligence. It not only utilizes numerous external data sources but the latest data classification algorithms (ANS TextAnalysis, etc.)

My Web Intelligence can provide the means to capture, qualify and prioritize considerable discourse mass to map the universe of discourse on your interests. This will not only have real-time studies in the online discourse but also better understand the heterogeneous actors by their arguments and strategies.

A more **high-level description** can be found on [slideshare](http://fr.slideshare.net/alakel/my-web-intelligence-une-plateforme-open-source-au-service-des-humanits-digitales) (French)

## Architecture

For now, everything will belong in this repo. Eventually, parts will be separated into their own repos (perhaps some parts will even be released as NPM modules).

MyWI will be a project that can be installed on a server (dedicated machine) and accessed to via a web interface. MyWI needs crawling capabilities; as such, it needs to send HTTP requests all the time and throttle them (to be a good web citizen and not be blocked) as well as storage capabilities which makes it hard to make a browser addon.

### Server-side

Off-head, a few server-side components will be needed:
* user/project management
* expression domain resolution

#### User/Project management

* The database will a [PostgreSQL](http://www.postgresql.org/) database. We would have loved to use a [graph database](http://en.wikipedia.org/wiki/Graph_database) like [Titan](http://thinkaurelius.github.io/titan/), but these have been ruled out for now by lack of experience and maybe lack of tooling around them (and resources to build this tooling ourselves).
* [Express](http://expressjs.com/)


### Client-side

Client-side is built with 
* [React](http://facebook.github.io/react/) (without JSX)


### Tooling

* [Browserify](http://browserify.org/) (+ [tsify](https://github.com/smrq/tsify))
* ([TypeScript](http://www.typescriptlang.org/))
* ([ESLint](http://eslint.org/))
* ([Docker](https://www.docker.com/))

### Testing

* ([CasperJS](http://casperjs.org/))


## Project organisation

TODO figure out and document relationship with Trello


## As a developer

### Install

* Install Node.js, Docker
* `npm install`
* `npm run bundle`
* `npm start`

### Test

#### General

```bash
npm test
```

#### Crawler

Build the Docker image then run tests in it

````bash
npm run build-test-crawl-docker-image
npm run test-crawl
````

## Installing on your own server

* Install [Docker](https://docs.docker.com/installation/#installation)
   * Quick way on Ubuntu: `curl -sSL https://get.docker.com/ubuntu/ | sudo sh`
* Install [Node.js](https://nodejs.org/)
   * Quick way on Ubuntu: `curl -sL https://deb.nodesource.com/setup | sudo bash -` then `sudo apt-get install -y nodejs`

````sh
git clone https://github.com/MyWebIntelligence/MyWebIntelligence.git
cd MyWebIntelligence
````

* (Optional) To get Google login
    * Create a Google project in the [Google Console](https://console.developers.google.com)
    * Activate Google+ API for your project
    * Create OAuth2 credentials
    * `cp config/google-credentials.sample.json config/google-credentials.json`
    * Fill in credentials in `crawl/google-credentials.json`

* (Optional) Create a [Readability account](https://www.readability.com/login/?next=/settings/account)
    * [Create API keys](https://www.readability.com/settings/account) (need to verify email for that)
    * `cp crawl/config.sample.json crawl/config.json`
    * add your Parser API key token in the `"Readability-parser-API-key"` field

* Build then run the production Docker image

````sh
npm run build
npm run start-prod
````

### notes

```bash
docker pull postgres:9.4
docker run --name mywipostgres -e POSTGRES_PASSWORD=password POSTGRES_USER=user -d postgres:9.4
docker run -e POSTGRES_PASSWORD=password -p 5555:5432 -d postgres:9.4

```

## Licence

[MIT](LICENCE)
