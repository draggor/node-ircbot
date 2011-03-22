var plugin = function(name) {
	var full = require.resolve(name)
	  , module = require(name);
	
	delete require.cache[full];

	return module;
};

module.exports = plugin;
