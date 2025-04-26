var m = require("mithril")
var User = require("./User")

module.exports = {
	oninit: function(vnode) {User.load(vnode.attrs.id)},
	view: function() {
		return m("form", {
			onsubmit: function(e) {
				e.prefentDefault();
				//User.save()
			}
		}, [
			m("label.label", "First name"),
			m("input.input[type=text][placeholder=First name]", {
				oninput: (e) => {User.current.firstName = e.target.value;},
				value: User.current.firstName
			}),
			m("label.label", "Last name"),
			m("input.input[placeholder=Last name]", {
				oninput: (e) => {User.current.lastName = e.target.value;},
				value: User.current.lastName
			}),
			m("button.button[type=submit]", "Save"),
		])
	}
}
