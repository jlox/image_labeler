import React from 'react';

const Downloader = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:8000/export');
      const { data } = await response.json();
      
      if (!data?.length) return;
      
      // Get all unique headers
      const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))].sort();
      
      // Create CSV content
      const csvRows = [
        headers.join(','),
        ...data.map(obj =>
          headers.map(header => {
            const value = obj[header] ?? '';
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];
      
      // Download
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      style={{
        padding: '8px 16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Download CSV
    </button>
  );
};

export default Downloader;