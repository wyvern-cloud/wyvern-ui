

var routes = {}

function register_route(path, func) {
	if(path in routes)
		throw new Error(`Route for path '${path}' already defined.`);
	routes[path] = func;
}

export { routes, register_route }
