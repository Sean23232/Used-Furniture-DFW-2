export const CATEGORY_SLUGS = [
  "desks-workstations",
  "office-chairs",
  "conference-tables",
  "office-tables",
  "filing-storage",
  "reception-furniture",
  "lounge-furniture",
  "cubicles-workstations",
  "other-office-furniture",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface CategoryImage {
  src: string;
  alt: string;
  /** Optional CSS object-position to keep the furniture in frame. */
  position?: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  heading: string;
  seoTitle: string;
  metaDescription: string;
  description: string;
  intro: string;
  image: CategoryImage;
}

export const CATEGORIES: Category[] = [
  {
    slug: "desks-workstations",
    name: "Desks & Workstations",
    heading: "Used Office Desks & Workstations",
    seoTitle: "Used Office Desks & Workstations in Dallas–Fort Worth",
    metaDescription:
      "Browse pre-owned executive desks, standing desks, and office workstations for businesses in Dallas, Fort Worth, and across DFW. Call or send an inquiry.",
    description: "Executive desks, standing desks, and everyday work surfaces for private offices and open areas.",
    intro:
      "From executive desks for private offices to height-adjustable desks for flexible teams, browse pre-owned desks and work surfaces for workplaces across Dallas–Fort Worth. Contact our team to confirm availability, measurements, and pricing.",
    image: { src: "/images/categories/desks-workstations.jpg", alt: "Office with wood-tone desks and blue task chairs" },
  },
  {
    slug: "office-chairs",
    name: "Office Chairs",
    heading: "Used Office Chairs & Seating",
    seoTitle: "Used Office Chairs in Dallas & Fort Worth",
    metaDescription:
      "Shop pre-owned ergonomic task chairs, executive chairs, and conference seating for offices in Dallas, Fort Worth, and the DFW area. Ask our team about any chair.",
    description: "Ergonomic task chairs, executive seating, and conference chairs for every workspace.",
    intro:
      "Explore pre-owned ergonomic task chairs, executive chairs, and conference seating for offices throughout Dallas–Fort Worth. Seating options change frequently, so reach out to our team for current selection and details.",
    image: { src: "/images/categories/office-chairs.jpg", alt: "Ergonomic office chairs displayed behind showroom glass" },
  },
  {
    slug: "conference-tables",
    name: "Conference Tables",
    heading: "Used Conference Tables & Meeting Room Furniture",
    seoTitle: "Used Conference Room Tables in Dallas–Fort Worth",
    metaDescription:
      "Browse pre-owned conference room tables and meeting room furniture for Dallas–Fort Worth offices. View photos and details, then contact our team.",
    description: "Boardroom and meeting tables in a range of sizes, shapes, and finishes.",
    intro:
      "Find pre-owned conference tables for boardrooms, team rooms, and meeting spaces across the Dallas–Fort Worth area. Ask our team about dimensions, finishes, and matching seating.",
    image: {
      src: "/images/categories/conference-tables.jpg",
      alt: "Boardroom with a wood conference table and red upholstered chairs",
      position: "50% 85%",
    },
  },
  {
    slug: "office-tables",
    name: "Office Tables",
    heading: "Used Office, Training & Collaboration Tables",
    seoTitle: "Used Office, Training & Collaboration Tables in DFW",
    metaDescription:
      "Pre-owned training tables, collaboration tables, and meeting tables for offices in Dallas, Fort Worth, and surrounding DFW communities.",
    description: "Training, collaboration, and multipurpose tables for flexible spaces.",
    intro:
      "Browse pre-owned training tables, collaboration tables, and multipurpose office tables for flexible workspaces throughout Dallas–Fort Worth.",
    image: { src: "/images/categories/office-tables.jpg", alt: "Wood-top office table with white chairs against a blue wall" },
  },
  {
    slug: "filing-storage",
    name: "Filing Cabinets & Storage",
    heading: "Used Filing Cabinets & Office Storage",
    seoTitle: "Used Filing Cabinets & Office Storage in Dallas–Fort Worth",
    metaDescription:
      "Browse pre-owned lateral files, storage cabinets, and office storage for Dallas–Fort Worth businesses. Contact our team about availability.",
    description: "Lateral files, storage cabinets, and lockers to keep your office organized.",
    intro:
      "Keep your workspace organized with pre-owned lateral filing cabinets, storage cabinets, and other office storage. Ask our team about sizes, finishes, and keys.",
    image: { src: "/images/categories/filing-storage.jpg", alt: "Grey steel office storage lockers with label holders" },
  },
  {
    slug: "reception-furniture",
    name: "Reception Furniture",
    heading: "Used Reception Desks & Furniture",
    seoTitle: "Used Reception Desks & Reception Furniture in DFW",
    metaDescription:
      "Pre-owned reception desks and front-office furniture for businesses across Dallas, Fort Worth, and the DFW area. View details and send an inquiry.",
    description: "Reception desks and front-of-house pieces that make a strong first impression.",
    intro:
      "Create a welcoming front office with pre-owned reception desks and reception-area furniture. Contact our team for measurements, configuration details, and pricing.",
    image: { src: "/images/categories/reception-furniture.jpg", alt: "Office reception area with a white reception desk and glass walls" },
  },
  {
    slug: "lounge-furniture",
    name: "Lounge Furniture",
    heading: "Used Lounge & Waiting Area Furniture",
    seoTitle: "Used Office Lounge & Waiting Room Furniture in DFW",
    metaDescription:
      "Browse pre-owned lounge chairs and waiting area seating for offices across Dallas–Fort Worth. Ask our team about any piece.",
    description: "Lounge chairs and soft seating for waiting areas, break spaces, and lobbies.",
    intro:
      "Furnish lobbies, waiting areas, and collaborative spaces with pre-owned lounge chairs and soft seating suited to commercial settings.",
    image: { src: "/images/categories/lounge-furniture.jpg", alt: "Office waiting area with grey and yellow upholstered lounge seating" },
  },
  {
    slug: "cubicles-workstations",
    name: "Cubicles & Workstations",
    heading: "Used Cubicles & Modular Workstations",
    seoTitle: "Used Cubicles & Modular Office Workstations in Dallas–Fort Worth",
    metaDescription:
      "Explore pre-owned cubicles, panel systems, and benching workstations for DFW offices. Contact our team about configurations and pricing.",
    description: "Modular cubicles, panel systems, and benching for open-plan offices.",
    intro:
      "Outfit open-plan offices with pre-owned cubicles, modular panel workstations, and benching systems. Configurations vary, so contact our team to discuss layouts and pricing.",
    image: { src: "/images/categories/cubicles-workstations.jpg", alt: "Open-plan office with modular workstations and task chairs" },
  },
  {
    slug: "other-office-furniture",
    name: "Other Office Furniture",
    heading: "Other Used Office Furniture",
    seoTitle: "Other Used Office Furniture in Dallas–Fort Worth",
    metaDescription:
      "Pre-owned monitor arms, desk power accessories, and other office furniture for businesses throughout Dallas–Fort Worth. Contact our team for details.",
    description: "Monitor arms, desk power, and other pieces to complete your workspace.",
    intro:
      "Round out your workspace with monitor arms, desk power accessories, and other pre-owned office pieces. Don't see what you need? Ask our team — inventory changes regularly.",
    image: { src: "/images/categories/other-office-furniture.jpg", alt: "Meeting room with a wall-mounted whiteboard and white chairs" },
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((category) => [category.slug, category])) as Record<
  CategorySlug,
  Category
>;

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function getCategory(slug: string): Category | undefined {
  return isCategorySlug(slug) ? CATEGORY_MAP[slug] : undefined;
}

/** Homepage category groupings (some combine closely related catalog categories). */
export interface CategoryGroup {
  title: string;
  description: string;
  href: string;
  image: CategoryImage;
}

export const HOME_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: "Office Desks & Workstations",
    description: "Executive desks, standing desks, cubicles, and workstations for private offices and open-plan teams.",
    href: "/furniture?category=desks-workstations,cubicles-workstations",
    image: CATEGORY_MAP["desks-workstations"].image,
  },
  {
    title: "Office Chairs & Seating",
    description: "Ergonomic task chairs, executive chairs, and conference seating for every role.",
    href: "/furniture/office-chairs",
    image: CATEGORY_MAP["office-chairs"].image,
  },
  {
    title: "Conference & Meeting Tables",
    description: "Boardroom, meeting, training, and collaboration tables in a range of sizes.",
    href: "/furniture?category=conference-tables,office-tables",
    image: CATEGORY_MAP["conference-tables"].image,
  },
  {
    title: "Office Storage & Filing",
    description: "Lateral files, storage cabinets, and practical storage for organized offices.",
    href: "/furniture/filing-storage",
    image: CATEGORY_MAP["filing-storage"].image,
  },
  {
    title: "Reception & Lounge Furniture",
    description: "Reception desks, lounge chairs, and waiting-area seating that welcome visitors.",
    href: "/furniture?category=reception-furniture,lounge-furniture",
    image: CATEGORY_MAP["reception-furniture"].image,
  },
  {
    title: "Other Office Furniture",
    description: "Monitor arms, desk power accessories, and other pieces to complete your workspace.",
    href: "/furniture/other-office-furniture",
    image: CATEGORY_MAP["other-office-furniture"].image,
  },
];
