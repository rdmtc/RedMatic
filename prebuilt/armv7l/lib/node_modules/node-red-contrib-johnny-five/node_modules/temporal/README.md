# temporal


[![Build Status](https://travis-ci.org/rwaldron/temporal.svg)](https://travis-ci.org/rwaldron/temporal)

Non-blocking, temporal task sequencing. `temporal` does NOT use `setTimeout` or `setInterval`, however there is a cost for using "recursive" `setImmediate` to create an extremely fast, async execution loop. CPU usage is expected to peak when using `temporal`, because the internal ticker needs to execute as fast as possible and as many times per second as possible. It's this speed that allows `temporal` to review the internal schedule for tasks to execute more than once per millisecond, which is needed to create preferential execution cycles for hardware programming. 

`temporal` is for writing timing sensitive programs that are expected to be the primary process running on a given system, where the power source itself is tuned to accommodate _that program_ specifically. Concrete examples include: 

- walking robots (autonomous and remote control bipeds, quadrupeds or hexapods)
- driving robots (autonomous and remote control rovers)
- flying robots (autonomous and remote control single and multi-rotor helicopter)
- water based robots (underwater rovs, surface boat-likes)

`temporal` allows for sub-millisecond task scheduling through us of the resolution method. 

`temporal` is not good for sparse task scheduling. 


## Presentations

- [EmpireJS](https://dl.dropboxusercontent.com/u/3531958/empirejs/index.html)
- [CascadiaJS](https://dl.dropboxusercontent.com/u/3531958/cascadiajs/index.html)




## Getting Started

```bash
npm install temporal
```


## Examples

```javascript
var temporal = require("temporal");

temporal.on("idle", function() {
  console.log("Temporal is idle");  
});

// Wait 500 milliseconds, execute a task
temporal.delay(500, function() {

  console.log("500ms later...");

});

// Loop every n milliseconds, executing a task each time
temporal.loop(500, function() {

  console.log("Every 500ms...");

  // |this| is a reference to the temporal instance
  // use it to cancel the loop by calling:
  //
  this.stop();

  // The number of times this loop has been executed:
  this.called; // number

  // The first argument to the callback is the same as |this|
});


// Queue a sequence of tasks: delay, delay
// Each delay time is added to the prior delay times.
temporal.queue([
  {
    delay: 500,
    task: function() {
      // Executes 500ms after temporal.queue(...) is called
    }
  },
  {
    delay: 500,
    task: function() {
      // Executes 1000ms after temporal.queue(...) is called

      // The last "delay" task will emit an "ended" event
    }
  }
]);

// Queue a sequence of tasks: delay then loop
// Each delay time is added to the prior delay times.
temporal.queue([
  {
    delay: 500,
    task: function() {
      // Executes 500ms after temporal.queue(...) is called
    }
  },
  {
    loop: 100,
    task: function() {
      // Executes 600ms after temporal.queue(...) is called

      // Executes every 100ms thereafter.
    }
  }
]);
```

```javascript
var temporal = require("temporal");

temporal.on("idle", function() {
  console.log("Temporal is idle");  
});

// Set temporal resolution to 0.1ms
temporal.resolution(0.1);

// Wait 0.7 milliseconds, execute a task
temporal.delay(0.7, function() {

  console.log("0.7ms later...");

});
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).


## License
See LICENSE file.

