var plugin = require('../../plugin')
  , dice = require('./dice');

var regex = /\[[\dd\+\*\-\/\.\(\)]*\]/g;

function parseLine(from, to, msg) {
	var exprs = msg.match(regex);
	if(exprs) {
		dicep.bot.client.say(to, exprs.map(rollDice));
	}
}

function rollDice(expr) {
	return [expr, dice.read(expr)];
}

var dicep = {
	setBot: function(bot) {
		dicep.bot = bot;
	},
	listeners: {
		'*': parseLine
	}
};

module.exports = dicep;
