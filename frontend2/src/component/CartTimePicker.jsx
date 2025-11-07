import React, { useState } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Clock } from "lucide-react";

export default function CartTimePicker({ time, setTime, minAllowedTime }) {
  return (
    <div className="bg-[#10182e] p-4 rounded-2xl shadow-md flex flex-col gap-2 text-white border border-[#1e2a47]">
      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
        <Clock size={16} className="text-gray-400" />
        Select Time
      </label>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          value={time}
          onChange={(newValue) => setTime(newValue)}
          minTime={minAllowedTime} // 🚫 disables earlier times
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              backgroundColor: "#18233d",
              borderRadius: "0.75rem",
              "& fieldset": { borderColor: "#ffffff" },
              "&:hover fieldset": { borderColor: "#ffffff" },
              "&.Mui-focused fieldset": { borderColor: "#ffffff" },
            },
            "& .MuiSvgIcon-root": { color: "#ffffff" },
            "& .MuiInputLabel-root": { color: "#ccc" },
            "& .MuiInputBase-input": { color: "#ffffff" },
          }}
          slotProps={{
            textField: {
              placeholder: "Select time",
              fullWidth: true,
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}
