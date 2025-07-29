import React, { useState } from "react";

export function Tabs({ tabs }) {
  // Safe default: if tabs is undefined or empty, fallback to empty array
  const safeTabs = Array.isArray(tabs) && tabs.length > 0 ? tabs : [{ label: "No Tabs", content: <p>No content available.</p> }];
  const [activeTab, setActiveTab] = useState(safeTabs[0].label);

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-300">
        {safeTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.label
                ? "border-b-2 border-fern text-fern"
                : "text-gray-500 hover:text-fern"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-b-md shadow">
        {safeTabs.find((tab) => tab.label === activeTab)?.content}
      </div>
    </div>
  );
}
