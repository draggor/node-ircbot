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
	},
	t4: function() {
		var m = {
			a: {s:50},
			b: {s:100},
			c: {s:0},
			d: {s:75}
		};
		console.log(Object.keys(m).map(function(k) { return [k, m[k]]; }).max(function(a, b) {
			return a[1].s > b[1].s ? a : b;
		}));
	}
};

Array.prototype.max = function(c) {
        c = c || function(a, b) { return a > b ? a : b; };
        m = this[0];
        for(var i = 1; i < this.length; i++) {
                m = c(this[i], m);
        }
        return m;
};

module.exports = tests;

r = repl.start();
r.context.t = tests;
r.context.f = f;
r.context.farkle = farkle;
