
export type LanguageCode = 'en' | 'pt' | 'es' | 'zh' | 'fr';

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    'demo_sneak_peek': 'System Sneak Peek',
    'assistant_presentation': 'Assistant Presentation',
    'get_access': 'Get Full Access',
    'already_unlocked': 'Already Unlocked',
    'example_prompts_title': 'Capabilities',
    
    // CAPABILITIES
    'zora_cap_1': 'Ultra-realistic macro analysis',
    'zora_cap_2': 'Cinematic lighting blueprints',
    'zora_cap_3': 'Dynamic skin texture engine',
    'node_cap_1': '15-Node narrative structures',
    'node_cap_2': 'Cinematic continuity logic',
    'node_cap_3': 'Atmospheric world building',
    'wizi_cap_1': 'Structured construction steps',
    'wizi_cap_2': 'Environment depth layering',
    'wizi_cap_3': 'Lucid creative guidance',
    'luma_cap_1': '@brief technical deconstruction',
    'luma_cap_2': '@optics and lens selection',
    'luma_cap_3': '@pipeline for 3D workflows',
    'gram_cap_1': 'Aesthetic DNA extraction',
    'gram_cap_2': 'Style-law enforcement',
    'gram_cap_3': 'Visual consistency guarding',
    'loki_cap_1': 'Chaos strategy marketing',
    'loki_cap_2': 'Disruptive viral hooks',
    'loki_cap_3': 'Creative wild card thinking',
    'iris_cap_1': 'Conceptual soul metaphors',
    'iris_cap_2': 'Abstract visual psychology',
    'iris_cap_3': 'Soul-depth exploration',
    'vyne_cap_1': 'Auditory layout mapping',
    'vyne_cap_2': 'BPM and frequency logic',
    'vyne_cap_3': 'Cinematic soundscape design',

    // LONG DESCRIPTIONS
    'node_long_description': 'NODE is the elite Director for cinematic minds. It doesn\'t just write prompts; it creates 15-node narrative structures that ensure emotional continuity and world-class lighting.',
    'zora_long_description': 'ZORA™ is Gileade\'s masterpiece in visual engineering. She transforms any blurry idea into a high-fidelity photographic blueprint with professional-grade realism.',
    'wizi_long_description': 'WIZI is your lucid creative partner. He breaks creative blocks by guiding you through a structured 4-step process: Subject, Environment, Style, and Detail.',
    'luma_long_description': 'LUMA acts as your technical scene engineer. She deconstructs any concept into its optical components, perfect for creators who want to understand the "why" behind the frame.',
    'gram_long_description': 'GRAM is the guardian of visual DNA. Provide a reference or a style, and GRAM locks in the line weight and palette, ensuring your entire collection follows the same aesthetic law.',
    'loki_long_description': 'LOKI is the creative wild card. Part screenwriter, part chaos engineer, part marketing genius. Use LOKI when you need a story that bites or an idea that disrupts.',
    'vyne_long_description': 'VYNE is a musical architect. He translates visual moods into technical auditory structures, defining the BPM and emotional frequency of your soundscapes.',
    'iris_long_description': 'ÍRIS is a visual conceptualist. She explores the abstract and the symbolic, helping you find the "soul" of a concept before you even touch a prompt.',

    // DEMOS - ZORA
    'zora_demo_r1': '### ⚡ ZORA Macro Blueprint\n**Analysis:** Internal watch mechanics. Need f/5.6 for detail.\n**Prompt:** `Macro shot, Swiss movement gears, polished brass, gears turning, bokeh background, 8k resolution, raytracing --v 6.0`',
    'zora_demo_r2': '### ⚡ ZORA Fashion Blueprint\n**Analysis:** Arid desert environment. 85mm lens.\n**Prompt:** `Vogue editorial, model in desert, sunset lighting, harsh shadows, silk fabric fluttering, high grain, 85mm f/1.8 --ar 4:5`',
    'zora_demo_r3': '### ⚡ ZORA Brand DNA\n**Analysis:** Luxury aesthetic. Minimalist lighting.\n**Prompt:** `Luxury perfume bottle, monolith glass, dark stone background, rim lighting, vapor mist, ultra-modern, cinematic --v 6.0`',

    // DEMOS - NODE
    'node_demo_r1': '### 🎬 NODE Cyberpunk Structure\n**Node 1:** Rain-slicked neon street.\n**Node 2:** Flying vehicle streaks past.\n**Node 3:** Hero close-up, high tension.',
    'node_demo_r2': '### 🎬 NODE Space Saga\n**Node 1:** Vast planetary rings in shadow.\n**Node 2:** Small scout ship approaching.\n**Node 3:** Interior cockpit view, silence of space.',
    'node_demo_r3': '### 🎬 NODE High-Speed Logic\n**Node 1:** Tense driver hands on wheel.\n**Node 2:** Blurred street lights passing.\n**Node 3:** Sudden explosion in the distance.',

    // DEMOS - WIZI
    'wizi_demo_r1': '### 🧩 WIZI Crystal Temple\n1. **Subject:** Monk meditating.\n2. **Env:** Floating amethyst platforms.\n3. **Style:** Ethereal fantasy.\n4. **Detail:** Glowing runes.',
    'wizi_demo_r2': '### 🧩 WIZI Cloud Library\n1. **Subject:** Infinite bookshelves.\n2. **Env:** Cumulus cloud base.\n3. **Style:** Solar-punk.\n4. **Detail:** Golden flying pages.',
    'wizi_demo_r3': '### 🧩 WIZI Forest Sanctuary\n1. **Subject:** Ancient tree spirits.\n2. **Env:** Bioluminescent grove.\n3. **Style:** Ghibli-esque.\n4. **Detail:** Morning fog.',

    // DEMOS - LUMA
    'luma_demo_r1': '### 🔍 LUMA @deconstruct Noir\n**Lighting:** Venetian blind shadows.\n**Lens:** 35mm anamorphic.\n**Mood:** Cold coffee and smoke.',
    'luma_demo_r2': '### 🔍 LUMA @brief Watch\n**Setup:** 3-point lighting.\n**Optics:** 100mm macro.\n**Focus:** Depth stack for sharpness.',
    'luma_demo_r3': '### 🔍 LUMA @optics Wide\n**Lens:** 14mm ultra-wide.\n**Perspective:** Low-angle distortion.\n**Aperture:** f/11 for deep focus.',

    // DEMOS - GRAM
    'gram_demo_r1': '### 🎨 GRAM Fantasy DNA\n**Law:** Heavy charcoal, expressive ink.\n**Colors:** #2F1B41 vs #F9F7F0.\n**Rule:** No clean lines allowed.',
    'gram_demo_r2': '### 🎨 GRAM Pixel DNA\n**Law:** 16-bit color depth.\n**Dithering:** High-density.\n**Rule:** 32x32 sprite scaling.',
    'gram_demo_r3': '### 🎨 GRAM Source Extraction\n**Law:** Pastel dreamcore aesthetic.\n**Glow:** 40% bloom.\n**Rule:** Soft focus edges only.',

    // DEMOS - LOKI
    'loki_demo_r1': '### 🌀 LOKI Vegan Burger\n**Hook:** "Tastes like the future, not the cow."\n**Chaos:** Exploding vegetable 3D render.',
    'loki_demo_r2': '### 🌀 LOKI Coffee Hook\n**Hook:** "Built for those who outrun the simulation."\n**Chaos:** Glitch-art slow-mo liquid.',
    'loki_demo_r3': '### 🌀 LOKI Tech Launch\n**Hook:** "The only tool you can\'t ignore."\n**Chaos:** Guerrilla marketing countdown.',

    // DEMOS - IRIS
    'iris_demo_r1': '### 👁️ IRIS Memory Metaphor\n**Image:** Ocean of crystal eyes.\n**Soul:** Deep blues vs blinding white.',
    'iris_demo_r2': '### 👁️ IRIS Loneliness Concept\n**Image:** Single pixel in grey desert.\n**Soul:** Cold tones vs sharp geometry.',
    'iris_demo_r3': '### 👁️ IRIS Speed Metaphor\n**Image:** Solid light bending around curves.\n**Soul:** Kinetic energy frozen in time.',

    // DEMOS - VYNE
    'vyne_demo_r1': '### 🎵 VYNE Haunted Layout\n**Instruments:** Pipe organ, distant reverb.\n**BPM:** Variable anxiety flow.',
    'vyne_demo_r2': '### 🎵 VYNE Underwater Track\n**Instruments:** Sub-bass, sonar pings.\n**Atmosphere:** Eternal muffled silence.',
    'vyne_demo_r3': '### 🎵 VYNE Space Epic\n**Instruments:** Modular synths, brass swells.\n**Atmosphere:** Majestic void.',

    // Common keys
    'node_description': 'Cinematic Narrative Director',
    'zora_description': 'Photorealistic Visual Engineer',
    'wizi_description': 'Creative World Builder',
    'luma_description': 'Technical Scene Deconstructor',
    'gram_description': 'Aesthetic Style Guardian',
    'loki_description': 'Creative Strategy Wildcard',
    'zora_json_description': 'JSON Data Visual Blueprint',
    'vyne_description': 'Musical Composition Guide',
    'iris_description': 'Visual Concept Artist',
    'message_placeholder': 'Message {assistantName}...',
    'chats': 'Chats',
    'new_chat': 'New Chat',
    'personalized_greeting': '{greeting}, {username}!',
    'greeting_morning': 'Good morning',
    'greeting_afternoon': 'Good afternoon',
    'greeting_evening': 'Good evening',
    'copy_button_text': 'Copy',
    'copied_confirmation_text': 'Copied!',
    'unlock_assistant_title': 'Unlock {assistantName}',
    'unlock_assistant_description': 'Get access to this professional tool.',
    'buy_now_button': 'Unlock for {price}',
    'redirect_notice': 'Redirecting to checkout...',
    'notifications_title': 'Notifications',
    'notifications_empty': 'Clean slate.',
    'clear_notifications': 'Clear all',
    'notifications_close': 'Close',
    'notification_badge_unlocked': 'Badge: {badgeName}',
    'search_chats_placeholder': 'Search...',
    'no_chats_yet': 'No history with {assistantName}',
    'delete_chat_confirm': 'Delete this?',
    'delete_chat_label': 'Delete',
    'edit_chat_title': 'Rename',
    'select_language': 'Language',
    'switch_to_language': 'Switch to {languageName}',
    'switch_to_dark_mode': 'Dark',
    'switch_to_light_mode': 'Light',
    'expand_history': 'Show History',
    'collapse_history': 'Hide History',
    'drop_files_here': 'Drop files',
    'send_error': 'Error. Try again.'
  },
  pt: {
    'demo_sneak_peek': 'Vislumbre do Sistema',
    'assistant_presentation': 'Apresentação do Assistente',
    'get_access': 'Obter Acesso Total',
    'already_unlocked': 'Já Desbloqueado',
    'example_prompts_title': 'Capacidades',

    // CAPABILITIES
    'zora_cap_1': 'Análise macro ultra-realista',
    'zora_cap_2': 'Projetos de iluminação cinematográfica',
    'zora_cap_3': 'Motor de textura de pele dinâmica',
    'node_cap_1': 'Estruturas narrativas de 15 nós',
    'node_cap_2': 'Lógica de continuidade visual',
    'node_cap_3': 'Construção de mundo atmosférico',
    'wizi_cap_1': 'Passos de construção estruturados',
    'wizi_cap_2': 'Camadas de profundidade de ambiente',
    'wizi_cap_3': 'Orientação criativa lúcida',
    'luma_cap_1': '@brief de desconstrução técnica',
    'luma_cap_2': '@optics e seleção de lentes',
    'luma_cap_3': '@pipeline para fluxos 3D',
    'gram_cap_1': 'Extração de DNA estético',
    'gram_cap_2': 'Execução de leis de estilo',
    'gram_cap_3': 'Guarda de consistência visual',
    'loki_cap_1': 'Estratégia de marketing do caos',
    'loki_cap_2': 'Ganchos virais disruptivos',
    'loki_cap_3': 'Pensamento criativo curinga',
    'iris_cap_1': 'Metáforas conceituais da alma',
    'iris_cap_2': 'Psicologia visual abstrata',
    'iris_cap_3': 'Exploração de profundidade',
    'vyne_cap_1': 'Mapeamento de layout auditivo',
    'vyne_cap_2': 'Lógica de BPM e frequência',
    'vyne_cap_3': 'Design de som cinematográfico',

    // LONG DESCRIPTIONS
    'node_long_description': 'NODE é o Diretor de elite para mentes cinematográficas. Ele não apenas escreve prompts; ele cria estruturas narrativas de 15 nós que garantem continuidade emocional e iluminação de classe mundial.',
    'zora_long_description': 'ZORA™ é a obra-prima de Gileade em engenharia visual. Ela transforma qualquer ideia em um projeto fotográfico de alta fidelidade com realismo de nível profissional.',
    'wizi_long_description': 'WIZI é seu parceiro criativo lúcido. Ele quebra bloqueios criativos guiando você através de um processo estruturado de 4 passos: Assunto, Ambiente, Estilo e Detalhe.',
    'luma_long_description': 'LUMA atua como sua engenheira técnica de cena. Ela desconstroi qualquer conceito em seus componentes ópticos, perfeito para criadores que querem entender o "porquê" do frame.',
    'gram_long_description': 'GRAM é o guardião do DNA visual. Forneça uma referência ou um estilo, e o GRAM bloqueia o peso da linha e a paleta, garantindo consistência total na sua coleção.',
    'loki_long_description': 'LOKI é o curinga criativo. Parte roteirista, parte engenheiro do caos, parte gênio do marketing. Use o LOKI quando precisar de uma história que impacte ou uma ideia disruptiva.',
    'vyne_long_description': 'VYNE é um arquiteto musical. Ele traduz atmosferas visuais em estruturas auditivas técnicas, definindo o BPM e a frequência emocional de suas trilhas.',
    'iris_long_description': 'ÍRIS é uma conceptualista visual. Ela explora o abstrato e o simbólico, ajudando você a encontrar a "alma" de um conceito antes mesmo do prompt.',

    // DEMOS - ZORA
    'zora_demo_r1': '### ⚡ ZORA Macro Blueprint\n**Análise:** Mecânica interna de relógio. Foco f/5.6.\n**Prompt:** `Macro, engrenagens de relógio suíço, latão polido, engrenagens girando, bokeh, 8k, raytracing --v 6.0`',
    'zora_demo_r2': '### ⚡ ZORA Fashion Blueprint\n**Análise:** Editorial desértico. Lente 85mm.\n**Prompt:** `Editorial Vogue, modelo no deserto, pôr do sol, sombras duras, seda flutuando, granulado, 85mm f/1.8 --ar 4:5`',
    'zora_demo_r3': '### ⚡ ZORA Brand DNA\n**Análise:** Estética de luxo. Luz minimalista.\n**Prompt:** `Frasco de perfume de luxo, vidro monolítico, pedra escura, rim lighting, névoa, ultra-moderno, cinematográfico`',

    // DEMOS - NODE
    'node_demo_r1': '### 🎬 NODE Estrutura Cyberpunk\n**Nó 1:** Rua neon molhada.\n**Nó 2:** Veículo voador cruzando.\n**Nó 3:** Close do herói, alta tensão.',
    'node_demo_r2': '### 🎬 NODE Saga Espacial\n**Nó 1:** Vastos anéis planetários em sombra.\n**Nó 2:** Pequena nave batedora se aproximando.\n**Nó 3:** Vista interna do cockpit, silêncio espacial.',
    'node_demo_r3': '### 🎬 NODE Lógica de Velocidade\n**Nó 1:** Mãos tensas no volante.\n**Nó 2:** Luzes da rua borradas passando.\n**Nó 3:** Explosão repentina ao longe.',

    // DEMOS - WIZI
    'wizi_demo_r1': '### 🧩 WIZI Templo de Cristal\n1. **Assunto:** Monge meditando.\n2. **Env:** Plataformas de ametista flutuantes.\n3. **Style:** Fantasia etérea.\n4. **Detail:** Runas brilhantes.',
    'wizi_demo_r2': '### 🧩 WIZI Biblioteca nas Nuvens\n1. **Assunto:** Estantes infinitas.\n2. **Env:** Nuvens cúmulos.\n3. **Style:** Solar-punk.\n4. **Detail:** Páginas douradas voadoras.',
    'wizi_demo_r3': '### 🧩 WIZI Santuário na Floresta\n1. **Assunto:** Espíritos das árvores.\n2. **Env:** Bosque bioluminescente.\n3. **Style:** Ghibli-esque.\n4. **Detail:** Névoa matinal.',

    // DEMOS - LUMA
    'luma_demo_r1': '### 🔍 LUMA @deconstruct Noir\n**Luz:** Sombras de persiana.\n**Lente:** 35mm anamórfica.\n**Mood:** Café frio e fumaça.',
    'luma_demo_r2': '### 🔍 LUMA @brief Relógio\n**Setup:** Luz de 3 pontos.\n**Óptica:** Macro 100mm.\n**Focus:** Empilhamento de foco.',
    'luma_demo_r3': '### 🔍 LUMA @optics Aberto\n**Lente:** 14mm ultra-wide.\n**Perspectiva:** Distorção em ângulo baixo.\n**Abertura:** f/11 para foco profundo.',

    // DEMOS - GRAM
    'gram_demo_r1': '### 🎨 GRAM DNA Fantasia\n**Lei:** Carvão pesado, nanquim expressivo.\n**Cores:** #2F1B41 vs #F9F7F0.\n**Regra:** Linhas limpas proibidas.',
    'gram_demo_r2': '### 🎨 GRAM DNA Pixel\n**Lei:** Profundidade de cor 16-bit.\n**Dithering:** Alta densidade.\n**Regra:** Escalonamento 32x32.',
    'gram_demo_r3': '### 🎨 GRAM Extração de Fonte\n**Lei:** Estética dreamcore pastel.\n**Glow:** 40% bloom.\n**Regra:** Bordas de foco suave.',

    // DEMOS - LOKI
    'loki_demo_r1': '### 🌀 LOKI Burger Vegano\n**Hook:** "Gosto de futuro, não de vaca."\n**Caos:** Render 3D de burger explodindo.',
    'loki_demo_r2': '### 🌀 LOKI Gancho Café\n**Hook:** "Para quem corre mais que a simulação."\n**Caos:** Líquido slow-mo em glitch-art.',
    'loki_demo_r3': '### 🌀 LOKI Lançamento Tech\n**Hook:** "A única ferramenta que você não ignora."\n**Caos:** Contagem regressiva guerrilha.',

    // DEMOS - IRIS
    'iris_demo_r1': '### 👁️ IRIS Metáfora de Memória\n**Img:** Oceano de olhos de cristal.\n**Alma:** Azuis profundos vs branco cegante.',
    'iris_demo_r2': '### 👁️ IRIS Conceito de Solidão\n**Img:** Único pixel no deserto cinza.\n**Alma:** Tons frios vs geometria afiada.',
    'iris_demo_r3': '### 👁️ IRIS Metáfora de Velocidade\n**Img:** Luz sólida dobrando em curvas.\n**Alma:** Energia cinética congelada.',

    // DEMOS - VYNE
    'vyne_demo_r1': '### 🎵 VYNE Layout Assombrado\n**Instrumentos:** Órgão, reverb distante.\n**BPM:** Fluxo de ansiedade variável.',
    'vyne_demo_r2': '### 🎵 VYNE Som Subaquático\n**Instrumentos:** Sub-bass, pings de sonar.\n**Atmosfera:** Silêncio abafado eterno.',
    'vyne_demo_r3': '### 🎵 VYNE Épico Espacial\n**Instrumentos:** Synths modulares, metais.\n**Atmosfera:** Vácuo majestoso.',

    // Common keys
    'node_description': 'Diretor de Narrativa Cinematográfica',
    'zora_description': 'Engenheira Visual Fotorrealista',
    'wizi_description': 'Construtor de Mundos Criativos',
    'luma_description': 'Desconstrutora Técnica de Cenas',
    'gram_description': 'Guardião do Estilo Estético',
    'loki_description': 'Curinga de Estratégia Criativa',
    'zora_json_description': 'Blueprint Visual de Dados JSON',
    'vyne_description': 'Guia de Composição Musical',
    'iris_description': 'Artista de Conceito Visual',
    'message_placeholder': 'Mensagem para {assistantName}...',
    'chats': 'Conversas',
    'new_chat': 'Novo Chat',
    'personalized_greeting': '{greeting}, {username}!',
    'greeting_morning': 'Bom dia',
    'greeting_afternoon': 'Boa tarde',
    'greeting_evening': 'Boa noite',
    'copy_button_text': 'Copiar',
    'copied_confirmation_text': 'Copiado!',
    'unlock_assistant_title': 'Desbloquear {assistantName}',
    'unlock_assistant_description': 'Ganhe acesso a esta ferramenta profissional.',
    'buy_now_button': 'Desbloquear por {price}',
    'redirect_notice': 'Redirecionando para o checkout...',
    'notifications_title': 'Notificações',
    'notifications_empty': 'Nada por aqui.',
    'clear_notifications': 'Limpar tudo',
    'notifications_close': 'Fechar',
    'notification_badge_unlocked': 'Badge: {badgeName}',
    'search_chats_placeholder': 'Procurar...',
    'no_chats_yet': 'Sem histórico com {assistantName}',
    'delete_chat_confirm': 'Excluir isto?',
    'delete_chat_label': 'Excluir',
    'edit_chat_title': 'Renomear',
    'select_language': 'Idioma',
    'switch_to_language': 'Mudar para {languageName}',
    'switch_to_dark_mode': 'Escuro',
    'switch_to_light_mode': 'Claro',
    'expand_history': 'Mostrar Histórico',
    'collapse_history': 'Esconder Histórico',
    'drop_files_here': 'Solte os arquivos',
    'send_error': 'Erro. Tente novamente.'
  },
  es: { 'already_unlocked': 'Desbloqueado', 'get_access': 'Acceso Total', 'chats': 'Chats', 'new_chat': 'Nuevo Chat' },
  zh: { 'already_unlocked': '已解锁', 'get_access': '获取访问', 'chats': '聊天', 'new_chat': '新聊天' },
  fr: { 'already_unlocked': 'Déverrouillé', 'get_access': 'Accès Total', 'chats': 'Chats', 'new_chat': 'Nouveau Chat' }
};
