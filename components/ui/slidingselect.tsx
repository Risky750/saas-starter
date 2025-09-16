import { useState } from 'react';

const options = [
  { id: 'Portfolio',  label: 'Portfolio',  content: <p>Portfolio</p> },
  { id: 'Website', label: 'Website', content: <p>Website</p> },
];

export default function SlidingSelect() {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedOption = options.find(o => o.id === selected);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* ------------- OPTIONS LIST ------------- */}
      <div
        className={`absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-lg
                    transition-transform duration-500 ease-in-out
                    ${selected ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="p-6">
       <label htmlFor="section-select" className="block mb-2 text-sm font-medium">
  Choose a section
</label>
<select
  id="section-select"
  onChange={e => setSelected(e.target.value)}
  value=""
  className="w-full border rounded px-3 py-2"
>
            <option value="" disabled>Select…</option>
            {options.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------- CONTENT PANEL ------------- */}
      <div
        className={`absolute inset-y-0 left-full w-full max-w-sm bg-white shadow-lg
                    transition-transform duration-500 ease-in-out
                    ${selected ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="p-6">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-blue-600 mb-4"
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold mb-2">
            {selectedOption?.label}
          </h2>
          <div>{selectedOption?.content}</div>
        </div>
      </div>
    </div>
  );
}