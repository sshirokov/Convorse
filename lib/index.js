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

    this.map_endpoints();
}

Convorse.prototype.map_endpoint = function(base, method, format, params) {
    var url = base + "." + format;
    console.log("Mapping:", method, "=>", url, "With:", params);
}

Convorse.prototype.map_endpoints = function(root, endpoints) {
    var VERBS = ['GET', 'POST'];
    var self = this,
        format = this.endpoints._meta.format;
    if(!root) root = this.endpoints._meta.base;
    if(!endpoints) endpoints = this.endpoints;

    for(name in endpoints) {
        if(name.charAt(0) == '_') continue;
        var endpoint = endpoints[name];

        if(contains(VERBS).thing(name))
            this.map_endpoint(root, name, format, endpoint);
        else
            this.map_endpoints(root+'/'+name, endpoint);
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