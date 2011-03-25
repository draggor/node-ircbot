var dice = require('./diceParser');

console.log('Dice Plugin Loaded');

var regex = /\[[\dd\+\*\-\/\.\(\)\s]*\]/g;

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
		if(to === dicep.bot.nick) {
			dicep.bot.say(from, say);
		} else {
			dicep.bot.say(to, say);
		}
	}
}

function rollDice(expr) {
	return [expr, dice(expr)];
}

var dicep = {
	listeners: {
		'message': parseLine
	},
	reload: ['./diceParser'].map(require.resolve)
};

module.exports = dicep;
