import { useState, useEffect } from "react";

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

export default function CountdownTimer({ targetDate, className = "" }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) return null;

  const units = timeLeft.days > 0
    ? [{ v: timeLeft.days, l: "days" }, { v: timeLeft.hours, l: "hrs" }]
    : [{ v: timeLeft.hours, l: "hrs" }, { v: timeLeft.minutes, l: "min" }];

  return (
    <div className={`cdtimer ${className}`}>
      <span className="cdtimer__label">Departs in</span>
      <div className="cdtimer__units">
        {units.map(({ v, l }) => (
          <div key={l} className="cdtimer__unit">
            <span className="cdtimer__value">{v}</span>
            <span className="cdtimer__sub">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
