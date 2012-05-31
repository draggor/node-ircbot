var util = require('../../util');

exports.run = function(info) {
	var cmd = cmds[info.cmdstr];
	if(cmd) {
		cmd(info);
	}
};

var pingsFrom = exports.pingsFrom = {};
var pingsTo = exports.pingsTo = {};

var cmds = {
	ping: function(info) {
		var sp = util.split(info.rest, ' ', 2)
		  , to = sp[0]
		  , msg = sp[1]
		  ;

		pingsFrom[info.from] = pingsFrom[info.from] || {};
		pingsFrom[info.from][to] = msg;

		pingsTo[to] = pingsTo[to] || {};
		pingsTo[to][info.from] = msg;
	},
	clear: function(info) {
		var pings = pingsTo[info.from];
		for(var k in pings) {
			delete pingsFrom[k][info.from];
		}
		delete pingsTo[info.from];
	}
};
