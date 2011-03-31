var util = require('../../util');

exports.run = function(info) {
	var cmd = cmds[info.cmdstr];
	if(cmd) {
		cmd(info);
	} else {
		console.log('Plugin<admin>: COMMAND NOT FOUND: ' + info.cmdstr);
	}
};

function listArgsCommand(func, info) {
	var sp = info.rest.toLowerCase().split(' ')
	  , name = sp.shift()
	  , args = {}
	  ;

	info.name = name;
	
	for(var i = 0; i < sp.length; i++) {
		var arg = sp[i].split(':');
		args[arg[0]] = arg[1].split(',');
	}

	info.bot[func](name, args);
}

var cmds = {
	load: function(info) {
		listArgsCommand('loadPlugin', info);
		info.bot.respond(info, 'Plugin loaded: ' + info.name);
	},
	unload: function(info) {
		listArgsCommand('unloadPlugin', info);
		info.bot.respond(info, 'Plugin unloaded: ' + info.name);
	}
};
