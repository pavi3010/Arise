// src/components/ImportContentButton.jsx
import React, { useRef, useState } from 'react';
import { importContentFromFile } from '../utils/db';

export default function ImportContentButton() {
  const fileInputRef = useRef();
  const [status, setStatus] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('Importing...');
    try {
      await importContentFromFile(file);
      setStatus('Import successful!');
    } catch (err) {
      setStatus('Import failed: ' + err.message);
    }
    fileInputRef.current.value = '';
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        onClick={() => fileInputRef.current.click()}
      >
        Import Content
      </button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {status && <div className="mt-2 text-sm">{status}</div>}
    </div>
  );
}
