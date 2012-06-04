var util = require('../../util')
  , db = require('chaos')('./db/')
  ;

Array.prototype.max = function(c) {
	c = c || function(a, b) { return a > b ? a : b; };
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
	return Object.keys(g.players).map(function(k) { return [k, g.players[k]]; }).max(function(a, b) {
		return a[1].score > b[1].score ? a : b;
	});
};

function Player(nick) {
	this.nick = nick;
	this.score = 0;
	this.farkle = 0;
	this.points = false;
}

function updateNick(oldNick, newNick, channels) {
	for(var i = 0; i < channels.length; i++) {
		var g = games[channels[i]];
		if(g) {
			var pIndex = g.order.indexOf(oldNick);
			if(!!~pIndex) {
				var p = g.players[oldNick];
				p.nick = newNick;
				g.order[pIndex] = newNick;
				if(g.lastRound) {
					var lri = g.lastRound.indexOf(oldNick);
					if(!!~lri) {
						g.lastRound[lri] = newNick;
					}
				}
			}
		}
	}
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
	if(msg[0] === farklep.cmdPrefix) {
		var sp = util.split(msg, ' ', 2)
		  , info = {
			  from: from,
			  to: to,
			  msg: msg,
			  cmdstr: sp[0].substr(1),
			  rest: sp[1] ? sp[1].trim() : '',
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
		
		info.bot.say(info.to, 'You rolled: ' + r.join(' ') + '.  !keep some dice');

		if(s.total === 0) {
			g.farkle();
			if(++p.farkle >= 3) {
				if(p.points) {
					p.score -= 500;
					info.bot.say(info.to, 'Six die farkle!  Order is reversed!  You lost 500 points!');
				} else {
					info.bot.say(info.to, 'Six die farkle!  Order is reversed!');
				}
			} else {
				info.bot.say(info.to, 'Six die farkle!  Order is reversed!');
			}
			if(g.lastRound) {
				g.lastRound.shift();
				if(g.lastRound.length === 0) {
					g.end(info);
					return;
				}
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
		p.points = true;
		
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

		info.bot.say(info.to, 'You rolled: ' + r.join(' '));

		if(s.total === 0) {
			g.farkle();
			if(++p.farkle >= 3 && p.points) {
				p.score -= 500;
				info.bot.say(info.to, 'Farkle!  You lost 500 points!');
			} else {
				info.bot.say(info.to, 'Farkle!');
			}
			if(g.lastRound) {
				g.lastRound.shift();
				if(g.lastRound.length === 0) {
					g.end(info);
					return;
				}
			}
			info.bot.say(info.to, g.order[0] + ': You\'re up, !roll');
			return;
		}
		
		g.lastRoll = r;
		g.state = ['keep'];
	}),
	score: function(info) {
		var roll = info.rest.split(' ');

		if(roll !== '' && roll.length <= 6) {
			var s = score(roll);
			info.bot.say(info.to, info.from + ': ' + info.rest + ' => ' + s.total);
		} else {
			info.bot.say(info.to, 'A roll is between one and six dice, not ' + roll.length + '!');
		}
	},
	help: function(info) {
		if(info.rest.length === 0) {
			info.bot.say(info.to, info.from + ': Available topics: ' + Object.keys(help).sort().join(', ') + '.  Usage:  !help <topic>');
		} else {
			var helpStr = help[info.rest.toLowerCase()];
			if(helpStr) {
				info.bot.say(info.to, info.from + ': ' + helpStr);
			} else {
				info.bot.say(info.to, info.from + ': ' + 'I don\'t have a topic for: ' + info.rest);
			}
		}
	}
}

var help = {
	help: 'Are you looking for a self help course?',
	score: 'See how a particular roll is scored.  Takes between one and six numbers between 1 and 6.  Sample usage: !score 2 3 4 3 5 1',
	info: 'Check out someone\'s score.  Sample usage: !info Draggor',
	ride: 'Ride the current running total by rolling the remaining dice.  You ride after one of your own rolls or rides, or after another player passes to you.  Sample usage: !ride',
	roll: 'Roll a fresh set of six dice.  You do this if you don\'t want to ride someone else\'s dice, or when there is nothing to ride.  Sample usage: !roll',
	keep: 'Pick which scoring dice you want to keep by passing the indexes of the dice, starting with 1.  You can only keep scoring dice.  If given the roll 2 3 4 5 6 1, and you !keep 2 6, this will not work because the 3 yields no points.  Sample usage: !keep 1 3 4 (this will keep the first, third, and fourth dice, not dice with values 1, 3, 4)',
	pass: 'Add the current running total to your score, reset your farkles, and pass the remaining dice to the next player.  If you haven\'t scored any points yet, you must accumulate at least 750 points before being able to pass.  Sample usage: !pass',
	new: 'Start a new game with an optional limit.  If the limit isn\'t specified, a default of 10,000 is used.  Sample usage: !new 4000',
	join: 'Join a new game as long as it hasn\'t started yet.  Sample usage: !join',
	start: 'Start a game as long as it has two or more players.  Sample usage: !start',
	source: 'https://github.com/draggor/node-ircbot/blob/master/plugins/farkle/index.js'
};

var farklep = {
	listeners: {
		message: parseLine,
		nick: updateNick
	}
};

module.exports = farklep;
module.exports.score = score;
