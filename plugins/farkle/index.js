var util = require('../../util');

Array.prototype.max = function(c) {
	c = c || function(a, b) { return a > b; };
	m = this[0];
	for(var i = 1; i < this.length; i++) {
		m = c(this[i], m);
	}
	return m;
};

var games = {};

function Game(limit) {
	this.limit = limit || 10000;
	this.players = {};
	this.order = [];
	this.state = ['join', 'start'];
	this.lastRoll;
	this.runningTotal = 0;
	this.dice;
}

Game.prototype.shift = function() {
	this.order.push(this.order.shift());
};

Game.prototype.farkle = function() {
	this.lastRoll = [];
	this.runningTotal = 0;
	this.dice = 0;
	this.state = ['roll'];
	this.shift();
};



Game.prototype.end = function(info) {
	var winner = this.winner();
	
	info.bot.say(info.to, winner[0] + ' is the winner with ' + winner[1].score + '!  GAME OVER!');
	delete games[info.to];
};

Game.prototype.winner = function() {
	var g = this;
	return g.order.map(function(k) { return [k, g.players[k]]; }).max(function(a, b) {
		return a[1].score > b[1].score;
	});
};

function Player(nick) {
	this.nick = nick;
	this.score = 0;
	this.farkle = 0;
	this.points = false;
}

function req(func) {
	return function(info) {
		var game = games[info.to];
		if(game && !!~game.state.indexOf(info.cmdstr)) {
			func(info, game);
		}
	};
}

function reqp(func) {
	return function(info) {
		var game = games[info.to];
		if(game && !!~game.state.indexOf(info.cmdstr) && game.order[0] === info.from) {
			var player = game.players[game.order[0]];
			func(info, game, player);
		}
	};
}

function parseLine(from, to, msg) {
	if(msg[0] === '!') {
		var sp = util.split(msg, ' ', 2)
		  , info = {
			  from: from,
			  to: to,
			  msg: msg,
			  cmdstr: sp[0].substr(1),
			  rest: sp[1] ? sp[1].trim() : sp[1],
			  bot: farklep.bot
		  }
		  ;

		runCmd(info);
	}
}

function runCmd(info) {
	var cmd = cmds[info.cmdstr];
	if(cmd) {
		cmd(info);
	}
}

function roll(n) {
	return [0,0,0,0,0,0].slice(6 - n).map(function() { return Math.floor(Math.random() * 6) + 1; });
}

function length(a) {
	return a.length;
}

function score(roll) {
	var sum = 0
	  , group = util.group(roll.slice().sort())
	  , hasZero = false;

	if(group.length === 6) {
		return {
			total: 1500,
			hasZero: false
		};
	} else if(group.map(length).toString() === '2,2,2') {
		return {
			total: 500,
			hasZero: false
		};
	}

	var sr = group.map(scoreGroup);
	for(var i = 0; i < sr.length; i++) {
		var gs = sr[i]();
		if(gs == 0) {
			hasZero = true;
		} else {
			sum += sr[i]();
		}
	}
	return {
		total: sum,
		hasZero: hasZero
	};
}

function zero () { return 0; }
function x2 (f) { return function() { return f() * 2}; }

var scores = {
	'2': zero,
	'3': zero,
	'4': zero,
	'6': zero,
	'5': function() { return 50; },
	'1': function() { return 100; },
	'N,N': x2,
	'1,1,1': function() { return 1000; },
	'2,2,2': function() { return 200; },
	'3,3,3': function() { return 300; },
	'4,4,4': function() { return 400; },
	'5,5,5': function() { return 500; },
	'6,6,6': function() { return 600; },
	'N,N,N,N': x2,
	'N,N,N,N,N': x2,
	'N,N,N,N,N,N': x2
};

function scoreGroup(group) {
	if(group.length === 1 || group.length === 3) {
		return scores[group.toString()];
	} else {
		return scores[group.toString().replace(/\d/g, 'N')](scoreGroup(group.slice(1)));
	}
}

var cmds = {
	new: function(info) {
		if(!games[info.to]) {
			var g = games[info.to] = new Game(parseInt(info.rest));
			info.bot.say(info.to, 'New game started with limit ' + g.limit + '.  Type !join to play!');
		}
	},
	join: req(function(info, g) {
		g.players[info.from] = new Player(info.from);
		g.order.push(info.from);
		info.bot.say(info.to, info.from + ' joined the game!');
	}),
	start: req(function(info, g) {
		if(g.order.length < 2) {
			info.bot.say(info.to, 'Need >= 2 players to start!');
			return;
		}
		util.randomize(g.order);
		info.bot.say(info.to, 'Game has started! ' + g.order[0] + ' is up first.  You should !roll');
		g.state = ['roll'];
	}),
	info: function(info) {
		var g = games[info.to];
		if(g) {
			var p = g.players[info.rest];
			info.bot.say(info.to, p.nick + ': ' + p.score + ', ' + p.farkle + ' farkles');
		}
	},
	roll: reqp(function(info, g, p) {
		var r = roll(6)
		  , s = score(r)
		  ;
		
		info.bot.say(info.to, 'You rolled ' + r + '.  !keep some dice');

		if(s.total === 0) {
			g.farkle();
			if(++p.farkle >= 3) {
				p.score -= 500;
				info.bot.say(info.to, 'Six die farkle!  Order is reversed!  You lost 500 points!');
			} else {
				info.bot.say(info.to, 'Six die farkle!  Order is reversed!');
			}
			info.bot.say(info.to, g.order[0] + ': You\'re up, !roll');
			return;
		}
		g.lastRoll = r;
		g.runningTotal = 0;
		g.state = ['keep'];
	}),
	keep: reqp(function(info, g, p) {
		var ki = info.rest.split(' ').map(function(i) { return parseInt(i) - 1; })
		  , k = []
		  ;

		for(var i = 0; i < ki.length; i++) {
			k.push(g.lastRoll[ki[i]]);
		}

		var s = score(k);

		if(s.hasZero) {
			info.bot.say(info.to, 'You can only keep scoring dice!');
			return;
		}

		g.runningTotal += s.total;
		g.dice = g.lastRoll.length - k.length;
		g.dice = g.dice === 0 ? 6 : g.dice;
		g.state = ['ride', 'pass'];
		info.bot.say(info.to, 'You kept ' + s.total + ' points.  Your running total is ' + g.runningTotal + '.  !ride or !pass');
	}),
	pass: reqp(function(info, g, p) {
		if(!p.points && g.runningTotal < 750) {
			info.bot.say(info.to, 'You need to break 750 first!');
			return;
		}
		p.score += g.runningTotal;
		p.farkle = 0;
		
		g.shift();
		
		if(g.lastRound) {
			g.lastRound.shift();
			if(g.lastRound.length === 0) {
				g.end(info);
			} else {
				info.bot.say(info.to, g.order[0] + ': The running total is ' + g.runningTotal + ' with ' + g.dice + ' dice.  !roll or !ride');
				g.state = ['roll', 'ride'];
			}
		} else {
			if(p.score >= g.limit && !g.lastRound) {
				info.bot.say(info.to, p.nick + ' broke the limit with ' + p.score + '!  One more round to go!');
				g.lastRound = g.order.slice();
			}

			info.bot.say(info.to, g.order[0] + ': The running total is ' + g.runningTotal + ' with ' + g.dice + ' dice.  !roll or !ride');
			g.state = ['roll', 'ride'];
		}
	}),
	ride: reqp(function(info, g, p) {
		var r = roll(g.dice)
		  , s = score(r)
		  ;

		info.bot.say(info.to, 'You rolled ' + r);

		if(s.total === 0) {
			g.farkle();
			if(++p.farkle >= 3) {
				p.score -= 500;
				info.bot.say(info.to, 'Farkle!  You lost 500 points!');
			} else {
				info.bot.say(info.to, 'Farkle!');
			}
			info.bot.say(info.to, g.order[0] + ': You\'re up, !roll');
			return;
		}
		
		g.lastRoll = r;
		g.state = ['keep'];
	})
}

var farklep = {
	listeners: {
		'message': parseLine
	}
};

module.exports = farklep;
module.exports.score = score;
