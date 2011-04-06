var commands = require('./cmd')
  , util = require('../../util')
  ;

function parseLine(from, to, msg) {
	if(msg[0] === '!') {
		var sp = util.split(msg, ' ', 2)
		  , info = {
			  from: from,
			  to: to,
			  msg: msg,
			  cmdstr: sp[0].substr(1),
			  rest: sp[1],
			  bot: adminp.bot
		  }
		  ;

		commands.run(info);
	}
}

var adminp = {
	listeners: {
		message: parseLine
	},
	reload: ['./cmd'].map(require.resolve)
};

module.exports = adminp;
