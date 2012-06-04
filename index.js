var irc = require('irc')
  , repl = require('repl')
  , path = require('path')
  , util = require('./util')
  ;

function bot(server, nick, options) {
	var bot = this;
	this.server = server;
	this.nick = nick;
	this.options = options;
	this.plugins = {};
	this.pluginsPath = path.resolve(options.pluginsPath || './plugins') + '/' ;
	this.throttle = options.throttle || 2000;
	this.burstCount = options.burstCount || 5;
	this.burstLimit = options.burstLimit || 1000;
	this.client = new irc.Client(server, nick, options);
	this.client.addListener('nick', function(oldNick, newNick, channels) {
		if(oldNick === bot.nick) {
			bot.nick = newNick;
		}
	});
	if(options.logRaw) {
		this.client.addListener('raw', function(message) {
			console.log(message);
		});
	}
	this.say = util.burstThrottle(irc.Client.prototype.say, this.burstCount, this.burstLimit, this.throttle, this.client);
	this.listeners = {};
}

bot.prototype.respond = function(info, msg) {
	if(info.to === this.nick) {
		this.say(info.from, msg);
	} else if(info.to[0] === '#' && info.to !== this.nick) {
		this.say(info.to, msg);
	} else {
		console.log('ERROR on RESPOND: ' + info);
	}
};

function sanitize(str) {
	return str.replace(/\.\.\//g, '');
}

bot.prototype.addListeners = function(plugin) {
	var opt = plugin.options
	  , req = []
	  , bot = this
	  , reqf = function(listener) { return listener; }
	  ;
	if(opt.chan) {
		req.push(function(from, to, msg) {
			// This tests to see if the message is going to a chan, if so, check the list, otherwise let it pass
			return to[0] === '#' ? !!~opt.chan.indexOf(to.toLowerCase()) : true;
		});
	} else if (opt['!chan']) {
		if(opt['!chan'].length === 0) {
			req.push(function(from, to, msg) {
				return to === bot.nick;
			});
		} else {
			req.push(function(from, to, msg) {
				return !~opt['!chan'].indexOf(to.toLowerCase());
			});
		}
	}
	if(opt.nick) {
		req.push(function(from, to, msg) {
			return !!~opt.nick.indexOf(from.toLowerCase());
		});
	} else if (opt['!nick']) {
		if(opt['!nick'].length === 0) {
			/* This is now moved to !pm
			req.push(function(from, to, msg) {
				return to !== bot.nick;
			});
			*/
		} else {
			req.push(function(from, to, msg) {
				return !~opt['!nick'].indexOf(from.toLowerCase());
			});
		}
	}
	if(opt['!pm']) {
		req.push(function(from, to, msg) {
			return to !== bot.nick;
		});
	}
	if(opt.chan || opt.nick || opt['!chan'] || opt['!nick'] || opt['!pm']) {
		reqf = function(listener) {
			return function(from, to, msg) {
				if(!~req.map(function(f) { return f(from, to, msg); }).indexOf(false)) {
					listener(from, to, msg);
				}
			};
		};
	}
	opt.req = req;
	for(var i in plugin.listeners) {
		var listener = plugin.listeners[i];
		if(typeof listener === 'function') {
			var f = reqf(listener);
			this.listeners[opt.prefix + i] = f;
			this.client.addListener(i, f);
		} else {
			for(var j in listener) {
				var f = reqf(listener[j]);
				this.listeners[opt.prefix + i] = this.listeners[opt.prefix + i] || [];
				this.listeners[opt.prefix + i].push(f);
				this.client.addListener(i, f);
			}
		}
	}
};

bot.prototype.removeListeners = function(plugin) {
	for(var i in plugin.listeners) {
		var listener = this.listeners[plugin.options.prefix + i];
		if(typeof listener === 'function') {
			this.client.removeListener(i, listener);
		} else {
			for(var j in listener) {
				this.client.removeListener(i, listener[j]);
			}
		}
		delete this.listeners[plugin.options.prefix + i];
	}

}

bot.prototype.chanListener = function(func) {
	return function(from, to, msg) {
		if(to[0] === '#' && to !== this.nick) {
			func(from, to, msg);
		}
	};
};

bot.prototype.getPlugin = function(name) {
	var cleanName = this.pluginsPath + sanitize(name)
	  , pl = this.plugins[cleanName]
	  ;
	
	return pl;
};

bot.prototype.loadPlugin = function(name, options) {
	var cleanName = this.pluginsPath + sanitize(name)
	  , full = require.resolve(cleanName)
	  , pl = require.cache[full]
	  ;

	if(pl) {
		for(var i in pl.exports.reload) {
			delete require.cache[pl.exports.reload[i]];
		}
		delete require.cache[full];
	}

	if(this.plugins[cleanName]) {
		this.unloadPlugin(name);
	}

	pl = require(full);
	pl.options = options || {};
	pl.options.prefix = name;
	pl.bot = this;
	pl.cmdPrefix = options.cmdprefix && options.cmdprefix[0] ? options.cmdprefix[0] : '!';

	this.plugins[cleanName] = pl;
	this.addListeners(pl);
	
	if (pl.initPlugin) {
		pl.initPlugin();
	}
};

bot.prototype.unloadPlugin = function(name, options) {
	var cleanName = this.pluginsPath + sanitize(name)
	  , pl = this.plugins[cleanName]
	  ;

	if (pl) {
		if (pl.teardownPlugin) {
			pl.teardownPlugin();
		}
	
		pl.options = options || {};
		pl.options.prefix = name;

		this.removeListeners(pl);
		delete this.plugins[cleanName];
	} else {
		throw 'Plugin not found: ' + name;
	}
};

bot.prototype.changePermissions = function(name, options) {
	var cleanName = this.pluginsPath + sanitize(name)
	  , pl = this.plugins[cleanName]
	  ;

	if(pl) {
		pl.options = pl.options || {};
		pl.options.prefix = name;
		this.removeListeners(pl);
		pl.options = options || {};
		pl.options.prefix = name;
		this.addListeners(pl);
	} else {
		throw 'Plugin not found: ' + name;
	}
};

module.exports = bot;
