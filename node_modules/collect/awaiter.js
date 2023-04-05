function awaiter() {
  var args = [].slice.call(arguments);
  var cbs = [];
  var cb = args.pop();
  if (typeof cb == 'function') cbs.push(cb);
  else if (cb != null) args.push(cb);
  var results = {};
  var flags = {};

  args.forEach(function(flagName) {
    flags[flagName] = false;
  });

  var collectedError = null;

  var then = function(err, res) {
    if (!cbs.length) return;
    while (cbs.length) cbs.pop()(err, res);
  };

  var collect = function() {
    if (!collectedError) {
      var hasTriggered = true;
      args.forEach(function(flagName) {
        hasTriggered = hasTriggered && flags[flagName];
      });
    }

    if (hasTriggered || collectedError) then(collectedError, results);
  };

  var createCallback = function(flagName) {
    return function(err) {
      if (collectedError) return;
      else if (err) return collectedError = err, collect();
      
      var args = [].slice.call(arguments, 1);

      flags[flagName] = true;
      results[flagName] = args.length == 1 ? args[0] : args;

      collect();
    };
  };

  createCallback.then = function(newCb) { 
    cbs.push(newCb);
    collect();
  };
  createCallback.alsoAwait = function(newThing) { args.push(newThing) };

  return createCallback;
};

awaiter.num = function(count, cb) {
  if (typeof count == 'function') cb = count, count = 0;
  else if (count == null) count = 0;

  var nums = [], i = -1;
  while (++i < count) nums.push(i);

  function wrapCallback(cb) {
    return function(err, res) {
      if (err) return cb(err);
      var i = -1;
      var resArr = [];
      while (++i < count) resArr.push(res[i]);
      cb(null, resArr);
    }
  };

  if (cb) nums.push(wrapCallback(cb));
  var awaiterInst = awaiter.apply(this, nums);

  i = -1;
  var createNumberedCallback = function() {
    if (++i >= count) {
      awaiterInst.alsoAwait(count);
      ++count;
    }
    return awaiterInst(i);
  };

  createNumberedCallback.then = function(cb) { 
    awaiterInst.then(wrapCallback(cb));
  };

  return createNumberedCallback;
};

module.exports = awaiter;
