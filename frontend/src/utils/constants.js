export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const marketplaceCategories = [
  {
    label: "PDF Books",
    slug: "pdf-books",
    icon: "FileText",
    description: "Downloadable PDF books and reading resources."
  },
  {
    label: "E-Books (PLR)",
    slug: "ebooks-plr",
    icon: "BookOpen",
    description: "Private label rights e-books and editable digital content."
  },
  {
    label: "Workbooks & Planners",
    slug: "workbooks-planners",
    icon: "ClipboardList",
    description: "Workbooks, planners, journals, and productivity resources."
  },
  {
    label: "Templates",
    slug: "templates",
    icon: "LayoutTemplate",
    description: "Ready-to-use templates for business, design, and productivity."
  },
  {
    label: "Digital Courses",
    slug: "digital-courses",
    icon: "GraduationCap",
    description: "Learning materials, course files, and educational products."
  },
  {
    label: "Digital Tools & Software",
    slug: "digital-tools-software",
    icon: "Wrench",
    description: "Digital tools, software resources, scripts, and utilities."
  },
  {
    label: "Freebies",
    slug: "freebies",
    icon: "Gift",
    description: "Free digital products, samples, templates, and resources."
  }
];

