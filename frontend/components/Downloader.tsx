import React from 'react';
const API_BASE_URL = process.env.REACT_APP_API_URL;;

const Downloader = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/export`);
      const { data } = await response.json();
      
      if (!data?.length) return;
      
      // Get all unique headers
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      const headers = [...new Set<string>(data.flatMap((obj: {}) => Object.keys(obj)))].sort();
      
      // Create CSV content
      const csvRows = [
        headers.join(','),
        ...data.map((obj: { [x: string]: string; }) =>
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