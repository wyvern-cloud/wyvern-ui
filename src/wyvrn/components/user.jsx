import m from "mithril";
import styles from "../server-list.module.css";
import { exampleService } from '../services/exampleService';

const roles = exampleService.getRoles();

var UserPFP = {
	view: (vnode) => (
		<div class={styles.serverIcon}>
			<a href={vnode.attrs.user.pfp}>
			<img src={vnode.attrs.user.pfp} />
			</a>
			<span></span>
		</div>
	)
}

var UserName = {
	view: (vnode) => {
		let user = vnode.attrs.user;
		return (
			<div class={styles.username} style={{color: roles[user.roles?.[0]]?.color}}>
				{user?.displayname}
			</div>
		)
	}
}

export {UserPFP, UserName};
