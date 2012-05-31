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
			  bot: pingp.bot
		  }
		  ;

		commands.run(info);
	}
}

function activity(from, to, msg) {
	
}

// TODO: Fix this crap
function updateNick(oldNick, newNick, channels) {
	for(var k in commands.pingFrom[oldNick]) {
		commands.pingFrom[oldNick][k].from = newNick;
	}
	for(var k in commands.PingTo[oldNick]) {
		commands.pingTo[oldNick][k].to = newNick;
	}
	updateKey(commands.pingFrom, oldNick, newNick, pingMerge);
	updateKey(commands.pingTo, oldNick, newNick, pingMerge);
}

function pingMerge(o, n) {
	for(var k in o) {
		n[k] = o[k].concat(n[k]);
	}
}

function updateKey(m, o, n, merge) {
	merge = merge || function(a, b) { return a; };
	if(m[o]) {
		if(m[n]) {
			m[n] = merge(m[o], m[n]);
		} else {
			m[n] = m[o];
		}
		delete m[o];
	}
	return m;
}

var pingp = {
	listeners: {
		message: [parseLine, activity]
	,	nick: updateNick
	},
	reload: ['./cmd'].map(require.resolve)
};

module.exports = pingp;
module.exports.u = updateKey;
