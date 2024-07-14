export type SiteConfig = typeof siteConfig;
import languages from "../config/languages.json";

import modelsJson from "./models.json";
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
      name: "Real Time sentiment analysis",
      model: "distilbert-base-uncased-finetuned-sst-2-english",
      screenshot: "/demos/static/offline-sentiment-analysis.jpeg",
      demo: "/demos/offline-sentiment-analysis.gif",
      href: "/offline-sentiment-analysis",
      tech: ["transformer.js"],
    },
    {
      name: "Language Translation",
      model: "nllb-200-distilled-600M",
      screenshot: "/demos/static/translator.jpeg",
      demo: "/demos/translator.gif",
      href: "/translation",
      tech: ["transformer.js"],
    },
    {
      name: "Tokenizer",
      screenshot: "/demos/static/tokenizer.jpeg",
      demo: "/demos/tokenizer.gif",
      href: "/tokenizer",
      tech: ["transformer.js"],
    },
    {
      name: "Object Detection",
      model: "detr-resnet-50",
      screenshot: "/demos/static/object-detection.jpeg",
      demo: "/demos/object-detection.gif",
      href: "/object-detection",
      tech: ["transformer.js"],
    },
    {
      name: "Local RAG",
      model: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
      screenshot: "/demos/static/translator.jpeg",
      demo: "/demos/translator.gif",
      href: "/rag",
      tech: ["langchain", "web-llm"],
    },
  ],
  languages: JSON.parse(JSON.stringify(languages)),
  models: JSON.parse(JSON.stringify(modelsJson)),
};
