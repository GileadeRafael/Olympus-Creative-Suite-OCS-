import type { Assistant, Message } from '../types';
import { Remarkable } from 'remarkable';

// TypeScript declarations for global libraries from CDN
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

// This instance is for converting markdown to HTML for rendering
const mdToHtml = new Remarkable({
  html: true, 
  breaks: true,
  linkify: true,
});

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 15;

async function fetchImageAsBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) return '';
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error fetching image for PDF:", error);
        return '';
    }
}

async function addHeader(doc: any, assistant: Assistant) {
    const base64Avatar = await fetchImageAsBase64(assistant.iconUrl);
    if (base64Avatar) {
        try {
          doc.addImage(base64Avatar, 'JPEG', MARGIN_MM, MARGIN_MM, 20, 20);
        } catch (e) {
            console.error("Failed to add avatar to PDF, might be CORS or invalid image.", e);
        }
    }
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(assistant.name, MARGIN_MM + 25, MARGIN_MM + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    const exportTime = new Date().toLocaleString();
    doc.text(`Chat History Exported: ${exportTime}`, MARGIN_MM + 25, MARGIN_MM + 16);
    
    doc.setDrawColor(220);
    doc.line(MARGIN_MM, MARGIN_MM + 28, A4_WIDTH_MM - MARGIN_MM, MARGIN_MM + 28);
    
    return MARGIN_MM + 38; // Return starting Y position for content
}

async function renderSimpleHtmlToCanvas(message: Message, assistant: Assistant, isDarkMode: boolean) {
    const renderContainer = document.createElement('div');
    renderContainer.style.position = 'fixed';
    renderContainer.style.left = '-9999px';
    renderContainer.style.width = '180mm'; // A4 width minus margins
    renderContainer.style.fontFamily = '"Bricolage Grotesque", sans-serif';
    renderContainer.style.fontSize = '11pt';
    renderContainer.style.lineHeight = '1.5';
    renderContainer.style.backgroundColor = isDarkMode ? '#191919' : '#FFFFFF';
    renderContainer.style.color = isDarkMode ? '#E4E4E7' : '#18181B';

    const prefix = message.role === 'user' ? 'You:' : `${assistant.name}:`;
    const contentHtml = mdToHtml.render(message.content);
    
    let imagesText = '';
    if (message.images && message.images.length > 0) {
        imagesText = `<div style="font-size: 9pt; color: #71717A; margin-top: 4px;">[${message.images.length} image(s) attached]</div>`;
    }

    renderContainer.innerHTML = `
        <div style="margin-bottom: 12px; padding: 5px 0;">
            <p style="margin:0; padding:0; font-weight: bold; color: ${isDarkMode ? '#A1A1AA' : '#3F3F46'};">
                ${prefix}
            </p>
            <div style="margin:0; padding:0; white-space: pre-wrap; word-wrap: break-word;">
                ${contentHtml}
            </div>
            ${imagesText}
        </div>
    `;
    
    // Applying basic prose styles manually since Tailwind classes won't work here.
    // FIX: Cast elements from querySelectorAll to specific HTML element types (e.g., HTMLParagraphElement)
    // to resolve TypeScript errors where the generic 'Element' type does not have a 'style' property.
    renderContainer.querySelectorAll<HTMLParagraphElement>('p').forEach(p => { p.style.margin = '0.5em 0'; });
    renderContainer.querySelectorAll<HTMLUListElement | HTMLOListElement>('ul, ol').forEach(list => { list.style.paddingLeft = '20px'; });
    renderContainer.querySelectorAll<HTMLLIElement>('li').forEach(li => { li.style.marginBottom = '0.25em'; });
    renderContainer.querySelectorAll<HTMLAnchorElement>('a').forEach(a => { a.style.color = '#8A5DFF'; a.style.textDecoration = 'underline'; });
    renderContainer.querySelectorAll<HTMLPreElement>('pre').forEach(pre => { 
        pre.style.backgroundColor = isDarkMode ? '#181818' : '#F3F4F6'; 
        pre.style.padding = '1em';
        pre.style.borderRadius = '8px';
        pre.style.overflowX = 'auto';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordWrap = 'break-word';
        pre.style.border = isDarkMode ? '1px solid #27272A' : '1px solid #E5E7EB';
    });
     renderContainer.querySelectorAll<HTMLElement>('code').forEach(code => {
        code.style.fontFamily = 'monospace';
        code.style.fontSize = '0.9em';
        if (code.parentElement?.tagName.toLowerCase() !== 'pre') {
            code.style.backgroundColor = isDarkMode ? '#27272A' : '#E5E7EB';
            code.style.padding = '0.2em 0.4em';
            code.style.borderRadius = '4px';
        }
    });

    document.body.appendChild(renderContainer);

    const canvas = await window.html2canvas(renderContainer, {
        scale: 2, // Higher resolution for crisp text
        useCORS: true,
        backgroundColor: isDarkMode ? '#191919' : '#FFFFFF',
    });

    document.body.removeChild(renderContainer);
    return canvas;
}

export async function generatePdf(messages: Message[], assistant: Assistant) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    let y = await addHeader(doc, assistant);

    for (const msg of messages) {
        const canvas = await renderSimpleHtmlToCanvas(msg, assistant, isDarkMode);
        const imgData = canvas.toDataURL('image/png');

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const pdfImgWidth = A4_WIDTH_MM - MARGIN_MM * 2;
        const pdfImgHeight = (imgHeight * pdfImgWidth) / imgWidth;

        if (y + pdfImgHeight > A4_HEIGHT_MM - MARGIN_MM) {
            doc.addPage();
            y = MARGIN_MM;
        }

        doc.addImage(imgData, 'PNG', MARGIN_MM, y, pdfImgWidth, pdfImgHeight);
        y += pdfImgHeight;
    }

    doc.save(`ZPS_${assistant.name}_Chat_History.pdf`);
}