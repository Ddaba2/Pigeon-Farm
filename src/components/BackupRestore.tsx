import React, { useState } from 'react';

const BackupRestore: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("selectSQLFileError");
      return;
    }
    setLoading(true);
    setSuccess(null);
    setError(null);
    const formData = new FormData();
    formData.append('sqlfile', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "restoreError");
      }
      setSuccess("restoreSuccess");
      setFile(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">{"restoreDatabase"}</h2>
      <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded p-3 mb-4 text-sm">
        <b>{"Avertissement"}</b> {"restoreWarning"} <br />{"restoreWarningAdmin"}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".sql"
          onChange={handleFileChange}
          className="block w-full border border-gray-300 rounded px-3 py-2"
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !file}
        >
          {loading ? "restoring" : "restore"}
        </button>
      </form>
      {success && <div className="mt-4 text-green-700 dark:text-green-300 font-semibold text-center">{success}</div>}
      {error && <div className="mt-4 text-red-700 dark:text-red-300 font-semibold text-center">{error}</div>}
    </div>
  );
};

export default BackupRestore; 