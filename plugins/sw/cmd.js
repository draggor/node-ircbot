var util = require('../../util')
  ;

var cmds = {};

exports.run = function(info) {
	var cmd = cmds[info.cmdstr];
	if(cmd) {
		cmd(info);
	}
};

var cardValues = [ 2,3,4,5,6,7,8,9,'T','J','Q','K','A' ];
var cardSuits = [ 'D', 'C', 'H', 'S' ];
var cardSuitSymbols = {
	'D': '&diams;'
,	'C': '&clubs;'
,	'H': '&hearts;'
,	'S': '&spades;'
,	'R': 'R'
,	'B': 'B'
};
var cards = [ 'JR', 'JB' ];
for(var val in cardValues) {
	for(var suit in cardSuits) {
		cards.push(cardValues[val] + cardSuits[suit]);
	}
}

var deck = util.randomize(cards.slice());

cmds.card = function(info) {
	var c = cards[Math.floor(Math.random() * 54)];
	info.bot.say(info.to, info.from + '\'s random card is: ' + c);
};

cmds.draw = function(info) {
	var c = '';
	if(info.rest) {
		var num = parseInt(info.rest);
		if(num > deck.length) {
			deck = util.randomize(cards.slice());
			info.bot.say(info.to, 'Not enough cards left, shuffling!');
		}
		for(var i = 0; i < num; i++) {
			c += deck.pop() + ' ';
		}
	} else {
		c = deck.pop();
	}
	info.bot.say(info.to, info.from + ' drew: ' + c);
	if(deck.length == 0) {
		deck = util.randomize(cards.slice());
		info.bot.say(info.to, 'Last card drawn, shuffling!');
	}
};

cmds.shuffle = function(info) {
	deck = util.randomize(cards.slice());
	info.bot.say(info.to, 'Deck shuffled.');
};
