var bot = require('../');

b = new bot('irc.freenode.net', 'nodeboy1184', {
	userName: 'nodeboy',
	realName: 'nodeboy',
	debug: true,
	secure: false,
	channels: ['#dracolair']
});

b.loadPlugin('admin');
//b.loadPlugin('dice');
