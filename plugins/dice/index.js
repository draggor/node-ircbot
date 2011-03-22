var plugin = require('../../plugin')
  , dice = require('./dice');

var regex = /\[[\dd\+\*\-\/\.\(\)]*\]/g;

function parseLine(from, to, msg) {
	var roll = msg.match(regex).map(rollDice);
	dicep.bot.client.say(to, roll);
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
