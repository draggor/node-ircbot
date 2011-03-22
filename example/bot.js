var bot = require('../');

b = new bot('irc.freenode.net', 'nodeboy1184', {
	userName: 'nodeboy',
	realName: 'nodeboy',
	secure: false,
	channels: ['#dracolair']
});

b.loadPlugin('dice');
