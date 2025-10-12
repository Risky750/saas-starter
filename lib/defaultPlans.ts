import type { Plan } from "@/types/pricing";

export const defaultPlans: Plan[] = [
  {
    id: "1",
    name: "Standard",
    monthly: 3500,
    quarterly: 3166.66,
    features: [
      "1-page personal portfolio",
      "Custom colours & branding",
      "Social-media integration",
      "Free consultation & setup guide",
      "Free domain",
    ],
  },
  {
    id: "2",
    name: "Premium",
    monthly: 5000,
    quarterly: 4666.66,
    features: [
      "1-page personal portfolio",
      "Custom colours & branding",
      "Social-media integration",
      "Free consultation & setup guide",
      "Custom e-mail setup",
      "Free domain",
    ],
  },
  {
    id: "3",
    name: "Enterprise",
    monthly: 10000,
    quarterly: 9666.66,
    features: [
      "1-page personal portfolio",
      "Custom colours & branding",
      "Social-media integration",
      "Free consultation & setup guide",
      "Custom e-mail setup",
      "Free domain",
      "E-mail hosting",
      "SEO optimisation",
    ],
  },
];
