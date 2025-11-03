import m from "mithril";
import { register_route } from "../router";
import styles from "./server-list.module.css";
import { createEditor } from 'slate';

// Main imports
import { eventBus } from './utils/eventBus';
import Sidebar from './components/sidebar';
import w from './agent';
import themeService from './services/themeService';

// Import refactored components
import ChatContainer from './components/chat/ChatContainer';
import UserListPanel from './components/users/UserListPanel';
import FriendsList from './components/friends/FriendsList';
import SettingsPanel from './components/settings/SettingsPanel';

// Initialize services
w.init();
themeService; // Initialize theme service
eventBus.on("DIDCOMM::AGENT::INITIALIZED", () => {
  m.redraw();
});

var page = () => {
  let serverView = 'dms';
  return {
    view: function(vnode) {
      const did = m.route.param('did');
      if (m.route.get() === '/w/requests')
        serverView = 'server';
      else
        serverView = 'dms';
      return (
        <div class={styles.appLayout}>
          <Sidebar />
          <ChatContainer did={did} />
          <UserListPanel />
        </div>
      )
    }
  }
}

var friendsPage = () => {
  return {
    view: function() {
      return (
        <div class={styles.appLayout}>
          <Sidebar />
          <FriendsList />
        </div>
      )
    }
  }
}

var settingsPage = () => {
  return {
    view: function() {
      return (
        <div class={styles.appLayout}>
          <Sidebar />
          <SettingsPanel />
        </div>
      )
    }
  }
}

register_route("/w", page)
register_route("/w/did/:did", page)
register_route("/w/friends", friendsPage)
register_route("/w/requests", page)
register_route("/w/secret", {
  onmatch: function() {
    if (!localStorage.getItem("auth-token")) m.route.set("/w")
    else return page
  }
})
register_route("/w/settings", settingsPage)
