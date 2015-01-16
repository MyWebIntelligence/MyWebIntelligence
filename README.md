# MyWebIntelligence

The opensource platform MyWebIntelligence ('MyWi' for short) produced by the MICA laboratory as part of the Institute of Digital Humanities is to provide a strategic tool in the analysis and understanding of communication on the Internet. This is a "crawler" of a new generation which, from a keyword dictionary, buid a database of qualified web pages in the service of strategic intelligence. It not only utilizes numerous external data sources but the latest data classification algorithms (ANS TextAnalysis, etc.)

My Web Intelligence can provide the means to capture, qualify and prioritize considerable discourse mass to map the universe of discourse on your interests. This will not only have real-time studies in the online discourse but also better understand the heterogeneous actors by their arguments and strategies.

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


## Getting started

* Install Node.js
* `npm install`
* For Google Login
** Create Google project in the [Google Console](https://console.developers.google.com)
** Activate Google+ API for your project
** Create `config/google-credentials.json` file with credentials
* `npm run build`
* `npm start`


## Licence

[MIT](LICENCE)