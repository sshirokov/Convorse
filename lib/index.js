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

Convorse.prototype.generate_endpoint = function(dotpath, url, method, params) {
    console.log("Generate:", method, '=>', url);
    var me = dotpath.pop(),
        name = (me instanceof Array) ? me[0] : me,
        args = (me instanceof Array) ? me.slice(1) : [],
        node = dotpath.reduce(function(acc, b) {
                                  b = (b instanceof Array) ? b[0] : b;
                                  if(!acc[b]) acc[b] = {};
                                  return acc[b];
                              }, this.api);
    if(!node[name]) node[name] = function() {
        var fn = arguments.callee;
        return fn[arguments.length](arguments);
    };
    node[name][args.length] = function() {
        var self = this;
        Array.prototype.slice.call(arguments).forEach(
            function(arg, i) {
                console.log("Arg:", arg, "I:", i);
                self.url = self.url.replace(/:[\w_-]+/, arg[i]); });

        return this.url;
    }.bind({url: url});
        // function(cursor, i) {
        //     console.log("API looks like:", self.api);
        //     console.log("Cursor looks like:", cursor);

        //     var name = (i instanceof Array) ? i.shift() : i;

        //     if(cursor[name] !== undefined) {
        //         console.log(name, "already exists");
        //     }
        //     else {
        //         console.log("Should add:", name);
        //         cursor[name] = make(url, name, i);
        //     }
        //     // Either set or update cursor[i] to a matching API method
        //     // from a generator or just a prop
        //     return cursor[name]; },
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
    this.generate_endpoint(dotpath, url, method, params === true ? [] : params);
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