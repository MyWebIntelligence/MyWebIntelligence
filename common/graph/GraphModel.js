"use strict";

/**
 * Object representing a directed graph of Nodes linked by Edges
 *
 * It relies on native WeakMap feature
 * Use `node --harmony_weakmaps` to make this working.
 *
 * @exports GDFModel
 */

var csv = require('fast-csv');
var moment = require('moment');

var DOM = require('./DOMBuilder.js');

var NULL = 'NULL';

/**
 * Like Object.keys, but for enumerated properties
 * @param o
 */
function enumerablePropNames(o){
    var propNames = [];

    while(o !== null){
        propNames = propNames.concat(Object.keys(o));
        o = Object.getPrototypeOf(o);
    }

    // Removing duplicates
    return propNames.filter(function(e, i, a){
        return a.indexOf(e) === i;
    });
}



/**
* Creates a new GraphNode
*
* @param name {string}
* @param attributes {Object}
* @return {GraphNode}
*/
function GraphNode(name, attributes){
    var ret = this || Object.create(GraphNode.prototype);
    var opt;

    if(typeof name !== 'string'){
        throw new TypeError("name is not of type string ("+typeof name+")");
    }

    ret.name = name;

    for(opt in attributes)
        ret[opt] = attributes[opt];

    return ret;
}


var ALLOWED_DEFAULTEDGETYPES = Object.freeze(["directed", "undirected", "mutual"]);
/**
 * Creates a new GraphEdge
 *
 * @param node1 {GraphNode or string}
 * @param node2 {GraphNode or string}
 * @param attributes {Object}
 */
function GraphEdge(node1, node2, attributes, options){
    var ret = this || Object.create(GraphEdge.prototype);
    options = options || {};
    var editableWeight = !!options.editableWeight;
    var opt;

    if(!(node1 instanceof GraphNode))
        throw new TypeError("First argument must be a GraphNode instance");
    if(!(node2 instanceof GraphNode))
        throw new TypeError("Second argument must be a GraphNode instance");

    ret.node1 = node1;
    ret.node2 = node2;
    for(opt in attributes)
        ret[opt] = attributes[opt];

    if(editableWeight){
        var weight = ret.weight;
        if(typeof weight !== 'number' || isNaN(weight)){
            throw new TypeError('Weight must be an actual number ('+weight+')');
        }

        Object.defineProperty(ret, 'weight', {
            get: function(){ return weight; },
            set: function(w){
                if(typeof weight !== 'number' || isNaN(weight)){
                   throw new TypeError('Weight must be an actual number ('+weight+')');
                }

                weight = w;
            }
        });
    }

    return Object.freeze(ret);
}


/**
 * @param desc (default): object. describes how each option should look like
 *
 */
function makeAttributes(desc, specific){
    var options = Object.create(null);
    var opt;

    for(opt in specific){
        if(!(opt in desc)){
            if(specific[opt] !== undefined){
                throw new Error("'" + opt + "' (value: "+specific[opt]+") is not a valid option ("+
                    JSON.stringify(enumerablePropNames(desc))+")");
            }
            // ignore otherwise
        }
        else{
            var expectedType = desc[opt].type;
            var value = specific[opt];
            if(Object(value) === value && typeof value.toString === 'function' && expectedType === 'string')
                value = String(value);
            var valueType = typeof value;
            // TODO complete type matching
            
            if((specific[opt] === undefined || specific[opt] === null) && desc[opt].default !== undefined){
                options[opt] = desc[opt].default;
            }
            else{
                if( !(valueType === 'number' && expectedType === 'integer') &&
                    !(valueType === 'number' && expectedType === 'float') &&
                    (valueType !== expectedType))
                        throw new TypeError("Value for '"+opt+"' option should be a "+desc[opt].type+" and is a "+typeof specific[opt]+' ('+specific[opt]+')');

                options[opt] = specific[opt];
            }
        }
    }

    for(opt in desc){ // all expected options
        if( !('default' in desc[opt]) && !(opt in options))
            throw new Error("option '" + opt + "' is expected (no default value) and missing");
    }

    return options;
}

var ALLOWED_TYPES = Object.freeze([ // from http://gexf.net/1.2draft/data.xsd "attrtype-type"
    "integer",
    "long",
    "double",
    "float",
    "boolean",
    "liststring",
    "string",
    "anyURI"
]);

function completeAttributeDescriptor(attrDesc){
    var ret = {};

    if('default' in attrDesc)
        ret['default'] = attrDesc['default'];

    if('type' in attrDesc){
        if(ALLOWED_TYPES.indexOf(attrDesc.type) === -1)
            throw new Error("attrDesc.type ("+attrDesc.type+") is not an valid type");

        ret.type = attrDesc.type;
    }
    else{ // infer type from default
        if('default' in attrDesc)
            ret['type'] = typeof attrDesc['default']; // TODO mapping between ECMAScript types and gexf types
        else
            throw new Error('attrDesc has neither "type" nor "default" field');
    }

    return Object.freeze(ret);
}


/**
 *
 * @param nodeAttributes Object. Enumerable property names (own or inherited)
 * are all the compulsory properties expected from option objects. nodeOptions
 * values are default values. undefined as value means that the option is compulsory,
 * but no default provided though
 * @param edgeAttributes Object. Same as nodeOptions, but for edges
 * @param options? Object
 * {
 *   accumulateEdgeWeights: Boolean (default false) // By default, adding edges make several edges for the same 2 nodes
 *   // With this option, a pair of nodes has a unique edge with a weigh that accumulates with adding edges
 *   defaultedgetype: String, "directed” | ”undirected” | "mutual" (default "directed"). Equivalent GEXF property
 * }
 */
function GraphModel(nodeAttributes, edgeAttributes, options){

    if(typeof nodeAttributes !== 'object')
        throw new TypeError("First argument of GDFModel should be an object ("+typeof nodeAttributes+")");
    if(typeof edgeAttributes !== 'object')
        throw new TypeError("Second argument of GDFModel should be an object ("+typeof edgeAttributes+")");

    options = options || {};
    var accumulateEdgeWeights = !!options.accumulateEdgeWeights;
    var defaultedgetype = 'defaultedgetype' in options ? options.defaultedgetype : "directed";

    if(accumulateEdgeWeights && !('weight' in edgeAttributes)){
        edgeAttributes.weight = {
            type: 'float'
        }
    }

    if(ALLOWED_DEFAULTEDGETYPES.indexOf(defaultedgetype) === -1)
        throw new Error('defaultedgetype is not in ['+ALLOWED_DEFAULTEDGETYPES.join(', ')+'] ('+defaultedgetype+')');

    Object.keys(nodeAttributes).forEach(function(o){
        nodeAttributes[o] = completeAttributeDescriptor(nodeAttributes[o])
    });
    Object.keys(edgeAttributes).forEach(function(o){
        edgeAttributes[o] = completeAttributeDescriptor(edgeAttributes[o])
    });



    var nodeByName = Object.create(null);
    var lifetimeByNode = new Map();
    var lifetimeByEdge = new Map();
    var edges = new WeakMap(); // for efficient search by nodes
    var edgesList = []; // to return the list

    return {
        addNode: function(name, optargs, lifetime){
            if(typeof name !== 'string')
                throw new TypeError("First argument of GraphModel.addNode should be a string ("+typeof name+")");

            if(name in nodeByName)
                throw new Error("Node "+name+" already exists");

            var opts = makeAttributes(nodeAttributes, optargs);

            var node = new GraphNode(name, opts);
            nodeByName[name] = node;
            
            if(lifetime){
                if(Object(lifetime) !== lifetime || (!lifetime.start && !lifetime.end))
                    throw new Error('Invalid lifetime for node '+name+'. Expected {start?, end?} object');
                else{
                    lifetimeByNode.set(node, lifetime);
                }
            }

            return node;
        },

        /**
         *
         * @param name {string}
         */
        getNode: function(name){
            if(name === undefined)
                return undefined;
            
            if(typeof name !== 'string')
                throw new TypeError("First argument of GraphModel.getNode should be a string ("+typeof name+")");

            return nodeByName[name];
        },
        
        getLifetimeByNode: function(n){
            return lifetimeByNode.get(n);
        },

        get nodes(){
            return new Set(Object.keys(nodeByName).map(function(name){
                return nodeByName[name];
            }));
        },

        addEdge: function(node1, node2, attributesArgs, lifetime){
            // Input validation
            if(typeof node1 === 'string'){
                if(node1 in nodeByName)
                    node1 = nodeByName[node1];
                else
                    throw new Error("There is no node named: "+node1);
            }

            if(typeof node2 === 'string'){
                if(node2 in nodeByName)
                    node2 = nodeByName[node2];
                else
                    throw new Error("There is no node named: "+node2);
            }

            if(typeof node1 !== 'object')
                throw new TypeError("First argument of addEdge should be a string or an object ("+typeof node1+")");
            if(typeof node2 !== 'object')
                throw new TypeError("SeallEdgescond argument of addEdge should be a string or an object ("+typeof node2+")");

            if(!(node1.name in nodeByName))
                throw new Error(node1 +" is not in the graph");
            if(!(node2.name in nodeByName))
                throw new Error(node2 +" is not in the graph");

            attributesArgs = attributesArgs || {};
            var edgetype = attributesArgs.edgetype || defaultedgetype;
            if(ALLOWED_DEFAULTEDGETYPES.indexOf(edgetype) === -1)
                throw new Error('edgetype is not in ['+ALLOWED_DEFAULTEDGETYPES.join(', ')+'] ('+edgetype+')');
            // End input validation


            // If edge is undirected or mutual, reorder nodes
            if(edgetype === 'undirected' || edgetype === 'mutual'){
                if(node1.name > node2.name){
                    var temp = node1; // ought to be a let
                    node1 = node2;
                    node2 = temp;
                }
            }

            var wm2 = edges.get(node1);

            if(typeof wm2 !== 'object'){
                wm2 = new WeakMap();
                edges.set(node1, wm2);
            }

            var opts = makeAttributes(edgeAttributes, attributesArgs);
            var edge;

            // Adding an edge
            if(accumulateEdgeWeights){ // unique edge per node pair
                edge = wm2.get(node2);
                if(!edge){
                    edge = new GraphEdge(node1, node2, opts, {editableWeight: true}); // weight is initiallized
                    wm2.set(node2, edge);
                    edgesList.push(edge);
                }
                else{ // accumulate weight (all other attributes are purposefully ignored)
                    edge.weight += options.weight;
                }
            }
            else{
                var theseNodeEdges = wm2.get(node2);

                if(!Array.isArray(theseNodeEdges)){
                    theseNodeEdges = [];
                    wm2.set(node2, theseNodeEdges);
                }

                edge = new GraphEdge(node1, node2, opts);

                theseNodeEdges.push(edge);
                edgesList.push(edge);
            }
            
            if(lifetime){
                if(Object(lifetime) !== lifetime || (!lifetime.start && !lifetime.end))
                    throw new Error('Invalid lifetime for edge ('+node1.name+', '+node2.name+'), . Expected {start?, end?} object');
                else{
                    lifetimeByEdge.set(edge, lifetime);
                }
            }

            return edge;
        },

        /**
         *
         * @param n1
         * @param n2
         * @return always an array (maybe empty) of edges
         */
        getDirectedEdges: function edgesByNodes(n1, n2){
            var wm = edges.get(n1);

            if(typeof wm !== 'object'){
                return [];
            }

            return wm.get(n2) || [];
        },

        /**
         * same as getDirectedEdges, but checking in both directions
         * @param n1
         * @param n2
         * @return always an array (maybe empty) of edges
         */
        getEdges: function(node1, node2){
            // check both sides
            var edges1 = this.getDirectedEdges(node1, node2);
            var edges2 = node1 !== node2 ?
                            this.getDirectedEdges(node2, node1):
                            [];

            return edges1.concat(edges2);
        },

        /**
         * Returns all edges of the graph
         * @return {Array}
         */
        get edges(){
            // return a copy
            return new Set(edgesList.slice(0));
        },
        
        getLifetimeByEdge: function(e){
            return lifetimeByEdge.get(e);
        },
        
        makeDegreeWeakMap: function(){
            var nodeToDegree = new WeakMap();
            
            Object.keys(nodeByName).forEach(function(name){
                var node = nodeByName[name];
                nodeToDegree.set(node, {
                    inDegree: 0,
                    outDegree: 0,
                    get degree(){
                        return this.inDegree + this.outDegree;
                    }
                });
            });
            
            edgesList.forEach(function(edge){
                var node1 = edge.node1;
                var node2 = edge.node2;
                
                nodeToDegree.get(node1).outDegree++;
                nodeToDegree.get(node2).inDegree++;
            });
            
            return nodeToDegree;
        },

        exportAsGEXF: function(){
            var PREAMBULE = '<?xml version="1.0" encoding="UTF-8"?>\n';

            var nodeAttributesDeclaration = (function(){

                if(Object.keys(nodeAttributes).length > 0){

                    var attributes = Object.keys(nodeAttributes).map(function(opt){
                        var defContent = ('default' in nodeAttributes[opt]) ?
                            [DOM['default']({}, String(nodeAttributes[opt]['default']))] :
                            undefined;

                        return DOM.attribute({id: opt, title:opt, type:nodeAttributes[opt].type}, defContent); // Defaulting to "string" is too restrictive. TODO Improve
                    });

                    return attributes;
                }

                return undefined;
            })();


            var graphNodes = Object.keys(nodeByName).map(function(nodeName){
                var n = nodeByName[nodeName];

                var attrvalues = Object.keys(n)
                    .filter(function(attrName){
                        return attrName !== 'name';
                    })
                    .map(function(opt){
                        return DOM.attvalue({"for":opt, value: n[opt]===null ? NULL: n[opt]});
                    });

                var nodeAttrs = {id:nodeName, label:nodeName};
                
                var nodeLifetime = lifetimeByNode.get(n);
                if(nodeLifetime){
                    var start = moment(nodeLifetime.start);
                    if(nodeLifetime.start && start.isValid())
                        nodeAttrs.start = start.format('YYYY-MM-DD');
                    var end = moment(nodeLifetime.end);
                    if(nodeLifetime.end && end.isValid())
                        nodeAttrs.end = end.format('YYYY-MM-DD');
                }
                
                return DOM.node(nodeAttrs, [
                    DOM.attvalues({}, attrvalues)
                ]);
            });


            var edgeAttributesDeclaration = (function(){

                if(Object.keys(edgeAttributes).length > 0){

                    var attributes = Object.keys(edgeAttributes).map(function(opt){
                        var defContent = ('default' in edgeAttributes[opt]) ?
                            [DOM['default']({}, String(edgeAttributes[opt]['default']))] :
                            undefined;

                        return DOM.attribute({id: opt, title:opt, type:edgeAttributes[opt].type}, defContent); // Defaulting to "string" is too restrictive. TODO Improve
                    });

                    return attributes;
                }

                return undefined;
            })();


            var graphEdges = edgesList.map(function(e, i){

                var attrvalues = Object.keys(e)
                    .filter(function(attrName){
                        return attrName !== 'node1' && attrName !== 'node2' && attrName !== 'weight';
                    })
                    .map(function(opt){
                        return e[opt] === edgeAttributes[opt] ?
                            undefined :
                            DOM.attvalue({"for":opt, value: e[opt]===null ? NULL: e[opt]});
                    })
                    .filter(function(x){ return !!x; });

                var edgeAttrs = {id:i, source:e.node1.name, target:e.node2.name, weight:e.weight};
                
                var edgeLifetime = lifetimeByEdge.get(e);
                if(edgeLifetime){
                    var start = moment(edgeLifetime.start);
                    if(edgeLifetime.start && start.isValid())
                        edgeAttrs.start = start.format('YYYY-MM-DD');
                    var end = moment(edgeLifetime.end);
                    if(edgeLifetime.end && end.isValid())
                        edgeAttrs.end = end.format('YYYY-MM-DD');
                }
                
                return DOM.edge(edgeAttrs, [
                    DOM.attvalues({}, attrvalues)
                ]);
            });

            var dynamic = lifetimeByNode.size > 0 || lifetimeByEdge.size > 0;
            var graphAttrs = {
                mode: dynamic ? "dynamic" : "static", 
                defaultedgetype: defaultedgetype
            }
            
            if(dynamic)
                graphAttrs.timeformat = "date";
            
            
            var graph =
                DOM.gexf({xmlns:"http://www.gexf.net/1.2draft", version:"1.2"}, [
                    DOM.graph(graphAttrs, [
                        DOM.attributes({class: 'node'}, nodeAttributesDeclaration),
                        DOM.attributes({class: 'edge'}, edgeAttributesDeclaration),
                        DOM.nodes({}, graphNodes),
                        DOM.edges({}, graphEdges)
                    ])
                ]);

            return PREAMBULE + graph;
        },
        
        exportNodesCSVStream: function(){
            // first line
            
            return csv
                .write(
                    Object.keys(nodeByName).map(function(n){return nodeByName[n]}),
                    {headers: true}
                )
        }
    };
}




module.exports = GraphModel;
