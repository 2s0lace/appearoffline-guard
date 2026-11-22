import initStorage from "./storage/init";
import storage from "./storage";
import recreateContextMenu from "./helpers/recreate-context-menu";
import blockSite from "./helpers/block-site";
import {
  getSoonestUnlockExpiry,
  pruneExpiredUnlocks,
} from "./helpers/temporary-unlock";
import { syncAllWithCloud } from "./helpers/supabase-sync";

const RECHECK_ALARM_NAME = "recheck-temporary-unlocks";
const CLOUD_SYNC_ALARM_NAME = "periodic-cloud-sync";

let __enabled = false;
let __contextMenu = false;
let __blocked: string[] = [];
let __temporaryUnlocks: Record<string, number> = {};

const scheduleNextRecheckAlarm = (temporaryUnlocks: Record<string, number>) => {
  if (!chrome.alarms) {
    return;
  }
  const soonest = getSoonestUnlockExpiry(temporaryUnlocks);
  chrome.alarms.clear(RECHECK_ALARM_NAME).then(() => {
    if (soonest !== null) {
      chrome.alarms.create(RECHECK_ALARM_NAME, { when: soonest + 1000 });
    }
  });
};

const recheckOpenTabs = () => {
  if (!__enabled || !__blocked.length) {
    return;
  }
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && tab.url && tab.url.startsWith("http")) {
        blockSite({
          blocked: __blocked,
          temporaryUnlocks: __temporaryUnlocks,
          tabId: tab.id,
          url: tab.url,
        });
      }
    });
  });
};

const initReady = initStorage().then(() =>
  storage.get(["enabled", "contextMenu", "blocked", "temporaryUnlocks"]).then(({
    enabled,
    contextMenu,
    blocked,
    temporaryUnlocks,
  }) => {
    __enabled = enabled;
    __contextMenu = contextMenu;
    __blocked = blocked;
    __temporaryUnlocks = pruneExpiredUnlocks(temporaryUnlocks || {});

    recreateContextMenu(__enabled && __contextMenu);
    scheduleNextRecheckAlarm(__temporaryUnlocks);
    if (chrome.alarms) {
      chrome.alarms.create(CLOUD_SYNC_ALARM_NAME, { periodInMinutes: 5 });
    }
    void syncAllWithCloud();
  }),
);

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes["enabled"]) {
    __enabled = changes["enabled"].newValue as boolean;
  }

  if (changes["contextMenu"]) {
    __contextMenu = changes["contextMenu"].newValue as boolean;
  }

  if (changes["enabled"] || changes["contextMenu"]) {
    recreateContextMenu(__enabled && __contextMenu);
  }

  if (changes["blocked"]) {
    __blocked = changes["blocked"].newValue as string[];
  }

  if (changes["temporaryUnlocks"]) {
    __temporaryUnlocks = (changes["temporaryUnlocks"].newValue as Record<string, number>) || {};
    scheduleNextRecheckAlarm(__temporaryUnlocks);
  }
});

if (chrome.alarms) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === CLOUD_SYNC_ALARM_NAME) {
      initReady.then(() => {
        void syncAllWithCloud();
      });
      return;
    }

    if (alarm.name !== RECHECK_ALARM_NAME) {
      return;
    }

    initReady.then(() => {
      const pruned = pruneExpiredUnlocks(__temporaryUnlocks);
      __temporaryUnlocks = pruned;
      storage.set({ temporaryUnlocks: pruned });
      scheduleNextRecheckAlarm(pruned);
      recheckOpenTabs();
    });
  });
}

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const { tabId, url, frameId } = details;
  if (!url || !url.startsWith("http") || frameId !== 0) {
    return;
  }

  initReady.then(() => {
    if (!__enabled || !__blocked.length) {
      return;
    }

    blockSite({
      blocked: __blocked,
      temporaryUnlocks: __temporaryUnlocks,
      tabId,
      url,
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  const { url } = changeInfo;
  if (!tabId || !url || !url.startsWith("http")) {
    return;
  }

  initReady.then(() => {
    if (!__enabled || !__blocked.length) {
      return;
    }

    blockSite({
      blocked: __blocked,
      temporaryUnlocks: __temporaryUnlocks,
      tabId,
      url,
    });
  });
});
