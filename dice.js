/// calc -- a simple calculator
//
// Parses the this grammar and calculates the result:
//
//     expr   ::= '[' expr '+' term ']' | '[' term ']'
//     term   ::= term '*' form | form
//     form   ::= form 'd' factor | factor
//     factor ::= '(' expr ')' | number
//     number ::= '-' digit+ | digit+
//     digit  ::= '0' | '1' | ... | '9'

ReParse = require('reparse').ReParse;

module.exports = read;

function read(input) {
	return (new ReParse(input, true)).start(brackets);
}

function line() {
	return this.match(/\[[\dd\+\*\-\/\.\(\)]*\]/);
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
	return this.chainl1(factor, diceop);
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

function mulop() {
	return OPS[this.match(/^[\*\/]/)];
}

function addop() {
	return OPS[this.match(/^[\+\-]/)];
}

function dice(a, b) {
	var sum = [0, []];
	for(var i = 0; i < a; i++) {
		var r = Math.floor(Math.random() * b) + 1;
		sum[0] += r;
		sum[1].push(r);
	}
	return sum;
}

var OPS = {
	'd': dice,
	'D': dice,
	'+': function(a, b) { return a + b; },
	'-': function(a, b) { return a - b; },
	'*': function(a, b) { return a * b; },
	'/': function(a, b) { return a / b; }
};
