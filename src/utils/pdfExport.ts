declare global {
  interface Window {
    html2pdf?: any;
    google?: any;
    gapi?: any;
  }
}

export async function generatePdfBlob(element: HTMLElement, filename: string): Promise<Blob> {
  if (!window.html2pdf) {
    throw new Error('La librería html2pdf.js no está cargada.');
  }

  // Ocultar elementos marcados con .no-print antes de la captura
  const noPrintElements = element.querySelectorAll<HTMLElement>('.no-print');
  const originalDisplays: string[] = [];
  noPrintElements.forEach((el, i) => {
    originalDisplays[i] = el.style.display;
    el.style.display = 'none';
  });

  const opt = {
    margin: [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollY: 0,
      scrollX: 0,
      logging: false,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    const worker = window.html2pdf().set(opt).from(element);
    const pdfBlob: Blob = await worker.output('blob');
    return pdfBlob;
  } finally {
    // Restaurar visibilidad original siempre
    noPrintElements.forEach((el, i) => {
      el.style.display = originalDisplays[i] || '';
    });
  }
}

export async function downloadPdfDirectly(element: HTMLElement, filename: string): Promise<void> {
  if (!window.html2pdf) {
    throw new Error('La librería html2pdf.js no está cargada.');
  }

  const noPrintElements = element.querySelectorAll<HTMLElement>('.no-print');
  const originalDisplays: string[] = [];
  noPrintElements.forEach((el, i) => {
    originalDisplays[i] = el.style.display;
    el.style.display = 'none';
  });

  const opt = {
    margin: [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollY: 0,
      scrollX: 0,
      logging: false,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await window.html2pdf().set(opt).from(element).save();
  } finally {
    noPrintElements.forEach((el, i) => {
      el.style.display = originalDisplays[i] || '';
    });
  }
}
