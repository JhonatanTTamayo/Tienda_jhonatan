export function sendInvoiceToWhatsApp(phone, invoiceData) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '57' + cleanPhone.slice(1) : cleanPhone;

    let message = `*TIENDA JHONATAN* - COMPROBANTE DE PAGO%0A%0A`;
    message += `*Cliente:* ${invoiceData.clientName}%0A`;
    message += `*Fecha:* ${invoiceData.date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}%0A%0A`;
    message += `*TOTAL PAGADO:* $${Number(invoiceData.amount).toLocaleString('es-CO')}%0A%0A`;

    if (invoiceData.notes && invoiceData.notes.length > 0) {
        message += `*Fiados abonados:*%0A`;
        invoiceData.notes.forEach((note, i) => {
            message += `  ${i + 1}. ${note.description || 'Fiado'} - $${Number(note.paid).toLocaleString('es-CO')}%0A`;
        });
    }

    message += `%0A*Gracias por su pago!*%0A`;
    message += `Tienda Jhonatan - Sistema de Fiados`;

    const url = `https://wa.me/${finalPhone}?text=${message}`;
    window.open(url, '_blank');
}