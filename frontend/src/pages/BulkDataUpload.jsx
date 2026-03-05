import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── CSV template definitions ──────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'accommodation', name: 'Hotel / Accommodation', icon: '🏨',
    description: 'Room types, pricing, availability, amenities',
    sampleRows: [
      { name: 'Deluxe Room with Garden View', type: 'accommodation', description: 'Spacious room overlooking the garden',   price: 15000, capacity: 2, availableCount: 5,  location: 'Kandy', amenities: 'WiFi,Breakfast,Pool' },
      { name: 'Suite with Ocean View',        type: 'accommodation', description: 'Luxury suite with panoramic ocean view', price: 25000, capacity: 4, availableCount: 2,  location: 'Galle', amenities: 'WiFi,Breakfast,Pool,Spa' },
    ],
  },
  {
    id: 'transport', name: 'Vehicle / Transport', icon: '🚗',
    description: 'Vehicle details, capacity, rental rates',
    sampleRows: [
      { name: 'Private AC Car (Full Day)', type: 'transport', description: 'Air-conditioned sedan with driver',    price: 8000,  capacity: 4, availableCount: 3, location: 'Island-wide', amenities: 'AC,Experienced Driver,Fuel Included' },
      { name: 'AC Mini Van (9-Seater)',    type: 'transport', description: 'Toyota KDH minivan for group travel', price: 12000, capacity: 9, availableCount: 2, location: 'Island-wide', amenities: 'AC,WiFi Hotspot,Fuel Included' },
    ],
  },
  {
    id: 'activity', name: 'Activity / Experience', icon: '🎭',
    description: 'Tours, activities, experiences, pricing',
    sampleRows: [
      { name: 'Sigiriya Rock Fortress Tour', type: 'activity', description: 'Full-day guided tour with lunch',        price: 12500, capacity: 20, availableCount: 18, location: 'Sigiriya', amenities: 'Lunch,English Guide,Entry Tickets' },
      { name: 'Whale Watching Cruise',       type: 'activity', description: 'Morning whale watching off south coast', price: 8500,  capacity: 30, availableCount: 25, location: 'Mirissa',  amenities: 'Breakfast,Life Jackets,Marine Guide' },
    ],
  },
  {
    id: 'package', name: 'Tour Package', icon: '📦',
    description: 'Multi-day packages with accommodation & transport',
    sampleRows: [
      { name: 'Kandy Cultural Triangle 3D/2N', type: 'package', description: 'Explore Kandy, Dambulla, Polonnaruwa', price: 45000, capacity: 10, availableCount: 8, location: 'Kandy & Central Province', amenities: 'Hotel Stay,All Meals,Guide,AC Transport,Entry Tickets' },
    ],
  },
  {
    id: 'meal', name: 'Meal Package', icon: '🍽️',
    description: 'Meal plans, menu packages, dietary options',
    sampleRows: [
      { name: 'Traditional Rice & Curry Lunch', type: 'meal', description: 'Authentic Sri Lankan rice and curry spread', price: 1500, capacity: 50, availableCount: 50, location: 'Kandy', amenities: 'Vegetarian Option,Gluten Free Option' },
    ],
  },
];

const CSV_HEADERS = ['name', 'type', 'description', 'price', 'capacity', 'availableCount', 'location', 'amenities'];
const VALID_TYPES  = ['accommodation', 'transport', 'activity', 'meal', 'package', 'other'];

// ── helpers ───────────────────────────────────────────────────────────────────
const generateCSV = (rows) => {
  const header = CSV_HEADERS.join(',');
  const body   = rows.map(r =>
    CSV_HEADERS.map(h => {
      const v = String(r[h] ?? '');
      return v.includes(',') ? `"${v}"` : v;
    }).join(',')
  );
  return [header, ...body].join('\n');
};

const downloadBlob = (filename, content) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const validateRows = (rows) => {
  const valid  = [];
  const errors = [];
  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-based, header = row 1
    if (!row.name?.trim()) {
      errors.push({ row: rowNum, message: '"name" is required' });
      return;
    }
    if (row.type && !VALID_TYPES.includes(row.type.trim().toLowerCase())) {
      errors.push({ row: rowNum, message: `"type" must be one of: ${VALID_TYPES.join(', ')}` });
      return;
    }
    if (row.price !== undefined && row.price !== '' && isNaN(Number(row.price))) {
      errors.push({ row: rowNum, message: '"price" must be a number' });
      return;
    }
    valid.push({
      name:           row.name?.trim(),
      type:           row.type?.trim().toLowerCase() || 'other',
      description:    row.description?.trim() || '',
      price:          row.price !== '' ? Number(row.price) : 0,
      capacity:       row.capacity !== '' ? Number(row.capacity) : 1,
      availableCount: row.availableCount !== '' ? Number(row.availableCount) : 1,
      location:       row.location?.trim() || '',
      amenities:      row.amenities ? row.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
    });
  });
  return { valid, errors };
};

// ── component ─────────────────────────────────────────────────────────────────
export default function BulkDataUpload() {
  const navigate = useNavigate();

  const [selectedFile,     setSelectedFile]     = useState(null);
  const [uploadProgress,   setUploadProgress]   = useState(0);
  const [uploadStatus,     setUploadStatus]     = useState(null);
  const [dragActive,       setDragActive]       = useState(false);
  const [parsedRows,       setParsedRows]       = useState([]);
  const [validRows,        setValidRows]        = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPreview,      setShowPreview]      = useState(false);
  const [uploadHistory,    setUploadHistory]    = useState([]);
  const [saving,           setSaving]           = useState(false);

  // ── load history from localStorage on mount ──────────────────────────────
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('bulkUploadHistory') || '[]');
    setUploadHistory(history);
  }, []);

  const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!userInfo?.token) { navigate('/vendor-login'); return null; }
    return userInfo.token;
  };

  // ── drag & drop ───────────────────────────────────────────────────────────
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const processFile = (file) => {
    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) { toast.error('Only .csv, .xlsx, and .xls files are accepted'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be under 5 MB'); return; }
    setSelectedFile(file);
    setUploadStatus(null); setValidationErrors([]); setValidRows([]);
    setParsedRows([]); setShowPreview(false);
  };

  const handleClearFile = () => {
    setSelectedFile(null); setUploadProgress(0); setUploadStatus(null);
    setValidationErrors([]); setValidRows([]); setParsedRows([]); setShowPreview(false);
  };

  // ── validate (CSV via PapaParse, Excel via SheetJS) ─────────────────────
  const handleValidate = () => {
    if (!selectedFile) return;
    setUploadStatus('validating'); setUploadProgress(10);

    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (ext === '.csv') {
      // ── CSV path ──────────────────────────────────────────────────────────
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setUploadProgress(60);
          finishValidation(result.data);
        },
        error: () => {
          toast.error('Failed to parse CSV file.');
          setUploadStatus('error'); setUploadProgress(0);
        },
      });
    } else {
      // ── Excel path (.xlsx / .xls) ─────────────────────────────────────────
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          setUploadProgress(40);
          const wb    = XLSX.read(e.target.result, { type: 'array' });
          const ws    = wb.Sheets[wb.SheetNames[0]];
          const rows  = XLSX.utils.sheet_to_json(ws, { defval: '' });
          setUploadProgress(60);
          finishValidation(rows);
        } catch {
          toast.error('Failed to parse Excel file.');
          setUploadStatus('error'); setUploadProgress(0);
        }
      };
      reader.onerror = () => {
        toast.error('Could not read file.');
        setUploadStatus('error'); setUploadProgress(0);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const finishValidation = (rows) => {
    setParsedRows(rows);
    const { valid, errors } = validateRows(rows);
    setValidRows(valid); setValidationErrors(errors);
    setUploadProgress(100);
    if (errors.length > 0 && valid.length === 0) {
      setUploadStatus('error');
    } else {
      setUploadStatus('validated'); setShowPreview(true);
    }
  };

  // ── save to DB ────────────────────────────────────────────────────────────
  const handleConfirmSave = async (rowsToSave = validRows) => {
    const token = getToken();
    if (!token) return;
    if (!rowsToSave.length) { toast.error('No valid rows to save'); return; }
    try {
      setSaving(true);
      const { data } = await axios.post(
        '/api/inventory/bulk',
        { items: rowsToSave },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${data.successRows} items saved to inventory!`);
      const histEntry = {
        id: Date.now(),
        date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
        filename: selectedFile.name,
        serviceType: rowsToSave[0]?.type || 'Mixed',
        records: data.successRows,
        status: data.errorRows > 0 ? 'partial' : 'success',
        errors: data.errorRows,
      };
      const updated = [histEntry, ...uploadHistory].slice(0, 20);
      localStorage.setItem('bulkUploadHistory', JSON.stringify(updated));
      setUploadHistory(updated);
      setUploadStatus('success'); setShowPreview(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setUploadStatus('error');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── template download ─────────────────────────────────────────────────────
  const handleDownloadTemplate = (template) => {
    const csvContent = generateCSV(template.sampleRows);
    downloadBlob(`${template.id}_template.csv`, csvContent);
  };

  const getStatusBadge = (status) => {
    const map = {
      success:    'bg-green-500/20 text-green-400',
      partial:    'bg-yellow-500/20 text-yellow-400',
      failed:     'bg-red-500/20 text-red-400',
      processing: 'bg-blue-500/20 text-blue-400',
    };
    return map[status] || 'bg-slate-500/20 text-slate-400';
  };

  const totalRows     = parsedRows.length;
  const errorRowCount = [...new Set(validationErrors.map(e => e.row))].length;

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Bulk Data Upload</h1>
          <p className="text-slate-400 mt-1">Upload multiple inventory items at once using CSV files</p>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-400">ℹ</span> How to Use Bulk Upload
          </h2>
          <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1">
            <li>Download a template CSV that matches your service type.</li>
            <li>Fill in your data following the column headers exactly.</li>
            <li>Upload the completed file and click <strong>Validate</strong>.</li>
            <li>Review any errors, then click <strong>Save to Inventory</strong>.</li>
          </ol>
          <p className="text-slate-400 text-xs mt-3">
            Required columns:{' '}
            <span className="text-yellow-400 font-mono">{CSV_HEADERS.join(', ')}</span>.
            &nbsp; Type must be one of:{' '}
            <span className="text-yellow-400 font-mono">{VALID_TYPES.join(', ')}</span>.
          </p>
        </div>

        {/* Template Cards */}
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-3">Download a Template</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => handleDownloadTemplate(t)}
                className="bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl p-4 text-center transition group"
              >
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="text-white text-sm font-medium group-hover:text-blue-400 transition">{t.name}</div>
                <div className="text-slate-500 text-xs mt-1">Download CSV</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Upload File</h2>

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag} onDragOver={handleDrag}
              onDragLeave={handleDrag} onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition cursor-pointer
                ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-500/50'}`}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="text-5xl mb-3">📂</div>
              <p className="text-white font-medium">Drag &amp; drop your file here</p>
              <p className="text-slate-400 text-sm mt-1">or click to browse — CSV, XLSX, XLS · max 5 MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected file row */}
              <div className="flex items-center justify-between bg-slate-700/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-slate-400 text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={handleClearFile} className="text-slate-400 hover:text-red-400 transition text-xl">✕</button>
              </div>

              {/* Progress bar */}
              {uploadStatus === 'validating' && (
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Action button */}
              {(!uploadStatus || uploadStatus === 'error') && (
                <button
                  onClick={handleValidate}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Validate File
                </button>
              )}
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5 mb-6">
            <h2 className="text-red-400 font-semibold mb-3">
              ⚠ {validationErrors.length} Validation Issue{validationErrors.length > 1 ? 's' : ''} Found
              {validRows.length > 0 && (
                <span className="text-slate-400 font-normal text-sm ml-2">
                  ({validRows.length} rows are valid and can still be saved)
                </span>
              )}
            </h2>
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-red-300 text-sm">
                  Row {err.row}: <span className="text-red-200">{err.message}</span>
                </li>
              ))}
            </ul>
            {validRows.length > 0 && (
              <button
                onClick={() => handleConfirmSave(validRows)}
                disabled={saving}
                className="mt-4 px-5 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
              >
                {saving ? 'Saving…' : `Save ${validRows.length} Valid Rows Anyway`}
              </button>
            )}
          </div>
        )}

        {/* Preview + Confirm */}
        {showPreview && validRows.length > 0 && (
          <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-green-400 font-semibold">
                ✓ {validRows.length} of {totalRows} rows are valid
                {errorRowCount > 0 && (
                  <span className="text-yellow-400 text-sm font-normal ml-2">({errorRowCount} skipped)</span>
                )}
              </h2>
              <button
                onClick={() => handleConfirmSave()}
                disabled={saving}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
              >
                {saving ? 'Saving…' : 'Save to Inventory'}
              </button>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-700 text-slate-300">
                  <tr>
                    {CSV_HEADERS.map(h => (
                      <th key={h} className="px-3 py-2 text-left capitalize">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {validRows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-t border-slate-700 hover:bg-slate-700/30">
                      {CSV_HEADERS.map(h => (
                        <td key={h} className="px-3 py-2 text-slate-300 truncate max-w-[160px]">
                          {Array.isArray(row[h]) ? row[h].join(', ') : row[h] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {validRows.length > 50 && (
                <p className="text-slate-500 text-xs text-center mt-2">
                  Showing first 50 of {validRows.length} rows
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Banner */}
        {uploadStatus === 'success' && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-5 mb-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-green-400 font-semibold">Items saved to inventory successfully!</p>
            <button
              onClick={handleClearFile}
              className="mt-3 px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
            >
              Upload Another File
            </button>
          </div>
        )}

        {/* Upload History */}
        {uploadHistory.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Recent Uploads</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="pb-2 text-left">Date</th>
                    <th className="pb-2 text-left">Filename</th>
                    <th className="pb-2 text-left">Type</th>
                    <th className="pb-2 text-right">Records</th>
                    <th className="pb-2 text-right">Errors</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadHistory.map(h => (
                    <tr key={h.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-2 text-slate-400">{h.date}</td>
                      <td className="py-2 text-white font-medium">{h.filename}</td>
                      <td className="py-2 text-slate-300 capitalize">{h.serviceType}</td>
                      <td className="py-2 text-right text-slate-300">{h.records}</td>
                      <td className="py-2 text-right text-slate-300">{h.errors}</td>
                      <td className="py-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(h.status)}`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
