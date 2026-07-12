export const printReceipt = (data) => {
  const { studentName, admissionNo, className, receiptNo, date, amount, paymentMethod, feeType } = data;
  
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${receiptNo}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #111; }
          .subtitle { color: #666; margin: 0; font-size: 14px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
          .row { display: flex; flex-direction: column; gap: 4px; }
          .label { font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          .value { font-size: 16px; font-weight: 500; color: #111; }
          .amount-box { background: #f8f9fa; padding: 30px; text-align: center; border-radius: 12px; border: 1px solid #eee; }
          .amount-label { font-size: 14px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
          .amount { font-size: 36px; font-weight: 900; color: #16a34a; }
          .footer { margin-top: 60px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Fee Receipt</h1>
          <p class="subtitle">Receipt No: <strong>${receiptNo}</strong></p>
        </div>
        
        <div class="details-grid">
          <div class="row">
            <span class="label">Date</span>
            <span class="value">${new Date(date).toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method</span>
            <span class="value">${paymentMethod || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Student Name</span>
            <span class="value">${studentName}</span>
          </div>
          <div class="row">
            <span class="label">Admission No</span>
            <span class="value">${admissionNo}</span>
          </div>
          <div class="row">
            <span class="label">Class</span>
            <span class="value">${className || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Fee Type</span>
            <span class="value">${feeType || 'General Fees'}</span>
          </div>
        </div>

        <div class="amount-box">
          <div class="amount-label">Amount Paid</div>
          <div class="amount">₹${parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
        </div>

        <div class="footer">
          This is a computer-generated receipt and does not require a physical signature.
        </div>
      </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(content);
  win.document.close();
  
  // Wait for resources to load then trigger print
  setTimeout(() => {
    win.print();
  }, 250);
};
