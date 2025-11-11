import m from "mithril";
import { register_route } from "../router";
import styles from "./server-list.module.css";
import { createEditor } from 'slate';

// Main imports
import { eventBus } from './utils/eventBus';
import Sidebar from './components/sidebar';
import w from './agent';
import themeService from './services/themeService';
import { MessageServiceFactory, MessageServiceType } from "./services/messageServiceFactory";

// Import refactored components
import ChatContainer from './components/chat/ChatContainer';
import UserListPanel from './components/users/UserListPanel';
import FriendsList from './components/friends/FriendsList';
import SettingsPanel from './components/settings/SettingsPanel';
import OnboardingWizard from "./onboarding";
import onboardingService from './services/onboardingService';

// Initialize services
// w.init();
themeService; // Initialize theme service
eventBus.on("DIDCOMM::AGENT::INITIALIZED", () => {
  m.redraw();
});

var onboard = () => {
  return {
    oninit: function() {
      // If onboarding is already complete, redirect to main app
      if (onboardingService.isOnboardingComplete()) {
        m.route.set("/w", null, {replace: true});
      }
    },
    view: function(vnode) {
      return (
        <OnboardingWizard />
      )
    }
  }
}

var page = () => {
  let serverView = 'dms';
  return {
    oninit: async function() {
      // If onboarding is not complete, redirect to onboarding
      if (!onboardingService.isOnboardingComplete()) {
        m.route.set("/w/onboard", null, {replace: true});
      } else {
        // Initialize message service if not already done
        if (MessageServiceFactory.getCurrentType() === null) {
          MessageServiceFactory.setServiceType(MessageServiceType.AGENT);
        }
        await MessageServiceFactory.getService().activate();
      }
    },
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
          { serverView === 'server' && <UserListPanel /> }
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
