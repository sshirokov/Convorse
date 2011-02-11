module.exports.Convorse = Convorse;

var http = require('http');

var VERSION = "0.0.0";

function Convorse() {
    this.VERSION = VERSION;

    this.map_endpoints();
}

Convorse.prototype.map_endpoints = function() {
    
}

Convorse.prototype.endpoints = {
    '_meta': {
        base: "https://convore.com/api/",
        format: 'json'
    },

    live: {'GET': 'stream'},

    account: {
        verify: {'GET': true},
        groups: {
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

                    create: {'POST': ['message']}}}}}};