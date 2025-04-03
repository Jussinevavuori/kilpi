import { cn } from "@/utils/cn";
import { createSubscribable } from "@/utils/createSubscribable";
import { useEffect, useRef, useState } from "react";

export type TabButtonsProps = {
  id: string;
  tabs: string[];
  syncKey?: string;
};

const TabsSubscribable = createSubscribable<{
  syncKey?: string;
  tab: string;
  id: string;
}>();

function getSyncStorageKey(syncKey: string) {
  return `Tabs.syncKeys.${syncKey}`;
}

export function TabButtons(props: TabButtonsProps) {
  const [activeTab, setActiveTab] = useState<string>("");

  // Initialize tab: Use stored value or first tab
  useEffect(() => {
    // Attempt get value from localStorage
    const storedTab = props.syncKey
      ? localStorage.getItem(getSyncStorageKey(props.syncKey))
      : undefined;

    // Synced valid value
    setActiveTab(storedTab && props.tabs.includes(storedTab) ? storedTab : props.tabs[0]);
  }, [props.syncKey, props.tabs]);

  // Subscribe to tab changes with identical syncKey
  useEffect(() => {
    if (!props.syncKey) return; // Not syncable
    return TabsSubscribable.subscribe((event) => {
      if (event.id === props.id) return; // Own event
      if (event.syncKey !== props.syncKey) return; // Different syncKey
      if (!props.tabs.includes(event.tab)) return; // Invalid tab
      setActiveTab(event.tab); // Set tab
    });
  }, [props.syncKey, props.tabs, props.id]);

  // Reveal selected tab (hide others)
  function revealTab(tab: string) {
    document.querySelectorAll(`#${props.id} div[data-tab]`).forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      el.classList.toggle("hidden", el.dataset.tab !== tab);
    });
  }

  // On tab selected
  function handleSelectTab(tab: string) {
    if (props.syncKey) localStorage.setItem(getSyncStorageKey(props.syncKey), tab);
    TabsSubscribable.publish({ syncKey: props.syncKey, tab, id: props.id });
    setActiveTab(tab);
    revealTab(tab);
  }

  // Initialize first visible tab
  const isInitializedRef = useRef(false);
  useEffect(() => {
    // Initialize once after first activeTab set
    if (!activeTab) return;
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Reveal the active tab
    revealTab(activeTab);
  }, [handleSelectTab, activeTab, isInitializedRef]);

  return (
    <div className="flex flex-wrap border-b">
      {props.tabs.map((tab) => {
        return (
          <button
            key={tab}
            type="button"
            onClick={() => handleSelectTab(tab)}
            className={cn(
              "relative cursor-pointer px-2 py-2 text-sm font-medium",
              tab === activeTab
                ? "text-accent after:border-accent [text-shadow:0_0_.4px_var(--color-fg)] after:absolute after:inset-x-0 after:top-full after:border-b"
                : "",
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
