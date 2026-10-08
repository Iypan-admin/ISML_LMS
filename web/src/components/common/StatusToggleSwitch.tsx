// ============================================================================
// ISML COLLEGE LMS — REUSABLE STATUS TOGGLE SWITCH
// Interactive iOS/Enterprise Style Toggle for Instant Enable / Suspend
// ============================================================================

"use client";

import React from 'react';

interface StatusToggleSwitchProps {
  checked: boolean;
  onChange: (nextState: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  disabled?: boolean;
  showLabels?: boolean;
  className?: string;
}

export default function StatusToggleSwitch({
  checked,
  onChange,
  activeLabel = 'Active',
  inactiveLabel = 'Suspended',
  disabled = false,
  showLabels = false,
  className = '',
}: StatusToggleSwitchProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none font-sans ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0052CC]/40 focus:ring-offset-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          checked
            ? 'bg-emerald-600 hover:bg-emerald-500'
            : 'bg-rose-400 hover:bg-rose-500'
        }`}
        title={checked ? `Click to suspend (${inactiveLabel})` : `Click to activate (${activeLabel})`}
      >
        <span
          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </button>

      {showLabels && (
        <span
          onClick={handleToggle}
          className={`text-[11px] font-bold cursor-pointer transition-colors ${
            checked ? 'text-emerald-700' : 'text-rose-600'
          }`}
        >
          {checked ? activeLabel : inactiveLabel}
        </span>
      )}
    </div>
  );
}
