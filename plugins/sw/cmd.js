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
var nicksToDecks = {};

cmds.card = function(info) {
	var c = cards[Math.floor(Math.random() * 54)];
	info.bot.say(info.to, info.from + '\'s random card is: ' + c);
};

cmds.init = function(info) {
	var c = '';
	if(info.rest) {
		var num = parseInt(info.rest);
		if(num > deck.length) {
			deck = util.randomize(cards.slice());
			info.bot.say(info.to, 'Not enough cards left, shuffling initiative deck!');
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
		info.bot.say(info.to, 'Last card drawn, shuffling initiative deck!');
	}
};

cmds.initshuffle = function(info) {
	deck = util.randomize(cards.slice());
	info.bot.say(info.to, 'Initiative deck shuffled.');
};

cmds.shuffle = function(info) {
	nicksToDecks[info.from] = util.randomize(cards.slice());
	info.bot.say(info.to, info.to + '\'s deck shuffled.');
};

cmds.draw = function(info) {
	var c = ''
	  , d = nicksToDecks[info.from] = nicksToDecks[info.from] || util.randomize(cards.slice())
	  ;
	 
	if(info.rest) {
		var num = parseInt(info.rest);
		if(num > d.length) {
			d = nicksToDecks[info.from] = util.randomize(cards.slice());
			info.bot.say(info.to, 'Not enough cards left, shuffling ' + info.from + '\'s deck!');
		}
		for(var i = 0; i < num; i++) {
			c += d.pop() + ' ';
		}
	} else {
		c = d.pop();
	}
	info.bot.say(info.to, info.from + ' drew: ' + c);
	if(d.length == 0) {
		d = nicksToDecks[info.from] = util.randomize(cards.slice());
		info.bot.say(info.to, 'Last card drawn, shuffling ' + info.from + '\'s deck!');
	}
};
