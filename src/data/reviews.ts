export interface Review {
  city: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
}

// Real customer reviews only — never placeholder/fabricated testimonials.
// ReviewsSection.tsx renders nothing below 2 entries, and PRODUCT_SCHEMA's
// aggregateRating only appears from 3 entries (LandingPage.tsx).
export const REVIEWS: Review[] = [];
