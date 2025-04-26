import m from "mithril";
import styles from "../../server-list.module.css";
import { exampleService } from "../../services/exampleService";
import { UserPFP, UserName } from "../user";

const UserListPanel = {
  view: () => {
    let users = exampleService.getUsers();
    return (
      <div class={`${styles.userListParent} ${styles.userList}`}>
        {Object.values(users).map((item, index) => (
          <div key={item.username} class={styles.userListEntry}>
            <UserPFP user={item} />
            <UserName user={item} />
          </div>
        ))}
      </div>
    )
  }
};

export default UserListPanel;
