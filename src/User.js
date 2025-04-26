var m = require("mithril")

var User = {
	list: [],
	loadList: function() {
		return m.request({
			method: "GET",
			url: "https://mithril-rem.fly.dev/api/users",
			withCredentials: true,
		})
		.then(function(result) {
			User.list = result.data
		})
	},
	current: {},
	load: function(id) {
		return m.request({
			method: "GET",
			url: "https://mithril-rem.fly.dev/api/users/" + id,
			withCredentials: true,
		})
		.then(function(result) {
			User.current = result
		})
	}
}

module.exports = User
