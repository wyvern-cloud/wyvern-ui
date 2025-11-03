import m from "mithril";
import { register_route } from "../router";
import styles from "./server-list.module.css";
import { createEditor } from 'slate';

// Main imports
import { eventBus } from './utils/eventBus';
import Sidebar from './components/sidebar';
import w from './agent';
import themeService from './services/themeService';
import { MessageServiceFactory } from "./services/messageServiceFactory";

// Import refactored components
import ChatContainer from './components/chat/ChatContainer';
import UserListPanel from './components/users/UserListPanel';
import FriendsList from './components/friends/FriendsList';
import SettingsPanel from './components/settings/SettingsPanel';
import OnboardingWizard from "./onboarding";

// Initialize services
w.init();
themeService; // Initialize theme service
eventBus.on("DIDCOMM::AGENT::INITIALIZED", () => {
  m.redraw();
});

var onboard = () => {
  if (MessageServiceFactory.getInitializedState()) {
    // Do something if the service is initialized
    m.route.set("/w", null, {replace: true});
  }
  return {
    view: function(vnode) {
      return (
        <div class={styles.appLayout}>
          <OnboardingWizard />
        </div>
      )
    }
  }
}

var page = () => {
  let serverView = 'dms';
  if (!MessageServiceFactory.getInitializedState()) {
    // Do something if the service is not initialized
    m.route.set("/w/onboard", null, {replace: true, state: {term: "new_user"}});
  }
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
register_route("/w/onboard", onboard)
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
