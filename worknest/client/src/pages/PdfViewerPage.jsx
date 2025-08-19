import React from 'react';
import { useLocation } from 'react-router-dom';

const PdfViewerPage = () => {
  const location = useLocation();
  const pdfUrl = location.state?.pdfUrl;

  if (!pdfUrl) {
    return <div>Error: No PDF URL provided.</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <iframe
        src={pdfUrl}
        title="PDF Viewer"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default PdfViewerPage;