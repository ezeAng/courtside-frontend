export type OnboardingSlideContent = {
  key: string;
  title: string;
  description: string;
  image: string;
};

export const onboardingSlides: OnboardingSlideContent[] = [
  {
    key: "identity",
    title: "Your game, finally tracked properly",
    description:
      "Log matches, track your progress, and see how your level evolves over time — all in one place.",
    image: "/assets/onboarding/player-card.svg",
  },
  {
    key: "progress",
    title: "See real progress, not guesses",
    description:
      "Every match updates your rating and stats, so you always know where you stand and what to improve.",
    image: "/assets/onboarding/progress-chart.svg",
  },
  {
    key: "social",
    title: "Play with context, not in isolation",
    description:
      "Compare stats, invite friends, and see how you stack up — casually or competitively.",
    image: "/assets/onboarding/social-compare.svg",
  },
];
