var plugin = require('../../plugin')
  , dice = require('./dice')
  ;

var regex = /\[[\dd\+\*\-\/\.\(\)]*\]/g;

function parseLine(from, to, msg) {
	var exprs = msg.match(regex);
	if(exprs) {
		var rolls = exprs.map(rollDice)
		  , say = from + ': '
		  ;
		for(var i = 0; i < rolls.length; i++) {
			say += rolls[i][0]
			     + ' => '
			     + rolls[i][1][1]
			     + ' => '
			     + rolls[i][1][0]
			     + ' <|> '
			     ;
		}
		dicep.bot.client.say(to, say);
	}
}

function rollDice(expr) {
	return [expr, dice(expr)];
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
