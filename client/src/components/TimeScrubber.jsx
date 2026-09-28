import { useState, useMemo } from 'react';
import dayjs from 'dayjs';

export default function TimeScrubber({ onChange }) {
  const DAYS = 400;
  const [offset, setOffset] = useState(0);          // 0 = today
  const [live, setLive] = useState(true);
  const date = useMemo(() => dayjs().subtract(offset, 'day'), [offset]);

  function handle(v) {
    const o = DAYS - Number(v);
    setOffset(o);
    setLive(o === 0);
    onChange(o === 0 ? null : date.subtract(0, 'day').toISOString());
  }

  return (
    <div className={`rounded-lg border p-4 font-mono
      ${live ? 'border-slate-700 bg-slate-900' : 'border-amber-500 bg-amber-950/30'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs tracking-widest text-slate-400">TEMPORAL VIEW</span>
        <span className={live ? 'text-cyan-400' : 'text-amber-400'}>
          {live ? 'LIVE' : `VIEWING ${date.format('DD MMM YYYY').toUpperCase()}`}
        </span>
      </div>
      <input type="range" min={0} max={DAYS} defaultValue={DAYS}
             onChange={e => handle(e.target.value)} className="w-full accent-amber-500" />
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>{dayjs().subtract(DAYS,'day').format('MMM YYYY')}</span><span>TODAY</span>
      </div>
      {!live && (
        <button onClick={() => { setOffset(0); setLive(true); onChange(null); }}
                className="mt-3 text-xs text-amber-400 underline">Return to live</button>
      )}
    </div>
  );
}
