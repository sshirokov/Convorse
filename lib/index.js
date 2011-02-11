module.exports.Convorse = Convorse;

var http = require('http'),
    util = require('util');

var VERSION = "0.0.0";

// Some small helpers for patterns that annoy the crap out of me
// Which probably means I'm doing it wrong. ;_;

// contains(collection).thing(item) => bool # Does the item exist in collection?
function contains(listish) { return { thing: function(thing) { return listish.indexOf(thing) != -1; } }; };


function Convorse() {
    this.VERSION = VERSION;
    this.api = {};

    this.map_endpoints();
}

Convorse.prototype.map_endpoint = function(dotpath, base, method, format, params) {
    var url = base + "." + format;
    if(params)
    console.log("Mapping:", method, "=>", url, "With:", params, "Dotpath", dotpath);
}

Convorse.prototype.map_endpoints = function(dotpath, root, endpoints) {
    var VERBS = ['GET', 'POST'];
    var self = this,
        format = this.endpoints._meta.format;
    dotpath = dotpath || [];
    root = root || this.endpoints._meta.base;
    endpoints = endpoints || this.endpoints;

    for(name in endpoints) {
        if(name.charAt(0) == '_') continue;
        var endpoint = endpoints[name];

        if(contains(VERBS).thing(name))
            this.map_endpoint(dotpath, root, name, format, endpoint);
        else
            this.map_endpoints(dotpath.concat(name), root+'/'+name, endpoint);
    }
}

Convorse.prototype.endpoints = {
    '_meta': {
        base: "https://convore.com/api",
        format: 'json'
    },

    live: {'GET': 'stream'},

    account: {
        verify: {'GET': true}},
    groups: {
        'GET': true,
        ':id': {
            'GET': true,
            leave: {'POST': true},
            topics: {
                'GET': true,
                create: {'POST': ['name']}}},
        create: {'POST': [['name'], ['description', 'slug']]}},
    topics: {
        ':id': {
            GET: 'true',
            messages: {
                'GET': true,

                create: {'POST': ['message']}}}}};