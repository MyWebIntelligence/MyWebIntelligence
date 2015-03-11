"use strict";

var Graph = require('./GraphModel.js');

var urlLib = require('url');
var parseURL = urlLib.parse;
var formatURL = urlLib.format;


function makeNodeNameGenerator(){
    var PREFIX = 'n';
    var i = 0;

    return function(){
        i += 1;
        return PREFIX + i;
    };
}

module.exports = function ExportGraph(){

    var graph = Object.create(new Graph({
        // Node attributes description
        "domain": {
            type: "string"
        },
        "url": {
            type: "string"
        },
        "relevance":{
            "type": "string"
        },
        "type":{
            "type": "string",
            "default": null
        },
        "emitter":{
            "type": "string",
            "default": null
        },
        "str_emitter":{
            "type": "string",
            "default": null
        },
        "recipients":{
            "type": "string",
            "default": null
        },
        "DijiRatioLink":{
            "type": "float",
            "default": 0 // cited and crawled domain should have this value
        },
        "profile":{
            "type": "string",
            "default": null
        },
        "objects":{
            "type": "string",
            "default": null
        },
        "str_objects":{
            "type": "string",
            "default": null
        },
        "intent":{
            "type": "string",
            "default": null
        },
        "tone":{
            "type": "string",
            "default": null
        },
        "maxPagerank":{
          "type": "integer",
          "default": 0
        },
        "meanPagerank":{
          "type": "float",
          "default": 0
        },
        "alexarank":{
          "type": "integer",
          "default": 0
        },
        "support":{
            "type": "string",
            "default": null
        },
        "str_date":{
          "type": "string",
          "default": null
        }



        /*,
             "locale":{
             "type": "string",
             "default": null
             },
             "title":{
             "type": "string",
             "default": null
             },

        "languageLevel":{
            "type": "string",
            "default": null
        },
        "writingDate":{
            "type": "string",
            "default": null
        },
        "contentLength":{
            "type": "string",
            "default": null
        }*/
    },  // Edge attributes description
        {
        "weight": {
            type: "integer"
        }
    }));

    var generateNodeName = makeNodeNameGenerator();

    var nodesByDomain = Object.create(null);

    var graphExtension = {
        addDomainNode: function(domain, attributes){
            if(domain in nodesByDomain)
                throw new Error("There is already a node for "+ domain);
            if(typeof attributes !== 'object')
                throw new TypeError("attributes is not an object");

            // TODO find a less intrusive way than adding property directly on the 'attributes' object
            attributes.domain = domain;
            attributes.url = 'http://'+domain+'/';

            nodesByDomain[domain] = this.addNode(generateNodeName(), attributes);
            return nodesByDomain[domain];
        },

        addDomainWeightedLink: function(from, to, weight){
            if(!weight)
                throw new Error("weight should not be falsy ("+weight+"): No one cares if 2 domains are not connected.");

            // TODO: stronger type checking. Make sure the object is an actual node(?)
            if(typeof from !== 'object')
                throw new TypeError("AmarGraph#addDomainWeightedLink: from is not an object");
            if(typeof to !== 'object')
                throw new TypeError("AmarGraph#addDomainWeightedLink: to is not an object");

            // Add only if non-existent to avoid duplicates
            if(this.getDirectedEdges(from, to).length === 0) // May be performance intensive. Not needed for now. TODO get back up if needed
                this.addEdge(from, to, {"weight": +weight});
        },

        /*addRedirects: function(from, redirects){
            var fromNode = nodesByUrls[from] || this.addDomainNode(from);
            var toNode;

            redirects.forEach(function(r){
                var to = r.redirectUri;
                toNode = nodesByUrls[to] || this.addDomainNode(to);

                this.addEdge(fromNode, toNode, {"redirectCode": r.statusCode});

                fromNode = toNode;
            }, this);
        },*/

        /**
         *
         * @param wStream {WritableStream}
         * This function assumes the writable stream is open and ready to receive writes
         * This function will only call wStream.write(str). It is left to the caller
         * to check for errors and also to call wStream.end()
         * @return writes to the writable stream a JSON string of an object like:
         * {
         *     nodes: {url: true | 404 | 403 | 500...}
         *     edges: [{
         *         from: url
         *         to: url
         *         (redirect): 301 | 302
         *       }
         *     ]
         * }
         */
        exportToStreamAsJSON: function(wStream){

            var result = {
                nodes: {}
            };

            this.allNodes().forEach(function(node){
                result.nodes[node.url] = true;
            });

            result.edges = this.allEdges().map(function(edge){
                var ret = {
                    from: edge.node1.url,
                    to: edge.node2.url
                };

                if(edge.redirectCode){
                    ret.redirect = edge.redirectCode;
                }

                return ret;
            });

            wStream.write( JSON.stringify(result) );
        }


    };

    Object.keys(graphExtension).forEach(function(e){
        if(typeof graphExtension[e] === 'function'){
            graph[e] = graphExtension[e];
        }
    });

    return graph;
};
