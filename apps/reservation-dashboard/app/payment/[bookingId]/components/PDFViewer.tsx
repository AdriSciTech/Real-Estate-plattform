'use client';

import { useState, useEffect } from 'react';

// This component functions as a placeholder until we can properly resolve PDF.js issues
// It simply renders the PDF as an embedded object, which is more compatible with Next.js
const PDFViewer = ({ pdfBytes }: { pdfBytes: Uint8Array }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBytes) {
      // Convert the PDF bytes to a Blob URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Clean up the URL when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBytes]);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <object
        data={pdfUrl}
        type="application/pdf"
        className="w-full h-full"
      >
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 mb-4">Unable to display PDF. Please download instead.</p>
        </div>
      </object>
    </div>
  );
};

export default PDFViewer;