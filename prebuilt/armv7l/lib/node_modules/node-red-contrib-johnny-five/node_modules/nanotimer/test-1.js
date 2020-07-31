var NanoTimer = require('nanotimer');

var timer = new NanoTimer();

var simpleFunction = function(){
	console.log("hey\n");
};

timer.setTimeout(simpleFunction, [], '2s');
timer.clearTimeout();