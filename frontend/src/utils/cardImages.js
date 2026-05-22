import digitalCoursesImg from '../assets/stitch-cards/digital-courses.png';
import digitalToolsImg from '../assets/stitch-cards/digital-tools.png';
import freebiesImg from '../assets/stitch-cards/freebies.png';
import pdfBooksImg from '../assets/stitch-cards/pdf-books.png';
import plrEbooksImg from '../assets/stitch-cards/plr-ebooks.png';
import templatesImg from '../assets/stitch-cards/templates.png';
import workbooksPlannersImg from '../assets/stitch-cards/workbooks-planners.png';

export const stitchCardImages = {
  'digital-courses': digitalCoursesImg,
  'digital-tools-software': digitalToolsImg,
  'digital-tools': digitalToolsImg,
  freebies: freebiesImg,
  'pdf-books': pdfBooksImg,
  'ebooks-plr': plrEbooksImg,
  'plr-ebooks': plrEbooksImg,
  templates: templatesImg,
  'workbooks-planners': workbooksPlannersImg,
};

export function getStitchCardImage(key) {
  return stitchCardImages[key] || digitalToolsImg;
}

export function getImageForCardText(text = '') {
  const value = String(text || '').toLowerCase();

  if (value.includes('course') || value.includes('دورة') || value.includes('kurs')) {
    return digitalCoursesImg;
  }

  if (
    value.includes('tool') ||
    value.includes('software') ||
    value.includes('أداة') ||
    value.includes('برنامج')
  ) {
    return digitalToolsImg;
  }

  if (value.includes('free') || value.includes('مجاني') || value.includes('kostenlos')) {
    return freebiesImg;
  }

  if (value.includes('pdf') || value.includes('book') || value.includes('كتاب') || value.includes('buch')) {
    return pdfBooksImg;
  }

  if (value.includes('plr') || value.includes('ebook') || value.includes('e-book')) {
    return plrEbooksImg;
  }

  if (value.includes('template') || value.includes('قالب') || value.includes('vorlage')) {
    return templatesImg;
  }

  if (value.includes('workbook') || value.includes('planner') || value.includes('مخطط') || value.includes('planer')) {
    return workbooksPlannersImg;
  }

  return digitalToolsImg;
}
