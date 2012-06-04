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

function listArgs(info) {
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
	return args;
}

function botCommand(args, info, successMsg) {
	try {
		info.bot[args.func](args);
		info.bot.respond(info, successMsg);
	} catch (err) {
		info.bot.respond(info, err);
	}
}

var cmds = {
	load: function(info) {
		listArgsCommand('loadPlugin', info, 'Plugin loaded: %s');
	}
,	unload: function(info) {
		listArgsCommand('unloadPlugin', info, 'Plugin unloaded: %s');
	}
,	prefix: function(info) {
		var sp = info.rest.split(' ')
		  , name = sp[0]
		  , prefix = sp[1] || '!'
		  , pl = info.bot.getPlugin(name)
		  ;

		if (pl) {
			pl.cmdPrefix = prefix;
			info.bot.respond(info, 'Prefix for ' + name + ' changed to ' + prefix);
		} else {
			info.bot.respond(info, 'Error: Plugin not found: ' + name);
		}
	}
,	summon: function(info) {
		info.bot.client.join(info.rest);
	}
,	banish: function(info) {
		info.bot.client.part(info.rest);
	}
,	permissions: function(info) {
		listArgsCommand('changePermissions', info, 'Plugin permissions changed: %s');
	}
};
