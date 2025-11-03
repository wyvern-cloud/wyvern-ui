import m from "mithril";
import styles from "../../server-list.module.css";
import { UserPFP, UserName } from "../user";
import w from "../../agent";
import { eventBus } from '../../utils/eventBus';

const FriendsList = () => {
  let my_did = undefined;
  let users = {};

  return {
    oninit: async () => {
      let did = await w.waitForStartup();
      console.debug("[FriendsList] oninit", did);
      my_did = did;

      // Load peers from the agent
      users = await w.getPeers();
      m.redraw();
      eventBus.on("DIDCOMM::PROTOCOL::USER_PROFILE::PROFILE_UPDATE", (peer) => {
        // users[peer.did] = peer;
        m.redraw();
      });
    },
    view: () => {
      return (
        <div class={styles.chatBox}>
          <form>
            <div style={{ display: 'flex' }}>
              <label for="myDID">Your ID:</label>
              <input
                type="textbox"
                name="myDID"
                placeholder="MISSING DID"
                value={my_did}
                readonly
                style={{ flex: 1 }}
                onfocus={(e) => {
                  e.target.select();
                }}
              />
            </div>
            <label for="friendDid">Friend ID:</label>
            <input type="textbox" name="friendDid" placeholder="did:peer:4..." />
            <input
              type="button"
              value="Send Request"
              onclick={(e) => {
                console.log(e);
                let did = e.target.form.elements.friendDid.value;
                w.send_request(did);
                w.sendFeatureDiscovery(did);
                e.preventDefault();
              }}
            />
            <input
              type="button"
              value="Refresh"
              onclick={(e) => {
                e.preventDefault();
                m.redraw();
              }}
            />
            <input
              type="button"
              value="Test"
              onclick={(e) => {
                e.preventDefault();
                // w.sendFeatureDiscovery("did:peer:4zQmZz6u9u6kUu5jvXrX7K3b2D3h7nY5L5n8n9p0q1r2s3t4u5v6w7x8y9zA");
                w.fetchMessages()
              }}
            />
          </form>
          <div class={styles.userList}>
            {Object.values(users).map((item, index) => (
              <div
                key={item.username}
                class={styles.userListEntry}
                onclick={(e) => {
                  m.route.set("/w/did/:did", { did: item.did }, { replace: false, state: { term: item.did } });
                }}
              >
                <UserPFP user={item} />
                <UserName user={item} />
              </div>
            ))}
          </div>
        </div>
      );
    },
  };
};

export default FriendsList;
