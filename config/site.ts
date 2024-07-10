export type SiteConfig = typeof siteConfig;
import languages from "../config/languages.json";

export const siteConfig = {
  name: "bitesinbyte - playground",
  description:
    "demos related to offline ai models, onnx runtime, transformer js and many more",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Blog",
      href: "https://blogs.bitesinbyte.com/",
    },
  ],
  links: {
    github: "https://github.com/bitesinbyte/playground",
    twitter: "https://x.com/bitesinbyte",
    sponsor: "https://github.com/sponsors/manishtiwari25",
  },
  demos: [
    {
      name: "Real Time sentiment analysis [Offline]",
      model: "distilbert-base-uncased-finetuned-sst-2-english",
      screenshot: "/demos/offline-sentiment-analysis.gif",
      href: "/offline-sentiment-analysis",
    },
    {
      name: "Language Translation [Offline]",
      model: "nllb-200-distilled-600M",
      screenshot: "/demos/translator.gif",
      href: "/translation",
    },
  ],
  languages: JSON.parse(JSON.stringify(languages)),
};
