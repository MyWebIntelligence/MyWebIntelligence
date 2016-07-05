# MyWebIntelligence

The Open Source platform MyWebIntelligence ('MyWi' for short) produced by the MICA laboratory as part of the Institute of Digital Humanities provides a strategic tool to analyse and understand communication on the Internet. This is a "crawler" of a new generation which, from a keyword dictionary, builds a database of qualified web pages for the purpose of strategic intelligence.

My Web Intelligence can provide the means to capture, qualify and prioritize considerable discourse mass to map the universe of discourse on your interests. This will not only have real-time studies in the online discourse but also better understand the heterogeneous actors by their arguments and strategies.

A more **high-level description** can be found on [slideshare](http://www.slideshare.net/alakel/20140629-post1) 

## Architecture

MyWI will be a project that can be installed on a server (dedicated machine) and accessed to via a web interface. MyWI needs crawling capabilities; as such, it needs to send HTTP requests all the time and throttle them (to be a good web citizen and not be blocked) as well as storage capabilities.


## As a developer

#### First time

* Install Node.js, Docker
* then:

```bash
npm install
```

* Build the docker image

```bash
npm run build-dev
```


#### Daily routine

```bash
npm run up-dev
npm run watch
```



## Installing on your own server

* **Install** [Docker](https://docs.docker.com/installation/#installation)
  * On Ubuntu, there is an [apt repository](https://docs.docker.com/engine/installation/ubuntulinux/)
    * (for steps 5 to 7, do `echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" > /etc/apt/sources.list.d/docker.list`)  

* **Install** [Docker compose](https://docs.docker.com/compose/install/)

* **Install** [Node.js](https://nodejs.org) 0.10
  * For Ubuntu [see instructions](https://github.com/nodesource/distributions#installation-instructions)
  * Install build-essential: `sudo apt-get install -y build-essential`


````sh
git clone https://github.com/MyWebIntelligence/MyWebIntelligence.git
cd MyWebIntelligence
````

* **To get Google login**
    * Create a Google project in the [Google Console](https://console.developers.google.com)
    * Activate Google+ API for your project
    * Create OAuth2 credentials
        * Add `http://yourdomain.com:3333/auth/google/callback` to the allowed redirect URLs list
    * `cp config/google-credentials.sample.json config/google-credentials.json`
    * Fill in credentials in `config/google-credentials.json`
        * Set `"CALLBACK_URL"` to `http://yourdomain.com:3333/auth/google/callback`

* **(Recommanded but optional) Create a [Readability account](https://www.readability.com/login/?next=/settings/account)**
    * [Create API keys](https://www.readability.com/settings/account) (need to verify email for that)
    * `cp crawl/config.sample.json crawl/config.json`
    * add your Parser API key token in the `"Readability-parser-API-key"` field

* **Build then run the production Docker image**

````sh
npm run build-stable
npm install
npm run bundle
npm run up-stable # starts the application or restart it if it's already up
````

* **Initialize the database**

````sh
docker exec mywistable_app_1 node tools/recreateSQLTables.js
# docker exec mywiexperimental_app_1 node tools/recreateSQLTables.js
npm run up-stable
````

* **(Recommanded but optional) Make a copy of Alexa's top 1M**

````sh
docker exec mywistable_app_1 node tools/cacheAlexaTop1M.js
# docker exec mywiexperimental_app_1 node tools/cacheAlexaTop1M.js
````

## Licence

[MIT](LICENCE)
