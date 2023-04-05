var assert = require('assert');
var awaiter = require('../').awaiter;

describe('awaiter', function() {
  it('should call back once some callbacks have completed', function(done) {
    var waiter = awaiter('potato', 'carrot', 'cabbage', function() {
      done();
    });
    setTimeout(waiter('potato'), 20);
    setTimeout(waiter('carrot'), 30);
    setTimeout(waiter('cabbage'), 40);
  });

  it('should call back using the staggered syntax', function(done) {
    var waiter = awaiter('potato', 'carrot', 'cabbage');
    setTimeout(waiter('potato'), 20);
    setTimeout(waiter('carrot'), 30);
    setTimeout(waiter('cabbage'), 40);
    waiter.then(function() { done() });
  });
  
  it('should call back with the results of the functions', function(done) {
    var waiter = awaiter('data', 'entities', function(err, results) {
      assert(!err);
      assert(results.data == 'I AM A DATA, 123');
      assert(results.entities[0] == 'I AM THE FIRST ENTITY, HALOO');
      assert(results.entities[1] == 'I AM THE SECOND ENTITY, HEI');
      done();
    });

    setTimeout(function() {
      waiter('data')(null, 'I AM A DATA, 123');
    }, 10);
    setTimeout(function() {
      waiter('entities')(null, [
        'I AM THE FIRST ENTITY, HALOO',
        'I AM THE SECOND ENTITY, HEI'
      ]);
    }, 25);
  });

  it('should call back immediately and only once when an error is raised', 
  function(done) {
    var waiter = awaiter('dangerous', 'scary', function(err, results) {
      assert(err instanceof Error);
      assert(err.message == 'OH DEAR');
      done();
    });

    waiter('dangerous')(new Error('OH DEAR'));
    waiter('scary')();
  });

  it('should be able to receive extra await requests after creation',
  function(done) {
    var waiter = awaiter('potato', function(err, results) {
      assert(results.potato == 'mashy');
      assert(results.peas = 'mushy');
      done();
    });

    waiter.alsoAwait('peas');
    waiter('potato')(null, 'mashy');
    waiter('peas')(null, 'mushy');
  });

  it('should fire a cb immediately when added if all cbs had already fired',
  function(done) {
    var waiter = awaiter('potato');

    waiter.alsoAwait('peas');
    waiter('potato')(null, 'mashy');
    waiter('peas')(null, 'mushy');

    waiter.then(function(err, results) {
      assert(results.potato == 'mashy');
      assert(results.peas = 'mushy');
      done();
    });
  });

  describe('num', function() {
    it('should call back given a number of callbacks', function(done) {
      var waiter = awaiter.num(5);
      var count = 0;
      waiter.then(function() {
        assert(count == 5);
        done();
      });
      
      ++count, waiter()();
      ++count, waiter()();
      ++count, waiter()();
      ++count, waiter()();
      ++count, waiter()();
    });
    
    it('should call back given a number of callbacks and return stuff', 
    function(done) {
      var waiter = awaiter.num(5);
      var count = 0;
      waiter.then(function(err, res) {
        assert(count == 5);
        assert(!err);
        assert(res.join('') == 'Nytelsesmiddelarbeiderforbundet');
        done();
      });
      
      ++count, waiter()(null, 'Nytelses');
      ++count, waiter()(null, 'middel');
      ++count, waiter()(null, 'arbeider');
      ++count, waiter()(null, 'forbund');
      ++count, waiter()(null, 'et');
    });
    
    it('should call back more than once', 
    function(done) {
      var waiter = awaiter.num(5);
      var count = 0;
      var cbnum = 0;
      waiter.then(function(err, res) {
        assert(count == 5);
        assert(!err);
        assert(res.join('') == 'Nytelsesmiddelarbeiderforbundet');
        cbnum++;
      });
      waiter.then(function(err, res) {
        assert(count == 5);
        assert(!err);
        assert(res.join('') == 'Nytelsesmiddelarbeiderforbundet');
        cbnum++;
      });
      
      ++count, waiter()(null, 'Nytelses');
      ++count, waiter()(null, 'middel');
      ++count, waiter()(null, 'arbeider');
      ++count, waiter()(null, 'forbund');
      ++count, waiter()(null, 'et');

      assert(cbnum == 2);
      done();
    });

    it('should be consistent with errors', function() {
      var firstWasErr = false;
      var secondWasErr = false;
      var thirdWasErr = false
      var waiter = awaiter.num(3,function(err) { firstWasErr = !!err; });

      waiter.then(function(err) { secondWasErr = !!err });
      waiter()(true);
      assert(firstWasErr);
      assert(secondWasErr);

      waiter()(null, 'potato');
      waiter.then(function(err) { thirdWasErr = !!err });

      assert(thirdWasErr);
    });

    it('should support arbitrary counts', function(done) {
      var waiter = awaiter.num();

      waiter()(null, 'potato')
      waiter()(null, 'peas')
      waiter()(null, 'pie')
      
      var cbcalled = false;
      waiter.then(function(err, res) {
        assert(res.length == 3);
        assert(res[0] == 'potato');
        assert(res[1] == 'peas');
        assert(res[2] == 'pie');
        cbcalled = true;
      });

      waiter()(null, 'superman');

      waiter.then(function(err,res) {
        assert.deepEqual(res, ['potato', 'peas', 'pie', 'superman']);
        assert(cbcalled == true);
        done();
      });
    });
  });
});
