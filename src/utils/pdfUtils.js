import html2pdf from 'html2pdf.js';

/**
 * Downloads an invoice as PDF using html2pdf.js with mobile-responsive layout
 * @param {string} invoiceUrl - The URL of the invoice to download
 * @param {string} referenceNumber - The reference number for the filename
 * @param {string} type - Type of document ('appointment' or 'order')
 */
export const downloadInvoicePDF = async (invoiceUrl, referenceNumber, type = 'invoice') => {
  if (!invoiceUrl) {
    console.error('Invoice URL is required');
    return;
  }
  
  try {
    // Find and update button state
    const downloadButton = findDownloadButton();
    if (downloadButton) {
      setButtonLoading(downloadButton, true);
    }

    // Create a hidden iframe to load the invoice content
    const iframe = createHiddenIframe();
    document.body.appendChild(iframe);

    // Load the invoice URL in the iframe
    iframe.src = invoiceUrl;

    // Wait for iframe to load and content to render
    await waitForIframeLoad(iframe);

    // Get the iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    if (!iframeDoc || !iframeDoc.body) {
      throw new Error('Failed to access iframe content');
    }

    // Apply mobile-responsive styles to the iframe content
    applyMobileStyles(iframeDoc);

    // Configure and generate PDF
    const options = getPDFOptions(referenceNumber, type);
    await html2pdf()
      .set(options)
      .from(iframeDoc.body)
      .save();

    // Clean up
    document.body.removeChild(iframe);

    // Reset button state
    if (downloadButton) {
      setButtonLoading(downloadButton, false);
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Clean up iframe if it exists
    cleanupIframe(invoiceUrl);
    
    // Always reset button state first
    const downloadButton = findDownloadButton();
    if (downloadButton) {
      setButtonLoading(downloadButton, false);
    }

    // Fallback: try direct download as HTML
    await fallbackDownload(invoiceUrl, referenceNumber, type);
  } finally {
    // Final safety net - ensure button is reset no matter what
    setTimeout(() => {
      const downloadButton = findDownloadButton();
      if (downloadButton && (downloadButton.disabled || downloadButton.textContent.includes('Generating PDF'))) {
        setButtonLoading(downloadButton, false);
      }
    }, 1000);
  }
};

/**
 * Finds the download button in the DOM
 */
const findDownloadButton = () => {
  const downloadButtons = document.querySelectorAll('button');
  let downloadButton = null;
  downloadButtons.forEach(btn => {
    // Check for both normal and loading states
    if (btn.textContent.includes('Download Invoice') || 
        btn.textContent.includes('Generating PDF') ||
        btn.disabled) {
      downloadButton = btn;
    }
  });
  return downloadButton;
};

/**
 * Sets the button loading state
 */
const setButtonLoading = (button, isLoading) => {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <div class="inline-flex items-center gap-2">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Generating PDF...
      </div>
    `;
  } else {
    button.disabled = false;
    button.innerHTML = `
      <div class="inline-flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Download Invoice
      </div>
    `;
  }
};

/**
 * Creates a hidden iframe for loading invoice content
 */
const createHiddenIframe = () => {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 375px;
    height: 800px;
    border: none;
  `;
  return iframe;
};

/**
 * Waits for iframe to load and content to render
 */
const waitForIframeLoad = (iframe) => {
  return new Promise((resolve, reject) => {
    iframe.onload = () => {
      setTimeout(resolve, 2000); // Wait for content to fully render
    };
    iframe.onerror = reject;
    
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Iframe load timeout')), 10000);
  });
};

/**
 * Applies mobile-responsive styles to iframe content
 */
const applyMobileStyles = (iframeDoc) => {
  const mobileStyles = iframeDoc.createElement('style');
  mobileStyles.textContent = `
    * {
      box-sizing: border-box !important;
    }
    body {
      margin: 0 !important;
      padding: 20px !important;
      width: 375px !important;
      max-width: 375px !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      font-family: Arial, sans-serif !important;
      background: white !important;
      color: #000 !important;
    }
    .container, .main-content, .content {
      width: 100% !important;
      max-width: 100% !important;
    }
    table {
      width: 100% !important;
      font-size: 12px !important;
      border-collapse: collapse !important;
    }
    .hide-on-mobile {
      display: none !important;
    }
    .mobile-stack {
      display: block !important;
      width: 100% !important;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #000 !important;
      margin: 10px 0 !important;
    }
    p, div, span {
      color: #000 !important;
    }
    @media print {
      body { -webkit-print-color-adjust: exact !important; }
    }
  `;
  
  if (iframeDoc.head) {
    iframeDoc.head.appendChild(mobileStyles);
  } else {
    iframeDoc.body.insertBefore(mobileStyles, iframeDoc.body.firstChild);
  }
};

/**
 * Gets PDF generation options
 */
const getPDFOptions = (referenceNumber, type) => {
  return {
    margin: [10, 10, 10, 10],
    filename: `${type}-${referenceNumber}.pdf`,
    image: { 
      type: 'jpeg', 
      quality: 0.92 
    },
    html2canvas: { 
      scale: 2,
      width: 375,
      height: null, // Auto height
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: true // Enable logging for debugging
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', // Use A4 instead of custom size
      orientation: 'portrait',
      compress: true
    }
  };
};

/**
 * Cleans up iframe if it exists
 */
const cleanupIframe = (invoiceUrl) => {
  const existingIframe = document.querySelector(`iframe[src*="${invoiceUrl}"]`);
  if (existingIframe) {
    document.body.removeChild(existingIframe);
  }
};

/**
 * Fallback download as HTML if PDF generation fails
 */
const fallbackDownload = async (invoiceUrl, referenceNumber, type) => {
  try {
    const response = await fetch(invoiceUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${referenceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    alert('PDF generation failed. Downloaded invoice as HTML file instead.');
  } catch (fallbackError) {
    console.error('Fallback download failed:', fallbackError);
    alert('Unable to download PDF. Please try the "View Invoice" button to access your invoice manually.');
  } finally {
    // Always reset button state after fallback attempts
    const downloadButton = findDownloadButton();
    if (downloadButton) {
      setButtonLoading(downloadButton, false);
    }
  }
};

/**
 * Resets all download buttons to normal state
 */
export const resetDownloadButtons = () => {
  const downloadButtons = document.querySelectorAll('button');
  downloadButtons.forEach(btn => {
    if (btn.textContent.includes('Generating PDF') || 
        btn.textContent.includes('Download Invoice') || 
        btn.disabled) {
      setButtonLoading(btn, false);
    }
  });
};
