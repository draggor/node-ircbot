var util = require('../../util');

Array.prototype.has = function(item) {
	for(var i = 0; i < this.length; i++) {
		if(this[i] === item) {
			return this[i];
		}
	}
};

Array.prototype.group = function() {
	return util.group(this);
};

var games = {};

function Game(limit) {
	this.limit = limit || 10000;
	this.players = {};
	this.order = [];
	this.state = ['join'];
	this.lastRoll;
	this.runningTotal;
}

Game.prototype.shift = function() {
	this.order.push(this.order.shift());
};

function Player(nick) {
	this.nick = nick;
	this.score = 0;
	this.farkle = 0;
}

function req(func) {
	return function(info) {
		var game = games[info.from];
		if(game && game.state.has(info.cmdstr)) {
			func(info, game);
		}
	};
}

function reqp(func) {
	return function(info) {
		var game = games[info.from];
		if(game && game.state.has(info.cmdstr) && game.order[0] === info.from) {
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
			  rest: sp[1],
			  bot: adminp.bot
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

function roll() {
	return [0,0,0,0,0,0].map(function() { return Math.floor(Math.random() * 6) + 1; });
}

function length(a) {
	return a.length;
}

function score(roll) {
	var sum = 0;
	var group = roll.group();

	if(group.length === 6) {
		return 1500;
	} else if(group.map(length).toString() === '2,2,2') {
		return 500;
	}

	var sr = group.map(scoreGroup);

	for(var i = 0; i < roll; i++) {
		sum += sr[i][1];
	}
	return sum;
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
		return scores[group.toString()]();
	} else if (group.length == 2) {
		return scores[group.toString()](scores[group.toString().substr(2)])();
	} else {

	}
}

var cmds = {
	new: function(info) {
		if(!games[info.from]) {
			var g = games[info.from] = new Game(parseInt(info.rest));
			info.bot.say(info.to, 'New game started with limit ' + g.limit + '.  Type !join to play!');
		}
	},
	join: req(function(info, g) {
		g.players[info.from] = new Player(info.from);
		g.order.push[info.from];
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
	info: req(function(info, g) {
		var p = game.players[info.rest];
		info.bot.say(info.to, p.nick + ': ' + p.score + ', ' + p.farkle + ' farkles');
	}),
	roll: reqp(function(info, g, p) {
		// Roll stuff
		g.state = ['keep'];
	}),
	keep: reqp(function(info, g, p) {
		// Keep stuff
		g.state = ['ride', 'pass'];
	}),
	pass: reqp(function(info, g, p) {
		p.score += g.runningTotal;
		p.farkle = 0;

		g.shift();
		info.bot.say(info.to, info.from + ': The running total is ' + g.runningTotal + ' with ' + g.dice + ' dice.  !roll or !ride');
		g.state = ['roll', 'ride'];
	}),
	ride: reqp(function(info, g, p) {
		// Ride stuff
		g.state = ['ride', 'pass'];
	})
}

var farklep = {
	listeners: {
		'message': parseLine
	}
};

module.exports = farklep;
