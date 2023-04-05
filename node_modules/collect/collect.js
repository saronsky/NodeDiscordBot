var async = require('async');

var collection = function collection() {
  var collection = [];
  return {
    push: collection.push.bind(collection),
    collection: collection,
    collect: function(cb) {
      async.parallel(collection.map(function(stream) {
        var waiter = false;

        var finished = function() {
          if (typeof waiter == 'function') waiter();
          else waiter = true;
        };

        stream.on('close', finished);
        stream.on('end', finished);

        var cb = function(cb) { 
          if (waiter === true) cb();
          else waiter = cb;
        };

        return cb;
      }), cb);
    }
  }
};

module.exports = function collect(streams, cb) {
  var coll = collection();
  streams.forEach(function(stream) { coll.push(stream) });
  coll.collect(cb);
};

module.exports.awaiter = require('./awaiter');

module.exports.collection = collection;
