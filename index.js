'use strict';

function Queue(options) {
  if (!(this instanceof Queue)) {
    return new Queue(options);
  }

  options = options || {};
  this.concurrency = options.concurrency || Infinity;
  this.pending = 0;
  this.running = false;
  this.jobs = [];
  this.cbs = [];
  this.onDone = onDone.bind(this);
}

var arrayAddMethods = [
  'push',
  'unshift',
  'splice'
];

arrayAddMethods.forEach(function(method) {
  Queue.prototype[method] = function() {
    var methodResult = Array.prototype[method].apply(this.jobs, arguments);
    this.run();
    return methodResult;
  };
});

Object.defineProperty(Queue.prototype, 'length', {
  get: function() {
    return this.pending + this.jobs.length;
  }
});

Queue.prototype.run = function(cb) {
  var self = this;
  self.running = true;
  if (cb) self.cbs.push(cb);

  if (self.pending === self.concurrency) {
    return;
  }
  if (self.jobs.length) {
    var job = self.jobs.shift();
    self.pending++;
    job(this.onDone);
    self.run();
  }

  if (self.pending === 0) {
    while (self.cbs.length) {
      self.cbs.pop()();
    }
  }
};

function onDone() {
  this.pending--;
  this.run();
}

module.exports = Queue;
