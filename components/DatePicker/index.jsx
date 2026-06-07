import React from "react";
import moment from "moment";

export default function DatePicker({
  label,
  value,
  onChange,
  className = "",
  focusRingClass = "focus:ring-violet-500/20 focus:border-violet-500",
  ...props
}) {
  // Gracefully format whatever type of date input is passed (Date, moment, string)
  const formattedValue = value ? moment(value).format("YYYY-MM-DD") : "";

  const handleOnChange = (e) => {
    const rawVal = e.target.value;
    onChange(rawVal || "");
  };

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
          {label}
        </label>
      )}
      <input
        type="date"
        value={formattedValue}
        onChange={handleOnChange}
        className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 transition-all ${focusRingClass} ${className}`}
        {...props}
      />
    </div>
  );
}
