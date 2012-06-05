var dice = require('./diceParser');

var regex = /\[[\ddDeE\+\*\-\/\.\(\)\s]*\]/g;

function formatRoll(roll) {
	if(typeof roll[1] === 'string') {
		return roll[0] + ' failed: ' + roll[1];
	} else {
		//return roll[0] + ' => ' + (typeof roll[1] === 'number' ? roll[1] : roll[1][1]) + ' => ' + (typeof roll[1] === 'number' ? roll[1] : roll[1][0]);
		return roll[0] + ' => ' + roll[1][1] + ' => ' + roll[1][0];
	}

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
	try {
		return [expr, dice(expr)];
	} catch (err) {
		return [expr, err];
	}
}

var dicep = {
	listeners: {
		message: parseLine
	}
,	reload: ['./diceParser'].map(require.resolve)
,	defaultOptions: {
		cap: [100]
	}
,	initPlugin: function() {
		dice.options = dicep.options;
	}
};

module.exports = dicep;
