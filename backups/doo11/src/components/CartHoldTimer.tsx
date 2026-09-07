import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CartHoldTimerProps {
  until?: string;
}

function getTimeRemaining(until?: string) {
  if (!until) return null;
  const diff = new Date(until).getTime() - Date.now();
  if (diff <= 0) return { done: true, text: "انتهى الحجز" };

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return {
    done: false,
    text: hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
  };
}

export const CartHoldTimer: React.FC<CartHoldTimerProps> = ({ until }) => {
  const [status, setStatus] = useState(() => getTimeRemaining(until));

  useEffect(() => {
    setStatus(getTimeRemaining(until));
    if (!until) return;
    const timer = setInterval(() => setStatus(getTimeRemaining(until)), 1000);
    return () => clearInterval(timer);
  }, [until]);

  if (!until || !status) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        status.done ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
      }`}
    >
      <Timer size={12} />
      {status.done ? status.text : `محجوز ${status.text}`}
    </span>
  );
};
