import React, { useState, useEffect } from 'react';

interface CountdownProps {
  endsAt: string;
  compact?: boolean;
}

function calculateTime(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, done: diff <= 0 };
}

export const Countdown: React.FC<CountdownProps> = ({ endsAt, compact = false }) => {
  const [time, setTime] = useState(() => calculateTime(endsAt));

  useEffect(() => {
    const timer = setInterval(() => setTime(calculateTime(endsAt)), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (time.done) {
    return <span className="text-xs font-bold text-white/80">انتهى العرض</span>;
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-xs font-bold tabular-nums" dir="ltr">
        <span className="rounded bg-black/80 px-1 py-0.5 text-white">{pad(time.h)}</span>
        <span>:</span>
        <span className="rounded bg-black/80 px-1 py-0.5 text-white">{pad(time.m)}</span>
        <span>:</span>
        <span className="rounded bg-black/80 px-1 py-0.5 text-white">{pad(time.s)}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      {[
        { v: time.s, l: 'ثانية' },
        { v: time.m, l: 'دقيقة' },
        { v: time.h, l: 'ساعة' }
      ].map((item, idx) => (
        <React.Fragment key={item.l}>
          {idx > 0 && <span className="text-white font-bold text-sm">:</span>}
          <div className="flex flex-col items-center">
            <span className="min-w-[36px] rounded-md bg-white px-1.5 py-1 text-center font-mono text-sm font-black text-orange-600 tabular-nums shadow-sm">
              {pad(item.v)}
            </span>
            <span className="mt-0.5 text-[10px] text-white/90 font-bold">{item.l}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
