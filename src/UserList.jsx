var m = require("mithril")
var User = require("./User")

module.exports = {
	oninit: User.loadList,
	view: function() {
		return (
			<div class="user-list">
			{User.list.map((user) => (
				<m.route.Link
					class="user-list-item"
					href={`/edit/${user.id}`}
					>
				{user.firstName} {user.lastName} meep
				</m.route.Link>
			))}
			</div>
		)
		/*
		return m(".user-list", User.list.map(function(user) {
			//return m(".user-list-item", user.firstName + " " + user.lastName)
			return m(m.route.Link, {
				class: "user-list-item",
				href: "/edit/" + user.id,
			}, user.firstName + " " + user.lastName)
		}))
		// */
	}
}
