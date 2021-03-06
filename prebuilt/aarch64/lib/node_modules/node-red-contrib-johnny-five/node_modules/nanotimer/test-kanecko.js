var NanoTimer = require('nanotimer');

var timer = new NanoTimer();

//var timer = createTimer();


timer.setTimeout(
    myFun.bind(this, 0),
    [],
	'2s'
);

function myFun (id) {
    var timer = getTimer();
    var duration = 2;

    console.log(timer);
    timer.clearTimeout();
    console.log(timer);
    timer.setTimeout(
        myFun.bind(this, id),
        [],
        duration + "s"
    );
    console.log(timer);
	console.log("\n");
}

function getTimer(){
	return timer;
}