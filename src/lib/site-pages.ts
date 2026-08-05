export type SitePageSlug = 'privacy' | 'terms' | 'contact';

export interface SitePageContent {
  slug: SitePageSlug;
  title: string;
  content: string;
  updated_at?: string;
}

export const defaultSitePages: Record<SitePageSlug, SitePageContent> = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    content: `DineBox respects your privacy. We collect only the information needed to operate the platform, provide our services, and improve your experience.\n\nWe may use anonymous activity data to understand how DineBox is used. We do not sell personal information.\n\nFor privacy questions or requests, contact us at hello@dinebox.sg.`,
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    content: `By using DineBox, you agree to use the platform lawfully and provide accurate information. Restaurant operators remain responsible for the content, offers, and information they publish.\n\nDineBox may update, moderate, or remove content that breaches these terms or applicable law.\n\nIf you have questions about these terms, contact us at hello@dinebox.sg.`,
  },
  contact: {
    slug: 'contact',
    title: 'Contact Us',
    content: `We would love to hear from you.\n\nEmail: hello@dinebox.sg\n\nFor restaurant partnerships and business enquiries, please include your restaurant name and contact details.`,
  },
};
