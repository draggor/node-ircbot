var util = require('../../util');

exports.run = function(info) {
	var cmd = cmds[info.cmdstr];
	if(cmd) {
		cmd(info, info.bot);
	} else {
		var err = 'COMMAND NOT FOUND: ' + info.cmdstr;
		if(info.to === info.bot.nick) {
			info.bot.say(from, err);
		} else {
			info.bot.say(to, err);
		}
	}
};

function jsonCommand(func, info) {
	var sp = util.split(info.rest, ' ', 2)
	  , name = sp[0]
	  , json = JSON.parse(sp[1])
	  ;

	info.bot[func](name);
}

var cmds = {
	load: function(info) {
		jsonCommand('loadPlugin', info);
	},
	unload: function(info) {
		jsonCommand('unloadPlugin', info);
	}
};
