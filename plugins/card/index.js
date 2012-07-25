var commands = require('./cmd')
  , util = require('../../util')
  ;

function parseLine(from, to, msg) {
	if(msg[0] === cardp.cmdPrefix) {
		var sp = util.split(msg, ' ', 2)
		  , info = {
			  from: from,
			  to: to,
			  msg: msg,
			  cmdstr: sp[0].substr(1),
			  rest: sp[1],
			  bot: cardp.bot
		  }
		  ;

		commands.run(info);
	}
}

var cardp = {
	listeners: {
		message: parseLine
	}
,	reload: ['./cmd', './decks'].map(require.resolve)
,	initPlugin: function() {
		commands.setDefaultDeck(cardp.options.deck);
	}
};

module.exports = cardp;
