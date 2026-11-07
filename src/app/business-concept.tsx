import { AudienceCard } from "./audience-card";
import { ProductsShowcase } from "./products-showcase";

const audience = [
  { title: "Creative flavor explorers", copy: "Gen Z and Millennials, ages 16–35, who enjoy food trends and want to help create their dessert. They value individuality, new combinations, and the freedom to choose. Our concept focuses on middle- to upper-middle-income consumers in urban and highly urbanized areas." },
  { title: "Aesthetic & social-driven", copy: "People drawn to beautiful, distinctive food that expresses their personal style and gives them something memorable to share on social media." },
  { title: "Bento cake buyers", copy: "Customers of home-based and bento bakers who already enjoy customization and would welcome consistent branding and a structured ordering experience." },
  { title: "Thoughtful celebration makers", copy: "Gifters and occasion-based buyers celebrating birthdays, personal milestones, and small gatherings, where a personal creation carries extra meaning." },
];

export function BusinessConcept() {
  return <section className="business-concept" id="business" aria-labelledby="business-title">
    <h2 className="sr-only" id="business-title">Our audience and products</h2>
    <div className="business-wrap">
      <section className="business-part" id="audience" aria-labelledby="audience-title"><div className="business-subheading"><span className="eyebrow">TARGET AUDIENCE</span><h3 id="audience-title">Made for people<br />who make it their own.</h3></div><div className="audience-grid">{audience.map(item => <AudienceCard key={item.title} title={item.title} copy={item.copy} />)}</div></section>
    </div>
    <ProductsShowcase />
  </section>;
}
