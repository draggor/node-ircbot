// Parses the this grammar and calculates the result:
//
//     expr   ::= '[' expr '+' term ']' | '[' term ']'
//     term   ::= term '*' form | form
//     form   ::= form 'd' factor | factor
//     factor ::= '(' expr ')' | number
//     number ::= '-' digit+ | digit+
//     digit  ::= '0' | '1' | ... | '9'

var ReParse = require('reparse').ReParse;

module.exports = read;

var self = module.exports;

function read(input) {
	return (new ReParse(input, true)).start(brackets);
}

function brackets() {
	return this.between(/^\[/, /^\]/, expr);
}

function expr() {
	return this.chainl1(term, addop);
}

function term() {
	return this.chainl1(form, mulop);
}

function form() {
	return this.chainl1(forme, diceop);
}

function forme() {
	return this.chainl1(factor, explodeop);
}

function factor() {
	return this.choice(group, number);
}

function group() {
	return this.between(/^\(/, /^\)/, expr);
}

function number() {
	return parseFloat(this.match(/^\-?\d*\.?\d+/));
}

function diceop() {
	return OPS[this.match(/^[dD]/)];
}

function explodeop() {
	return OPS[this.match(/^[eE]/)];
}

function mulop() {
	return OPS[this.match(/^[\*\/]/)];
}

function addop() {
	return OPS[this.match(/^[\+\-]/)];
}

function dice(a, b) {
	if(a > self.options.cap[0]) {
		throw a + ' is greater than limit of ' + self.options.cap[0];
	}
	var sum = [0, []];
	for(var i = 0; i < a; i++) {
		var r = Math.floor(Math.random() * b) + 1;
		sum[0] += r;
		sum[1].push(r);
	}
	return sum;
}

function explode(a, b) {
	if(a > self.options.cap[0]) {
		throw a + ' is greater than limit of ' + self.options.cap[0];
	}
	var sum = [0, []];
	for(var i = 0; i < a; i++) {
		var r;
		do {
			r = Math.floor(Math.random() * b) + 1;
			sum[0] += r;
			sum[1].push(r);
		} while (r === b && b > 1);
	}
	return sum;
}

function objOp(op) {
	return function(a, b) {
		if(typeof a === 'object' && typeof b === 'number') {
			a[0] = op(a[0], b);
			a[1].push(b);
			return a;
		} else if(typeof a === 'object' && typeof b === 'object') {
			a[0] = op(a[0], b[0]);
			a[1] = a[1].concat(b[1]);
			return a;
		} else if(typeof a === 'number' && typeof b === 'object') {
			b[0] = op(a, b[0]);
			b[1].unshift(a);
			return b;
		} else if(typeof a === 'number' && typeof b === 'number') {
			return [op(a, b), [a, b]];
		}
	};
}

function diceOp(a, b) {
	return objectify(a, b, dice);
}

function explodeOp(a, b) {
	return objectify(a, b, explode);
}

function objectify(a, b, func) {
	if(typeof a === 'object' && typeof b === 'number') {
		d = func(a[0], b);
		a[0] = d[0];
		a[1] = a[1].concat(d[1]);
		return a;
	} else if(typeof a === 'object' && typeof b === 'object') {
		d = func(a[0], b[0]);
		a[0] = d[0];
		a[1] = a[1].concat(d[1]).concat(b[1]);
		return a;
	} else if(typeof a === 'number' && typeof b === 'object') {
		d = func(a, b[0]);
		b[0] = d[0];
		b[1] = d[1].concat(b[1]);
		return b;
	} else if(typeof a === 'number' && typeof b === 'number') {
		return func(a, b);
	}
}
function add(a, b) {
	return a + b;
}

function sub(a, b) {
	return a - b;
}

function mul(a, b) {
	return a * b;
}

function div(a, b) {
	return a / b;
}

var OPS = {
	'd': diceOp,
	'D': diceOp,
	'e': explodeOp,
	'E': explodeOp,
	'+': objOp(add),
	'-': objOp(sub),
	'*': objOp(mul),
	'/': objOp(div)
};
