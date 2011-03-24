var irc = require('irc')
  , repl = require('repl')
  , util = require('./util')
  ;

function bot(server, nick, options) {
	this.server = server;
	this.nick = nick;
	this.options = options;
	this.plugins = {};
	this.throttle = options.throttle || 2000;
	this.client = new irc.Client(server, nick, options);
	this.say = util.throttle(irc.Client.prototype.say, this.throttle, this.client);
}

function sanitize(str) {
	return str.replace(/\.\.\//g, '');
}

bot.prototype.modifyListeners = function(plugin, func) {
	var mod = func + 'Listener';
	for(var i in plugin.listeners) {
		if(typeof plugin.listeners[i] === 'function') {
			this.modifyListener(i, plugin.listeners[i], mod);
		} else {
			for(var j in plugin.listeners[i]) {
				this.modifyListener(i, plugin.listeners[i][j], mod);
			}
		}
	}
};

bot.prototype.modifyListener = function(name, func, mod) {
	switch(name) {
		case 'message':
			this.client[mod]('message', func);
			break;
		case 'pm':
			this.client[mod]('pm', func);
			break;
	}
};

bot.prototype.loadPlugin = function(name) {
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
	pl.setBot(this);


	this.plugins[cleanName] = pl;
	this.modifyListeners(pl, 'add');
};

bot.prototype.unloadPlugin = function(name) {
	var cleanName = './plugins/' + sanitize(name)
	  , pl = this.plugins[cleanName]
	  ;

	if(pl) {
		this.modifyListeners(pl, 'remove');
		delete this.plugins[cleanName];
	}
};

module.exports = bot;
