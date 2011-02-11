module.exports.Convorse = Convorse;

var http = require('http'),
    util = require('util');

var VERSION = "0.0.0";

// Some small helpers for patterns that annoy the crap out of me
// Which probably means I'm doing it wrong. ;_;
function identity(i) {return i;}
// contains(collection).thing(item) => bool # Does the item exist in collection?
function contains(listish) { return { thing: function(thing) { return listish.indexOf(thing) != -1; } }; };
// starts_with('_', '_foo') => true
// starts_with('_', 'foo') => false
// starts.bind('_')('foo') => false //..etc
function starts_with(pre, str) {
    var bound = typeof(str) === 'string' ? false : true;
    return (bound ? pre : str).indexOf(bound ? this : pre) === 0; };
// identity for lists, everything else as [i]
function as_list(i) { return i instanceof Array ? i : [i]; }


function Convorse() {
    this.VERSION = VERSION;
    this.api = {};

    this.map_endpoints();
}

Convorse.prototype.map_endpoint = function(dotpath, base, method, format, params) {
    var url = base + "." + format,
        argp = starts_with.bind(':'),
        not_argp = function(i) { return !argp(i); },
        have_args = dotpath.some(argp),
        round_to_zero = function(i) { return i < 0 ? 0 : i; },
        last_nonarg_index = round_to_zero(
                               dotpath.lastIndexOf(dotpath.filter(not_argp).pop())
                            );
    var args = have_args ? dotpath.slice(last_nonarg_index).filter(argp).map(function(s) { return s.slice(1); }) : [];
    dotpath = dotpath.reduce(function(acc, b) {
                                 var end = acc.length - 1;
                                 if(starts_with(':', b))
                                     acc[end] = as_list(acc[end]).concat(b.slice(1));
                                 else
                                     acc.push(b);
                                 return acc; },
                             []);
    console.log(dotpath, "(", params === true ? [] : params, ")");
    console.log("=> Mapping:", method, "=>", url);
}

Convorse.prototype.map_endpoints = function(dotpath, root, endpoints) {
    var VERBS = ['GET', 'POST'];
    var self = this,
        format = this.endpoints._meta.format;
    dotpath = dotpath || [];
    root = root || this.endpoints._meta.base;
    endpoints = endpoints || this.endpoints;

    for(name in endpoints) {
        if(starts_with('_', name)) continue;
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
            GET: true,
            messages: {
                'GET': true,

                create: {'POST': ['message']}}}}};