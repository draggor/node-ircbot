var farkle = require('./')
  , repl = require('repl')
  ;

farkle.bot = {
	say: function(to, msg) {
		console.log(to + ': ' + msg);
	}
};

var f = function(from, msg) {
	farkle.listeners.message(from, '#chan', msg);
}

var tests = {
	t1: function() {
		f('neel', '!join');
	},
	t2: function() {
		f('neel', '!new');
	},
	t3: function() {
		f('neel', '!new');
		f('neel', '!join');
		f('bob', '!join');
		f('neel', '!start');
	}
};

module.exports = tests;

r = repl.start();
r.context.t = tests;
r.context.f = f;
r.context.farkle = farkle;
