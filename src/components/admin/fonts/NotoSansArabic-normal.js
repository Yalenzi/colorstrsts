// ملف الخط العربي لـ jsPDF
// يجب تحميل الخط من Google Fonts وتحويله إلى base64

import { jsPDF } from 'jspdf';

// تسجيل الخط العربي
const NotoSansArabicFont = `
// هنا يجب إضافة الخط المحول إلى base64
// يمكن الحصول عليه من: https://fonts.google.com/specimen/Noto+Sans+Arabic
`;

// تسجيل الخط في jsPDF
if (typeof window !== 'undefined') {
  jsPDF.API.events.push([
    'addFonts',
    function() {
      this.addFileToVFS('NotoSansArabic-normal.ttf', NotoSansArabicFont);
      this.addFont('NotoSansArabic-normal.ttf', 'NotoSansArabic', 'normal');
    }
  ]);
}

export default NotoSansArabicFont;