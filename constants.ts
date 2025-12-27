
import type { Assistant } from './types';

const ZORA_PROMPT = `Você é ZORA™, um assistente criativo especializado em transformar ideias em prompts otimizados.`;
const NODE_PROMPT = `You are DIRECTOR NODE, specialist in cinematic narrative...`;
const LOKI_PROMPT = `Você é LOKI, estrategista de marketing e caos criativo...`;

export const ASSISTANTS: Assistant[] = [
  { 
    id: 'node', 
    name: 'NODE', 
    iconUrl: 'https://i.imgur.com/hihrifP.png', 
    ringColor: 'border-[#800080]', 
    descriptionKey: 'node_description', 
    longDescriptionKey: 'node_long_description',
    systemInstruction: NODE_PROMPT, 
    price: 127, 
    purchaseUrl: 'https://wa.me/16988043367', 
    examplePrompts: ['node_cap_1', 'node_cap_2', 'node_cap_3'],
    demoExamples: [
      { prompt: "A cyberpunk chase sequence.", responseKey: "node_demo_r1" },
      { prompt: "Opening for a space saga.", responseKey: "node_demo_r2" },
      { prompt: "High-speed chase structure.", responseKey: "node_demo_r3" }
    ]
  },
  { 
    id: 'zora', 
    name: 'ZORA', 
    iconUrl: 'https://i.imgur.com/dDCJf6w.jpeg', 
    ringColor: 'border-orange-500', 
    descriptionKey: 'zora_description', 
    longDescriptionKey: 'zora_long_description',
    systemInstruction: ZORA_PROMPT, 
    price: 97, 
    purchaseUrl: 'https://wa.me/16988043367', 
    examplePrompts: ['zora_cap_1', 'zora_cap_2', 'zora_cap_3'],
    demoExamples: [
      { prompt: "Macro shot of watch gears.", responseKey: "zora_demo_r1" },
      { prompt: "High-fashion desert editorial.", responseKey: "zora_demo_r2" },
      { prompt: "Visual DNA for luxury brand.", responseKey: "zora_demo_r3" }
    ]
  },
  { 
    id: 'wizi', 
    name: 'WIZI', 
    iconUrl: 'https://i.imgur.com/DLGf2bW.jpeg', 
    ringColor: 'border-blue-600', 
    descriptionKey: 'wizi_description', 
    longDescriptionKey: 'wizi_long_description',
    systemInstruction: 'Você é WIZI, focado em construção estruturada...', 
    price: 97, 
    purchaseUrl: 'https://wa.me/16988043367', 
    examplePrompts: ['wizi_cap_1', 'wizi_cap_2', 'wizi_cap_3'],
    demoExamples: [
      { prompt: "A temple inside a crystal.", responseKey: "wizi_demo_r1" },
      { prompt: "Floating library construction.", responseKey: "wizi_demo_r2" },
      { prompt: "Forest sanctuary sanctuary.", responseKey: "wizi_demo_r3" }
    ]
  },
  { 
    id: 'luma', 
    name: 'LUMA', 
    iconUrl: 'https://i.imgur.com/a1Rz61T.jpeg', 
    ringColor: 'border-teal-400', 
    descriptionKey: 'luma_description', 
    longDescriptionKey: 'luma_long_description',
    systemInstruction: 'Você é LUMA, engenheira técnica de cena...', 
    price: 87, 
    purchaseUrl: 'https://wa.me/16988043367', 
    examplePrompts: ['luma_cap_1', 'luma_cap_2', 'luma_cap_3'],
    demoExamples: [
      { prompt: "@deconstruct this scene: Noir.", responseKey: "luma_demo_r1" },
      { prompt: "@brief for luxury watch shoot.", responseKey: "luma_demo_r2" },
      { prompt: "@optics for wide street shoot.", responseKey: "luma_demo_r3" }
    ]
  },
  { 
    id: 'gram', 
    name: 'GRAM', 
    iconUrl: 'https://i.imgur.com/Snv9Zfk.jpeg', 
    ringColor: 'border-[#d2b48c]', 
    descriptionKey: 'gram_description', 
    longDescriptionKey: 'gram_long_description',
    systemInstruction: 'Você é GRAM, guardião do DNA visual...', 
    price: 127, 
    purchaseUrl: 'https://wa.me/16988043367', 
    examplePrompts: ['gram_cap_1', 'gram_cap_2', 'gram_cap_3'],
    demoExamples: [
      { prompt: "DNA for a dark fantasy comic.", responseKey: "gram_demo_r1" },
      { prompt: "Lock pixel-art RPG aesthetic.", responseKey: "gram_demo_r2" },
      { prompt: "Pastel dreamcore rules.", responseKey: "gram_demo_r3" }
    ]
  },
  { 
    id: 'loki', 
    name: 'LOKI', 
    iconUrl: 'https://i.imgur.com/eELvqjc.jpeg', 
    ringColor: 'border-lime-400', 
    descriptionKey: 'loki_description', 
    longDescriptionKey: 'loki_long_description',
    systemInstruction: LOKI_PROMPT, 
    price: 127, 
    purchaseUrl: 'https://wa.me/16988043367', 
    examplePrompts: ['loki_cap_1', 'loki_cap_2', 'loki_cap_3'],
    demoExamples: [
      { prompt: "Disruptive ad for vegan burger.", responseKey: "loki_demo_r1" },
      { prompt: "Viral coffee brand hook.", responseKey: "loki_demo_r2" },
      { prompt: "Chaos theory tech launch.", responseKey: "loki_demo_r3" }
    ]
  },
  { 
    id: 'iris', 
    name: 'ÍRIS', 
    iconUrl: 'https://i.imgur.com/rztcdE1.jpeg', 
    ringColor: 'border-pink-500', 
    descriptionKey: 'iris_description', 
    longDescriptionKey: 'iris_long_description',
    systemInstruction: 'Você é ÍRIS, conceptualista visual...', 
    price: 127, 
    purchaseUrl: 'https://wa.me/16988043367', 
    examplePrompts: ['iris_cap_1', 'iris_cap_2', 'iris_cap_3'],
    demoExamples: [
      { prompt: "Metaphor for 'Infinite Memory'.", responseKey: "iris_demo_r1" },
      { prompt: "Digital loneliness concept.", responseKey: "iris_demo_r2" },
      { prompt: "Visual metaphor for speed.", responseKey: "iris_demo_r3" }
    ]
  },
  { 
    id: 'vyne', 
    name: 'VYNE', 
    iconUrl: 'https://i.imgur.com/9k28l28.jpeg', 
    ringColor: 'border-[#f08080]', 
    descriptionKey: 'vyne_description', 
    longDescriptionKey: 'vyne_long_description',
    systemInstruction: 'Você é VYNE, compositor de som...', 
    price: 97, 
    purchaseUrl: 'https://wa.me/16988043367', 
    examplePrompts: ['vyne_cap_1', 'vyne_cap_2', 'vyne_cap_3'],
    demoExamples: [
      { prompt: "Sound for a haunted mansion.", responseKey: "vyne_demo_r1" },
      { prompt: "Underwater exploration track.", responseKey: "vyne_demo_r2" },
      { prompt: "Space epic instrumentation.", responseKey: "vyne_demo_r3" }
    ]
  },
];
