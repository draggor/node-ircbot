/*
 * Actions is an array of functions that accept a callback
 * as an argument.  Each of these functions should return
 * some hook to the async action so that it may be cancelled
 * at a later time.
 */
exports.latch = function (actions, callback) {
	var cnt = actions.length;
	var cb = function() {
		if(--cnt != 0) {
			return;
		} else {
			callback.apply(this, arguments);
		}
	};
	return actions.map(function(f) {
		f(cb);
	});
};

exports.getUniqueId = (function() {
	var id = 0;
	return function(reset) {
		if(reset) {
			id = 1;
			return 0;
		} else {
			return id++;
		}
	};
})();

exports.getUniquePrefixId = (function() {
	var ids = {};
	return function(prefix, reset) {
		ids[prefix] = ids[prefix] || 0;
		if(reset) {
			ids[prefix] = 1;
			return prefix + 0;
		} else {
			return prefix + ids[prefix]++;
		}
	};
})();

/*
 * This is destructive!
 * It returns the list as a convenience.
 */
exports.randomize = function(list) {
	for(var i = 0; i < list.length; i++) {
		var j = Math.floor(Math.random() * list.length);
		var tempi = list[i];
		list[i] = list[j];
		list[j] = tempi;
	}
	return list;
};

/*
 * This only makes a new list, the items in the list are shared between this and the old!
 */
exports.safeRandomize = function(list) {
	return exports.randomize(list.concat([]));
};

exports.delayMap = function(items, callback, delay) {
	var o = {};
	var i = 0;
	var f = function() {
		if(i < items.length) {
			callback(items[i++]);
			return o.id = setTimeout(f, delay);
		}
	};
	o.id = f();
	return o;
};

/*
 * Limit the execution of a function to once during a set interval,
 * then queue up any invocations after the first.  A timeout object
 * is returned so queued up invocations can be cleared out.
 */
exports.throttle = function (func, t, ctx) {
	var timeout = false
	  , queue = []
	  , qf = function() {
		  var q = queue.shift();
		  if(q) { q(); timeout = setTimeout(qf, t); } else { timeout = false; }
	  }
	  ;
	
	var f = function() {
		var args = arguments
		  , i = function() {
			func.apply(ctx, args);
		};
		if(timeout && timeout._idleNext) {
			queue.push(i);
		} else {
			i();
			timeout = setTimeout(qf, t);
		}
		return timeout;
	};

	return f;
}

/*
var l = exports.throttle(function(a, b) { console.log([a, b]); }, 1000);

l('a', 1);
l('b', 2);
l('c', 3);
setTimeout(function(){l('d', 4);}, 2000);
*/

/*
 * Limit the execution of a function to once during a set interval,
 * then queue up any invocations after the first.  A timeout object
 * is returned so queued up invocations can be cleared out.
 */
exports.burstThrottle = function (func, b, bt, t, ctx) {
	var timeout = false
	  , bTimeout = false
	  , burst = 0
	  , queue = []
	  , qf = function() {
		  var q = queue.shift();
		  if(q) { q(); timeout = setTimeout(qf, t); } else { timeout = false; }
	  }
	  ;
	
	var f = function() {
		var args = arguments
		  , i = function() {
			func.apply(ctx, args);
		};
		if(timeout && timeout._idleNext) {
			queue.push(i);
		} else {
			if(burst++ >= b) {
				timeout = setTimeout(qf, t);
				queue.push(i);
			} else {
				i();
			}
			if(!bTimeout) {
				bTimeout = setTimeout(function() {
					burst = 0;
					bTimeout = false;
				}, bt);
			}
		}
		return timeout;
	};

	return f;
}

/*
var l = exports.burstThrottle(function(a, b) { console.log([a, b]); }, 3, 1000, 2000);

l('a', 1);
l('b', 2);
l('c', 3);
l('d', 4);
l('e', 5);
l('f', 6);
setTimeout(function(){
	l('g', 7);
	l('h', 8);
	l('i', 9);
	l('j', 10);
	l('k', 11);
	l('l', 12);
}, 12000);
*/

exports.split = function(str, separator, limit) {
	var isep = str.indexOf(separator)
	  , ilast = 0
	  , sp = []
	  ;

	while(isep >= 0 && sp.length < limit - 1) {
		sp.push(str.substring(ilast, isep));
		ilast = isep + 1;
		isep = str.indexOf(separator, ilast);
	}
	sp.push(str.substring(ilast));

	return sp;
};

exports.group = function(a) {
	if(a.length < 2) {
		return [a];
	}
	var ret = [[a[0]]];
	for(var i = 1; i < a.length; i++) {
		if(ret[0][0] === a[i]) {
			ret[0].push(a[i]);
		} else {
			ret.unshift([a[i]]);
		}
	}
	return ret.reverse();
}
