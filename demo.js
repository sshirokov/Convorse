#!/usr/bin/env node
if(process.argv.length < 4) {
    console.log(process.argv[1], "user password");
    process.exit(1);
}


var repl = require('repl');
var Convorse = require('./index').Convorse,
    client = new Convorse(process.argv[2], process.argv[3]);

console.log("Loaded:", client);
console.log("Api=>", client.api);

var r = repl.start('node>> ');
r.context.client = client;
r.context.callback = function(error, data) { if(error) console.error("Error:", data); else console.log("Data:", data); };