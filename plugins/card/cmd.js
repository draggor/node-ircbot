var util = require('../../util')
  , decks = require('./decks')
  ;

var cmds = {};

exports.run = function(info) {
	var cmd = cmds[info.cmdstr];
	if(cmd) {
		cmd(info);
	}
};

var selectedDeck;// = cardp.options.deck && decks[cardp.options.deck[0]] ? decks[cardp.options.deck[0]] : decks[52]; //Don't modify this!
var deck;// = util.randomize(selectedDeck.slice());
var nicksToDecks = {};

exports.setDefaultDeck = function(defaultDeck) {
	selectedDeck = defaultDeck && decks[defaultDeck[0]] ? decks[defaultDeck[0]] : decks[52];
	deck = util.randomize(selectedDeck.slice());
};

cmds.card = function(info) {
	var c = selectedDeck[Math.floor(Math.random() * selectedDeck.length)];
	info.bot.say(info.to, info.from + '\'s random card is: ' + c);
};

cmds.list = function(info) {
	var str = 'Available decks: ';
	for(var k in decks) {
		str += k + ' ';
	}
	info.bot.say(info.to, str);
};

cmds.init = function(info) {
	var c = '';
	if(info.rest) {
		var num = parseInt(info.rest);
		if(num > deck.length) {
			deck = util.randomize(selectedDeck.slice());
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
		deck = util.randomize(selectedDeck.slice());
		info.bot.say(info.to, 'Last card drawn, shuffling initiative deck!');
	}
};

cmds.initshuffle = function(info) {
	deck = util.randomize(selectedDeck.slice());
	info.bot.say(info.to, 'Initiative deck shuffled.');
};

cmds.shuffle = function(info) {
	nicksToDecks[info.from] = util.randomize(selectedDeck.slice());
	info.bot.say(info.to, info.from + '\'s deck shuffled.');
};

cmds.draw = function(info) {
	var c = ''
	  , d = nicksToDecks[info.from] = nicksToDecks[info.from] || util.randomize(selectedDeck.slice())
	  ;
	 
	if(info.rest) {
		var num = parseInt(info.rest);
		if(num > d.length) {
			d = nicksToDecks[info.from] = util.randomize(selectedDeck.slice());
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
		d = nicksToDecks[info.from] = util.randomize(selectedDeck.slice());
		info.bot.say(info.to, 'Last card drawn, shuffling ' + info.from + '\'s deck!');
	}
};
