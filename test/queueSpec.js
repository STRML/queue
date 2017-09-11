var queue = require('../');
const assert = require('assert');

describe('queue', function(endTest) {
  it('runs through three items linearly', function(endTest) {
    var expected = [ 'one', 'two', 'three' ];
    var actual = [];
    var q = queue();
    var numEndHandlers = 0;

    function done() {
      numEndHandlers++;
      assert.strictEqual(actual.length, numEndHandlers);

      for (var i in actual) {
        assert.strictEqual(actual[i], expected[i]);
      }

      if (numEndHandlers === 3) endTest();
    }

    q.push(function(cb) {
      actual.push('one');
      cb();
      done();
    });

    q.push(function(cb) {
      actual.push('two');
      cb();
      done();
    });

    setTimeout(function() {
      q.push(function(cb) {
        actual.push('three');
        cb();
        done();
      });
    }, 10);
  });

  it('Runs through three items concurrently', function(endTest) {
    var actual = [];
    var q = queue();

    q.push(function(cb) {
      setTimeout(function() {
        actual.push('one');
        cb();
      }, 0);
    });

    q.push(function(cb) {
      setTimeout(function() {
        actual.push('three');
        cb();
      }, 20);
    });

    q.push(function(cb) {
      setTimeout(function() {
        actual.push('two');
        cb();
      }, 10);
    });

    q.run(function() {
      var expected = [ 'one', 'two', 'three' ];
      assert.strictEqual(actual.length, expected.length);

      for (var i in actual) {
        var a = actual[i];
        var e = expected[i];
        assert.strictEqual(a, e);
      }
      endTest();
    });
  });

  it('has a length property', function(endTest) {
    var q = queue();

    q.push(function(cb) {
      setTimeout(function() {
        assert.strictEqual(q.length, 3);
        cb();
        assert.strictEqual(q.length, 2);
      }, 0);
    });

    q.push(function(cb) {
      setTimeout(function() {
        assert.strictEqual(q.length, 2);
        cb();
        assert.strictEqual(q.length, 1);
      }, 10);
    });

    q.push(function(cb) {
      setTimeout(function() {
        assert.strictEqual(q.length, 1);
        cb();
        assert.strictEqual(q.length, 0);
      }, 20);
    });

    q.run(function() {
      assert.strictEqual(q.pending, 0);
      assert.strictEqual(q.length, 0);
      endTest();
    });

    assert.strictEqual(q.pending, 3);
    assert.strictEqual(q.length, 3);
  });

  it('has a length property that follows concurrency', function(endTest) {
    var q = queue({ concurrency: 1 });

    q.push(function(cb) {
      setTimeout(function() {
        assert.strictEqual(q.length, 3);
        cb();
        assert.strictEqual(q.length, 2);
      }, 0);
    });

    q.push(function(cb) {
      setTimeout(function() {
        assert.strictEqual(q.length, 2);
        cb();
        assert.strictEqual(q.length, 1);
      }, 10);
    });

    q.push(function(cb) {
      setTimeout(function() {
        assert.strictEqual(q.length, 1);
        cb();
        assert.strictEqual(q.length, 0);
      }, 20);
    });

    q.run(function() {
      assert.strictEqual(q.pending, 0);
      assert.strictEqual(q.length, 0);
      endTest();
    });

    assert.strictEqual(q.pending, 1);
    assert.strictEqual(q.length, 3);
  });

  it('Calls cb when empty', function(endTest) {
    var q = queue();

    q.push(function(cb) {
      assert(q);
      cb();
    });

    q.run(function() {
      assert(q);

      q.run(function() {
        assert(q);
        endTest();
      });
    });
  });
});
