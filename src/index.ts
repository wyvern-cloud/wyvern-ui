import m from "mithril";
import UserList from "./UserList";
import UserForm from "./UserForm";
import Layout from "./Layout";
import "./wyvrn";
import {routes, register_route} from "./router";

function documentReady(fn) {
	if (document.readyState === "complete" || document.readyState === "interactive")
		setTimeout(fn, 1);
	else
		document.addEventListener("DOMContentLoaded", fn);
}

documentReady(() => {
	//new EventSource('/esbuild').addEventListener('change', () => location.reload());
	//m.mount(document.body, UserList);
	m.route.prefix = "#!"
	function lrender(view) {
		return {
			render: function() {
				return m(Layout, m(view))
			}
		}
	}
	register_route("/list", lrender(UserList))
	register_route("/edit/:id", lrender(UserForm))
	m.route(document.body, "/list", routes)
});
