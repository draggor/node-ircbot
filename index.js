var irc = require('irc')
  , repl = require('repl')
  , util = require('./util')
  ;

Array.prototype.has = function(item, c) {
	c = c || function(a, b) { return a === b; };
	for(var i = 0; i < this.length; i++) {
		if(c(this[i], item)) {
			return i;
		}
	}
	return -1;
};

function bot(server, nick, options) {
	this.server = server;
	this.nick = nick;
	this.options = options;
	this.plugins = {};
	this.throttle = options.throttle || 2000;
	this.client = new irc.Client(server, nick, options);
	this.say = util.throttle(irc.Client.prototype.say, this.throttle, this.client);
	this.listeners = {};
}

function sanitize(str) {
	return str.replace(/\.\.\//g, '');
}

bot.prototype.addListeners = function(plugin) {
	var opt = plugin.options
	  , req = []
	  , reqf = function(listener) { return listener; }
	  ;
	if(opt.chan) {
		req.push(function(from, to, msg) {
			return !!~opt.chan.indexOf(to.toLowerCase());
		});
	} else if (opt['!chan']) {
		req.push(function(from, to, msg) {
			console.log(to.toLowerCase());
			return !~opt.chan.indexOf(to.toLowerCase());
		});
	}
	if(opt.nick) {
		req.push(function(from, to, msg) {
			return !!~opt.nick.indexOf(from.toLowerCase());
		});
	} else if (opt['!nick']) {
		req.push(function(from, to, msg) {
			console.log(from.toLowerCase());
			return !~opt.nick.indexOf(from.toLowerCase());
		});
	}
	if(opt.chan || opt.nick) {
		reqf = function(listener) {
			return function(from, to, msg) {
				if(!!~req.map(function(f) { return f(from, to, msg); }).indexOf(true)) {
					listener(from, to, msg);
				}
			};
		};
	}
	for(var i in plugin.listeners) {
		var listener = plugin.listeners[i];
		if(typeof listener === 'function') {
			var f = reqf(listener);
			this.listeners[opt.prefix + i] = f;
			this.modifyListener(i, f, 'add');
		} else {
			for(var j in listener) {
				var f = reqf(listener[j]);
				this.listeners[opt.prefix + i] = this.listeners[opt.prefix + i] || [];
				this.listeners[opt.prefix + i].push(f);
				this.modifyListener(i, f, 'add');
			}
		}
	}
};

bot.prototype.removeListeners = function(plugin) {
	for(var i in plugin.listeners) {
		var listener = this.listeners[plugin.options.prefix + i];
		if(typeof listener === 'function') {
			this.modifyListener(i, listener, 'remove');
		} else {
			for(var j in listener) {
				this.modifyListener(i, listener[j], 'remove');
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

bot.prototype.modifyListener = function(name, func, mod) {
	mod += 'Listener';
	switch(name) {
		case 'message':
			this.client[mod]('message', func);
			break;
		case 'pm':
			this.client[mod]('pm', func);
			break;
	}
};

bot.prototype.getPlugin = function(name) {
	var cleanName = './plugins' + sanitize(name)
	  , full = require.resolve(cleanName)
	  , pl = require.cache[full]
	  ;
	
	return pl;
};

bot.prototype.loadPlugin = function(name, options) {
	var cleanName = './plugins/' + sanitize(name)
	  , full = require.resolve(cleanName)
	  , pl = require.cache[full]
	  ;

	if(pl) {
		delete require.cache[full];
		for(var i in pl.reload) {
			delete require.cache[pl.reload[i]];
		}
	}

	if(this.plugins[cleanName]) {
		this.unloadPlugin(name);
	}

	pl = require(full);
	pl.options = options || {};
	pl.options.prefix = name;
	pl.bot = this;


	this.plugins[cleanName] = pl;
	this.addListeners(pl);
};

bot.prototype.unloadPlugin = function(name, options) {
	var cleanName = './plugins/' + sanitize(name)
	  , pl = this.plugins[cleanName]
	  ;
	
	pl.options = options || {};
	pl.options.prefix = name;

	if(pl) {
		this.removeListeners(pl);
		delete this.plugins[cleanName];
	}
};

module.exports = bot;
