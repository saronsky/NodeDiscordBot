var collect = require('../');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var naan = require('naan');
var async = require('async');

describe('collect', function() {
  var ws1, ws2, ws3;
  beforeEach(function() {
    ws1 = fs.createWriteStream('ws1.txt');
    ws2 = fs.createWriteStream('ws2.txt');
    ws3 = fs.createWriteStream('ws3.txt');
  });
  afterEach(function(done) {
    var unlink = naan.curry(naan.curry, fs.unlink);
    async.parallel([
      unlink('ws1.txt'), unlink('ws2.txt'), unlink('ws3.txt')
    ], done);
  });
  it('should wait for a bunch of streams to finish', function(done) {
    var collection = collect.collection();
    collection.push(ws1);
    ws1.write("thing");
    ws2.write("other_thing");
    ws3.write("extra thing");
    collection.push(ws2);
    ws3.write("another thing");
    collection.push(ws3);

    collection.collect(function(cb) {
      assert(!ws1.writable);
      assert(!ws2.writable);
      assert(!ws3.writable);

      async.map(['ws1.txt', 'ws2.txt', 'ws3.txt'],
        naan.ncurry(fs.readFile, 'utf8', 1),
        function(e, d) {
          assert.deepEqual([
            'thing',
            'other_thing',
            'extra thinganother thing'
          ], d);
          done();
        });
    });

    ws1.end();
    ws2.end();
    ws3.end();
  });
  it('should also work with a terse syntax', function(done) {
    ws1.write("thing");
    ws2.write("other_thing");
    ws3.write("extra thing");
    ws3.write("another thing");

    collect([ws1, ws2, ws3], function(cb) {
      assert(!ws1.writable);
      assert(!ws2.writable);
      assert(!ws3.writable);

      async.map(['ws1.txt', 'ws2.txt', 'ws3.txt'],
        naan.ncurry(fs.readFile, 'utf8', 1),
        function(e, d) {
          assert.deepEqual([
            'thing',
            'other_thing',
            'extra thinganother thing'
          ], d);
          done();
        });
    });

    ws1.end();
    ws2.end();
    ws3.end();
  });
});
