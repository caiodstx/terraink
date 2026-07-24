import { REVIEWS } from "@/data/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="landing-review-stars" aria-label={`${rating} de 5 estrellas`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

// Renders nothing with fewer than 2 real reviews — no filler/placeholder
// content standing in for testimonials that don't exist yet.
export default function ReviewsSection() {
  if (REVIEWS.length < 2) return null;

  return (
    <section className="landing-reviews">
      <h2>Lo que dicen los clientes</h2>
      <div className="landing-reviews-grid">
        {REVIEWS.map((review, index) => (
          <div key={index} className="landing-review-card">
            <Stars rating={review.rating} />
            <p className="landing-review-text">&ldquo;{review.text}&rdquo;</p>
            <p className="landing-review-city">{review.city}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
