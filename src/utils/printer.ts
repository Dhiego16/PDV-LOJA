import type { Sale, AppSettings } from '../types';

export const printReceipt = (sale: Sale, settings: AppSettings) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  
  // Calculate change if needed (assuming if payment is money and client isn't stored, we might not have change stored in Sale object directly in this version, but usually we print exact or what's in record. For simplicity in reprint, we show payment method).
  // Note: To show exact "Change" in reprint, we'd need to store 'cashReceived' in the Sale object. 
  // For now, reprints show the total paid.
  
  if (doc) {
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Recibo</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; }
            .header { text-align: center; margin-bottom: 10px; }
            .title { font-size: 16px; font-weight: bold; }
            .subtitle { font-size: 12px; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .qty-name { font-weight: bold; }
            .totals { margin-top: 10px; }
            .row { display: flex; justify-content: space-between; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
            @media print {
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${settings.companyName}</div>
            ${settings.cnpj ? `<div class="subtitle">CNPJ: ${settings.cnpj}</div>` : ''}
            ${settings.address ? `<div class="subtitle">${settings.address}</div>` : ''}
            ${settings.phone ? `<div class="subtitle">Tel: ${settings.phone}</div>` : ''}
            <div style="margin-top: 5px;">${new Date(sale.date).toLocaleString('pt-BR')}</div>
            <div>Pedido #${sale.id.slice(-6)}</div>
          </div>
          
          <div class="divider"></div>
          
          <div>
            ${sale.items.map((item) => `
              <div style="margin-bottom: 4px;">
                <div class="qty-name">${item.qty}x ${item.name}</div>
                <div class="item">
                  <span style="font-size: 10px; color: #555;">${item.barcode.slice(-4)}</span>
                  <span>R$ ${(item.price * item.qty).toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div class="totals">
            <div class="row"><span>Subtotal:</span> <span>R$ ${sale.subtotal.toFixed(2)}</span></div>
            ${sale.discount > 0 ? `<div class="row"><span>Desconto:</span> <span>-R$ ${sale.discount.toFixed(2)}</span></div>` : ''}
            <div class="row" style="font-weight: bold; font-size: 14px; margin-top: 5px;">
              <span>TOTAL:</span> <span>R$ ${sale.total.toFixed(2)}</span>
            </div>
            <div class="row" style="margin-top: 5px;">
              <span>Pagamento (${sale.paymentMethod}):</span> 
              <span>R$ ${sale.total.toFixed(2)}</span>
            </div>
            ${sale.client && sale.client !== 'Cliente Geral' ? `<div class="row" style="margin-top: 5px; font-size: 11px;"><span>Cliente:</span> <span>${sale.client}</span></div>` : ''}
          </div>
          
          <div class="footer">
            <div class="divider"></div>
            <p>${settings.receiptFooter || 'Obrigado pela preferência!'}</p>
            <p>*** NÃO É DOCUMENTO FISCAL ***</p>
          </div>
        </body>
      </html>
    `);
    doc.close();
    
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  }
};