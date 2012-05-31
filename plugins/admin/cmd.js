var util = require('../../util')
  , format = require('util').format
  ;

exports.run = function(info) {
	var cmd = cmds[info.cmdstr];
	if(cmd) {
		cmd(info);
	}
};

function listArgsCommand(func, info, formatStr) {
	var sp = info.rest.toLowerCase().split(' ')
	  , name = sp.shift()
	  , args = {}
	  ;

	info.name = name;
	
	for(var i = 0; i < sp.length; i++) {
		var arg = sp[i].split(':');
		if(arg.length > 1) {
			args[arg[0]] = arg[1].split(',');
		} else {
			args[arg[0]] = [];
		}
	}

	try {
		info.bot[func](name, args);
		info.bot.respond(info, format(formatStr, info.name));
	} catch (err) {
		info.bot.respond(info, err);
	}
}

var cmds = {
	load: function(info) {
		listArgsCommand('loadPlugin', info, 'Plugin loaded: %s');
	},
	unload: function(info) {
		listArgsCommand('unloadPlugin', info, 'Plugin unloaded: %s');
	}
};
