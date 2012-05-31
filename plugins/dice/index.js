var dice = require('./diceParser');

var regex = /\[[\dd\+\*\-\/\.\(\)\s]*\]/g;

function formatRoll(roll) {
	return roll[0] + ' => ' + (typeof roll === 'number' ? roll : roll[1][1]) + ' => ' + (typeof roll === 'number' ? roll : roll[1][0]);
}

function parseLine(from, to, msg) {
	var exprs = msg.match(regex);
	if(exprs) {
		var rolls = exprs.map(rollDice)
		  , say = from + ': '
		  ;

		say += formatRoll(rolls[0]);
		for(var i = 1; i < rolls.length; i++) {
			say += ', ' + formatRoll(rolls[i]);
		}
		dicep.bot.respond({from: from, to: to}, say);
	}
}

function rollDice(expr) {
	return [expr, dice(expr)];
}

var dicep = {
	listeners: {
		message: parseLine
	},
	reload: ['./diceParser'].map(require.resolve)
};

module.exports = dicep;
