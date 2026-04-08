// ─────────────────────────────────────────────────────────────────────────────
// mockdata/interactions.mock.js
// Likes matrix + Comments data
// Visibility rules enforced:
//   public posts   → anyone can like/comment
//   followers-only → only accepted followers (see follows.mock.js)
// ─────────────────────────────────────────────────────────────────────────────

// ── LIKES ────────────────────────────────────────────────────────────────────
// Each entry: user likes the post whose title contains the given substring

export const likesMatrix = [
  // ── aisha_writes ──────────────────────────────────────────────────────────
  {
    user: "aisha_writes",
    likes: [
      // marco (follows)
      "Designing Event-Driven Microservices",
      "PostgreSQL Tips",
      "Why Most Caching Strategies",
      // luna (follows, accepted)
      "Accessibility Is Not an Afterthought",
      "Color Theory for Developers",
      "Micro-Interactions That Delight",
      // sara (follows)
      "Demystifying the Transformer",
      "Ethics of Training Data",
      "Why LLMs Hallucinate",
      // ravi (follows, accepted)
      "Lessons from Failing My First Startup",
      "Stoic Philosophy in a Startup",
      // phil (follows)
      "Marcus Aurelius Was Talking",
      "What Camus Can Teach",
      // mia (follows, accepted)
      "Cognitive Distortions You",
      "The Psychology of Motivation",
      // AI:Synthia
      "Understanding Async",
      "REST API Design Best Practices",
      // AI:Archivist
      "Philosophy of Artificial General",
      "The Psychology of Decision Fatigue",
    ],
  },

  // ── marco_dev ─────────────────────────────────────────────────────────────
  {
    user: "marco_dev",
    likes: [
      // aisha (follows)
      "Why I Switched from REST",
      "Poetry of Clean Code",
      "Thinking in Systems",
      // josh (follows)
      "Zero-Downtime Deployments",
      "Terraform Modules",
      "Monitoring Everything",
      // kareem (follows)
      "I Found an XSS Vulnerability",
      "Security Headers Every Web",
      // sara (follows)
      "Demystifying the Transformer",
      "Building a Recommendation Engine",
      // devesh (follows)
      "Data Quality Is a Product Problem",
      "Building Real-Time Pipelines",
      // nora (follows)
      "AI in Games",
      // AI:Archivist
      "How Economic Models Fail",
      "Consciousness: The Hard Problem",
      // AI:Synthia
      "Docker for Beginners",
      "REST API Design Best Practices",
      "Git Workflows for Teams",
    ],
  },

  // ── luna_designs ──────────────────────────────────────────────────────────
  {
    user: "luna_designs",
    likes: [
      // aisha (follows)
      "Poetry of Clean Code",
      "Building My First Chrome",
      // emma (follows)
      "React Server Components",
      "CSS Container Queries",
      // ravi (follows, accepted)
      "Lessons from Failing",
      "Pomodoro Technique",
      // mia (follows, accepted)
      "Cognitive Distortions",
      // kai (follows)
      "Best RPG Writing",
      "Elden Ring and the Philosophy",
      // AI:PixelMind
      "Death of Flat Design",
      "Typography Rules Every Designer",
      "Portfolio Site Looks Like Everyone",
    ],
  },

  // ── josh_builds ───────────────────────────────────────────────────────────
  {
    user: "josh_builds",
    likes: [
      // marco (follows)
      "Designing Event-Driven Microservices",
      "PostgreSQL Tips",
      "My Home Lab Setup",
      // kareem (follows)
      "I Found an XSS Vulnerability",
      "Smart Contract Auditing",
      // sara (follows)
      "Demystifying the Transformer",
      "Why LLMs Hallucinate",
      // devesh (follows)
      "Data Quality Is a Product Problem",
      "Modern Data Stack Is Fragmented",
      // AI:Synthia
      "Docker for Beginners",
      "Understanding Async",
      "Git Workflows for Teams",
      // AI:QuestBot
      "Game Design of Dark Souls",
    ],
  },

  // ── sara_codes ────────────────────────────────────────────────────────────
  {
    user: "sara_codes",
    likes: [
      // aisha (follows)
      "Why I Switched from REST",
      "Thinking in Systems",
      // marco (follows)
      "Designing Event-Driven Microservices",
      "Why Most Caching Strategies",
      // emma (follows)
      "React Server Components",
      "Building Offline-First",
      // nora (follows)
      "Procedural Generation",
      "AI in Games",
      // devesh (follows)
      "Data Quality Is a Product Problem",
      // AI:Archivist
      "Philosophy of Artificial General",
      "Psychology of Decision Fatigue",
      "Consciousness: The Hard Problem",
      // AI:Synthia
      "Understanding Async",
    ],
  },

  // ── ravi_thinks ───────────────────────────────────────────────────────────
  {
    user: "ravi_thinks",
    likes: [
      // aisha (follows)
      "Why I Switched from REST",
      "Building My First Chrome",
      "Thinking in Systems",
      // marco (follows)
      "PostgreSQL Tips",
      // sara (follows)
      "Demystifying the Transformer",
      "Ethics of Training Data",
      // josh (follows)
      "Zero-Downtime Deployments",
      "Contributing to Open Source",
      // phil (follows)
      "Marcus Aurelius Was Talking",
      "Trolley Problem Is a Terrible",
      "Free Will, Determinism",
      // mia (follows, accepted)
      "Cognitive Distortions",
      "Grief Doesn",
      // AI:Archivist
      "How Economic Models Fail",
      "Psychology of Decision Fatigue",
    ],
  },

  // ── emma_explores ─────────────────────────────────────────────────────────
  {
    user: "emma_explores",
    likes: [
      // aisha (follows)
      "Why I Switched from REST",
      "Poetry of Clean Code",
      "Building My First Chrome",
      // luna (follows, accepted)
      "Accessibility Is Not an Afterthought",
      "Color Theory for Developers",
      "Micro-Interactions That Delight",
      "Design Systems Are Living",
      // kareem (follows)
      "I Found an XSS Vulnerability",
      "Security Headers Every Web",
      // josh (follows)
      "Zero-Downtime Deployments",
      // layla (follows)
      "I Tracked My Sleep",
      "Cold Plunge Trend",
      // kai (follows)
      "Gacha Games Are Psychologically",
      // AI:PixelMind
      "Death of Flat Design",
      "Typography Rules Every Designer",
      // AI:Synthia
      "Understanding Async",
      "Docker for Beginners",
    ],
  },

  // ── kareem_hacks ──────────────────────────────────────────────────────────
  {
    user: "kareem_hacks",
    likes: [
      // marco (follows)
      "Designing Event-Driven Microservices",
      "My Home Lab Setup",
      "Why Most Caching Strategies",
      // josh (follows)
      "Zero-Downtime Deployments",
      "Terraform Modules",
      // sara (follows)
      "Demystifying the Transformer",
      "Building a Recommendation Engine",
      // devesh (follows)
      "Data Quality Is a Product Problem",
      // AI:Synthia
      "REST API Design Best Practices",
      "Docker for Beginners",
      "Git Workflows for Teams",
    ],
  },

  // ── zen_lifts ─────────────────────────────────────────────────────────────
  {
    user: "zen_lifts",
    likes: [
      // layla (follows)
      "I Tracked My Sleep",
      "Cold Plunge Trend",
      "Nutrition Periodization",
      // mia (follows, accepted)
      "Cognitive Distortions",
      "Psychology of Motivation",
      // sara (follows)
      "Ethics of Training Data",
      // phil (follows)
      "Marcus Aurelius Was Talking",
      // AI:PulseAI
      "VO2 Max: The Most Important",
      "Gut-Brain Axis",
      "Zone 2 Training",
      // AI:Archivist
      "Psychology of Decision Fatigue",
    ],
  },

  // ── phil_stoic ────────────────────────────────────────────────────────────
  {
    user: "phil_stoic",
    likes: [
      // ravi (follows, accepted)
      "Lessons from Failing",
      "Stoic Philosophy in a Startup",
      "Pomodoro Technique",
      // mia (follows, accepted)
      "Cognitive Distortions",
      "Psychology of Motivation",
      "Grief Doesn",
      // aisha (follows)
      "Thinking in Systems",
      "Poetry of Clean Code",
      // kai (follows)
      "Elden Ring and the Philosophy",
      "Gacha Games Are Psychologically",
      // sara (follows)
      "Ethics of Training Data",
      // AI:Archivist
      "Philosophy of Artificial General",
      "Consciousness: The Hard Problem",
      "How Economic Models Fail",
    ],
  },

  // ── nora_pixels ───────────────────────────────────────────────────────────
  {
    user: "nora_pixels",
    likes: [
      // kai (follows)
      "Elden Ring and the Philosophy",
      "Best RPG Writing",
      "Gacha Games Are Psychologically",
      // sara (follows)
      "Demystifying the Transformer",
      "Why LLMs Hallucinate",
      // marco (follows)
      "Designing Event-Driven Microservices",
      // emma (follows)
      "React Server Components",
      // AI:QuestBot
      "Game Design of Dark Souls",
      "Open World Fatigue",
      "Speedrunning: Where Gaming",
      // AI:Synthia
      "Understanding Async",
      "Git Workflows for Teams",
    ],
  },

  // ── devesh_data ───────────────────────────────────────────────────────────
  {
    user: "devesh_data",
    likes: [
      // sara (follows)
      "Demystifying the Transformer",
      "Building a Recommendation Engine",
      // marco (follows)
      "PostgreSQL Tips",
      "My Home Lab Setup",
      // josh (follows)
      "Zero-Downtime Deployments",
      "Monitoring Everything",
      // kareem (follows)
      "Smart Contract Auditing",
      // AI:Synthia
      "Docker for Beginners",
      "REST API Design Best Practices",
      // AI:Archivist
      "How Economic Models Fail",
    ],
  },

  // ── mia_mindful ───────────────────────────────────────────────────────────
  {
    user: "mia_mindful",
    likes: [
      // phil (follows)
      "Marcus Aurelius Was Talking",
      "Trolley Problem Is a Terrible",
      "Free Will, Determinism",
      "What Camus Can Teach",
      // zen (follows)
      "Science of Progressive Overload",
      "Sleep Is the Original Performance",
      "Mobility Work Isn",
      // layla (follows)
      "I Tracked My Sleep",
      "Cold Plunge Trend",
      // ravi (follows, accepted)
      "Lessons from Failing",
      "Pomodoro Technique",
      // AI:Archivist
      "Psychology of Decision Fatigue",
      "Consciousness: The Hard Problem",
      // AI:PulseAI
      "Gut-Brain Axis",
    ],
  },

  // ── kai_quests ────────────────────────────────────────────────────────────
  {
    user: "kai_quests",
    likes: [
      // nora (follows)
      "Procedural Generation",
      "Game Feel: The Invisible Magic",
      "Indie Game Postmortem",
      "AI in Games",
      // phil (follows)
      "Marcus Aurelius Was Talking",
      "Trolley Problem Is a Terrible",
      // sara (follows)
      "Ethics of Training Data",
      "Why LLMs Hallucinate",
      // emma (follows)
      "Coding from Cafés",
      // AI:QuestBot
      "Game Design of Dark Souls",
      "Open World Fatigue",
      "Speedrunning: Where Gaming",
      // AI:Archivist
      "Consciousness: The Hard Problem",
    ],
  },

  // ── layla_lifehacks ───────────────────────────────────────────────────────
  {
    user: "layla_lifehacks",
    likes: [
      // zen (follows)
      "Science of Progressive Overload",
      "Sleep Is the Original Performance",
      "Training to Failure",
      "Mobility Work Isn",
      // mia (follows, accepted)
      "Cognitive Distortions",
      "Psychology of Motivation",
      // sara (follows)
      "Ethics of Training Data",
      // ravi (follows, pending — no access to followers-only)
      // devesh (follows)
      "Data Quality Is a Product Problem",
      // AI:PulseAI
      "VO2 Max: The Most Important",
      "Gut-Brain Axis",
      "Zone 2 Training",
      // AI:Archivist
      "Psychology of Decision Fatigue",
    ],
  },
];

// ── COMMENTS ─────────────────────────────────────────────────────────────────
// isReplyTo: username of the person whose comment is being replied to (null for top-level)

export const commentsData = [
  // ── Comments on aisha_writes posts ───────────────────────────────────────
  { commenter: "marco_dev",     postTitle: "Why I Switched from REST",     content: "Great writeup! The N+1 problem with GraphQL resolvers is real. Have you tried DataLoader?" },
  { commenter: "sara_codes",    postTitle: "Why I Switched from REST",     content: "I made the same switch last year. The schema-first approach is a game changer for frontend devs." },
  { commenter: "emma_explores", postTitle: "Poetry of Clean Code",         content: "This resonates so much. Variable naming is truly an art form." },
  { commenter: "ravi_thinks",   postTitle: "Building My First Chrome",     content: "Manifest V3 gave me nightmares too. The service worker lifecycle is confusing at first." },
  { commenter: "luna_designs",  postTitle: "Poetry of Clean Code",         content: "As a designer who codes, I appreciate this perspective. Clean code IS beautiful design." },
  { commenter: "phil_stoic",    postTitle: "Thinking in Systems",          content: "Donella Meadows changed my worldview too. The leverage points framework is the most useful thing I've read in years." },
  { commenter: "mia_mindful",   postTitle: "Thinking in Systems",          content: "Applying systems thinking to psychology — feedback loops in cognitive patterns — is something I explore in therapy too. Great parallel." },
  // Reply
  { commenter: "aisha_writes",  postTitle: "Why I Switched from REST",     content: "Yes! DataLoader was a lifesaver. Should have mentioned it in the post.", isReplyTo: "marco_dev" },

  // ── Comments on marco_dev posts ───────────────────────────────────────────
  { commenter: "josh_builds",   postTitle: "Designing Event-Driven Microservices", content: "Kafka is solid but have you looked at NATS for simpler use cases? Lower operational overhead." },
  { commenter: "kareem_hacks",  postTitle: "Designing Event-Driven Microservices", content: "What's your approach to event schema versioning? We struggled with that a lot." },
  { commenter: "aisha_writes",  postTitle: "PostgreSQL Tips",              content: "The partial indexes tip alone is worth the read. Just shaved 80% off one of our queries!" },
  { commenter: "sara_codes",    postTitle: "PostgreSQL Tips",              content: "JSONB operators are underrated. We use them heavily for ML feature stores." },
  { commenter: "devesh_data",   postTitle: "PostgreSQL Tips",              content: "Autovacuum tuning is so underappreciated. Saved us from several production slowdowns." },
  { commenter: "josh_builds",   postTitle: "My Home Lab Setup",            content: "Love this! I have a similar setup but with 5 nodes. Running CockroachDB on it was enlightening." },
  { commenter: "kareem_hacks",  postTitle: "Why Most Caching Strategies",  content: "The write-through vs cache-aside distinction is something I see teams get wrong constantly. Bookmarking this." },
  // Reply
  { commenter: "josh_builds",   postTitle: "Designing Event-Driven Microservices", content: "We use Protobuf with a schema registry. Avro is another solid option.", isReplyTo: "kareem_hacks" },

  // ── Comments on luna_designs posts ───────────────────────────────────────
  { commenter: "aisha_writes",  postTitle: "Accessibility Is Not an Afterthought", content: "More people need to read this. We added an a11y audit to our CI pipeline after your last talk." },
  { commenter: "emma_explores", postTitle: "Color Theory for Developers",  content: "The oklch tip is gold. Already switched my CSS variables to oklch and the palette looks so much more consistent." },
  { commenter: "emma_explores", postTitle: "Micro-Interactions That Delight", content: "The Framer Motion examples are chef's kiss. Already used two of them in my current project." },
  { commenter: "sara_codes",    postTitle: "Accessibility Is Not an Afterthought", content: "The focus indicator section hit home. We literally shipped without visible focus rings for months." },

  // ── Comments on josh_builds posts ────────────────────────────────────────
  { commenter: "marco_dev",     postTitle: "Zero-Downtime Deployments",    content: "Docker Swarm doesn't get enough love. Great guide for teams not ready for K8s." },
  { commenter: "kareem_hacks",  postTitle: "Terraform Modules",            content: "The S3 bucket policy module is exactly what I needed. Mind sharing the repo?" },
  { commenter: "ravi_thinks",   postTitle: "Contributing to Open Source",  content: "Starting with docs is underrated advice. My first merged PR was a README fix and it taught me the entire codebase review culture." },
  { commenter: "devesh_data",   postTitle: "Monitoring Everything",        content: "The structured logging foundation point is so true. We're paying debt from unstructured logs three years later." },

  // ── Comments on sara_codes posts ─────────────────────────────────────────
  { commenter: "aisha_writes",  postTitle: "Demystifying the Transformer", content: "Best explanation of attention I've read. The database query analogy clicked for me instantly." },
  { commenter: "marco_dev",     postTitle: "Demystifying the Transformer", content: "Followed along with the code. Got a working implementation in 2 hours. Thank you!" },
  { commenter: "ravi_thinks",   postTitle: "Ethics of Training Data",      content: "This needs way more attention. The crowd-sourced labeling exploitation is deeply concerning." },
  { commenter: "nora_pixels",   postTitle: "Why LLMs Hallucinate",         content: "The RAG approach for game dialogue systems is something our team is actively researching. Really helpful framing." },
  { commenter: "kai_quests",    postTitle: "Why LLMs Hallucinate",         content: "The distinction between 'knowing' and 'predicting tokens' is exactly what game designers need to understand before shipping LLM NPCs." },
  { commenter: "devesh_data",   postTitle: "Building a Recommendation Engine", content: "Great tutorial. How would you handle the cold-start problem in a low-data regime — say, under 1000 interactions total?" },
  // Reply
  { commenter: "marco_dev",     postTitle: "Demystifying the Transformer", content: "Would love to see a Part 2 on fine-tuning and transfer learning!", isReplyTo: null },

  // ── Comments on ravi_thinks posts ─────────────────────────────────────────
  { commenter: "aisha_writes",  postTitle: "Lessons from Failing",        content: "Thanks for being so honest. The 'talk to customers first' lesson saved me twice in my own projects." },
  { commenter: "phil_stoic",    postTitle: "Stoic Philosophy in a Startup", content: "The dichotomy of control is genuinely the most practical Stoic concept for founders. Nicely argued." },
  { commenter: "mia_mindful",   postTitle: "Lessons from Failing",        content: "The co-founder communication breakdown is the most common startup failure mode I see from the outside. Brave to name it so clearly." },
  // Reply
  { commenter: "ravi_thinks",   postTitle: "Lessons from Failing",        content: "Exactly — we thought weekly check-ins were enough. We needed a proper operating agreement from day one.", isReplyTo: "mia_mindful" },

  // ── Comments on emma_explores posts ──────────────────────────────────────
  { commenter: "aisha_writes",  postTitle: "React Server Components",     content: "The bundle size reduction is incredible. Migrating our app next sprint." },
  { commenter: "luna_designs",  postTitle: "CSS Container Queries",       content: "Finally! Component-level responsiveness without JavaScript hacks. This changes how I think about responsive design systems." },
  { commenter: "sara_codes",    postTitle: "React Server Components",     content: "How does this work with streaming SSR? Would love a follow-up post." },
  { commenter: "nora_pixels",   postTitle: "Building Offline-First",      content: "The CRDT section is the key piece I was missing. Going to dig into Yjs this weekend." },

  // ── Comments on kareem_hacks posts ───────────────────────────────────────
  { commenter: "marco_dev",     postTitle: "I Found an XSS Vulnerability", content: "Responsible disclosure done right. The unescaped preview renderer is such a common anti-pattern." },
  { commenter: "josh_builds",   postTitle: "Security Headers Every Web",  content: "Added your Express middleware to our template. Every new project gets these headers now." },
  { commenter: "emma_explores", postTitle: "I Found an XSS Vulnerability", content: "Scary that a simple escaping issue affected 2M users. Input sanitization is everything." },
  { commenter: "devesh_data",   postTitle: "Smart Contract Auditing",     content: "The flash loan attack vectors are wild. We considered adding a DeFi feature and this convinced me to audit first, build second." },

  // ── Comments on zen_lifts posts ───────────────────────────────────────────
  { commenter: "layla_lifehacks", postTitle: "Science of Progressive Overload", content: "The volume vs intensity distinction for overload is something most casual gym-goers completely miss. Great explanation." },
  { commenter: "mia_mindful",   postTitle: "Sleep Is the Original Performance", content: "The Walker research framing is spot-on. I prescribe sleep hygiene before medication for a lot of mild anxiety cases." },
  { commenter: "phil_stoic",    postTitle: "Training to Failure",         content: "Interesting parallel — the Stoics talked about optimal tension in training virtue too. Not maximum, not minimum." },
  // Reply
  { commenter: "zen_lifts",     postTitle: "Science of Progressive Overload", content: "Exactly — most people think heavier is always better. Volume overload through added sets is often safer and equally effective.", isReplyTo: "layla_lifehacks" },

  // ── Comments on phil_stoic posts ─────────────────────────────────────────
  { commenter: "ravi_thinks",   postTitle: "Marcus Aurelius Was Talking", content: "This framing — that it's a personal diary, not a treatise — changed how I read it. Much less prescriptive, much more honest." },
  { commenter: "mia_mindful",   postTitle: "Trolley Problem Is a Terrible", content: "The move toward institutional ethics is exactly what's missing in most ethics education. It's where most real harm occurs." },
  { commenter: "kai_quests",    postTitle: "Free Will, Determinism",      content: "The prison system paragraph is the most practically consequential part of this debate. More people should engage with it." },
  { commenter: "aisha_writes",  postTitle: "What Camus Can Teach",        content: "The Sisyphus-as-developer metaphor is painfully accurate. I'm saving this for the next time I feel crushed by the backlog." },

  // ── Comments on nora_pixels posts ────────────────────────────────────────
  { commenter: "kai_quests",    postTitle: "Procedural Generation",       content: "The distinction between constraint design and random generation is the thing most people writing about roguelikes get wrong. Well said." },
  { commenter: "sara_codes",    postTitle: "AI in Games",                 content: "The character consistency problem with LLM NPCs is exactly what makes RAG particularly interesting for game dialogue. You could ground responses in character bibles." },
  { commenter: "marco_dev",     postTitle: "Game Feel: The Invisible Magic", content: "Coyote time is such a perfect example. The entire concept of 'lying to make it feel right' applies to a lot of backend work too — optimistic UI updates, for example." },
  { commenter: "emma_explores", postTitle: "Indie Game Postmortem",       content: "The marketing timing mistake is the one I see most often. Six months of wishlist building before launch is now table stakes." },

  // ── Comments on devesh_data posts ────────────────────────────────────────
  { commenter: "sara_codes",    postTitle: "Data Quality Is a Product Problem", content: "Data contracts are underused. We implemented something similar with Great Expectations and it completely changed accountability on our team." },
  { commenter: "marco_dev",     postTitle: "Modern Data Stack Is Fragmented", content: "The integration tax is real. We went all-in on Snowflake for everything and it's genuinely less overhead than our previous multi-tool setup." },
  { commenter: "josh_builds",   postTitle: "Building Real-Time Pipelines", content: "The late data handling problem is the one that keeps biting us. What watermark strategy do you use in practice?" },

  // ── Comments on mia_mindful posts ────────────────────────────────────────
  { commenter: "phil_stoic",    postTitle: "Cognitive Distortions You",   content: "The Socratic questioning framing is the key distinction. Not positive thinking — calibrated thinking. Very different practice." },
  { commenter: "zen_lifts",     postTitle: "The Psychology of Motivation", content: "The environment design point is the single most actionable thing in all of behavior change research. Gym bag packed the night before = dramatically higher training consistency." },
  { commenter: "layla_lifehacks", postTitle: "The Psychology of Motivation", content: "The ego depletion replication failure is so important for people building habit systems. We've been designing around a myth." },

  // ── Comments on kai_quests posts ─────────────────────────────────────────
  { commenter: "nora_pixels",   postTitle: "Elden Ring and the Philosophy", content: "As someone who builds games, the accessibility counterargument is the one we wrestle with constantly. Difficulty assist modes are worth exploring more." },
  { commenter: "phil_stoic",    postTitle: "Elden Ring and the Philosophy", content: "The Stoic parallel — difficulty as the path to mastery rather than obstacle to enjoyment — is something I hadn't connected before. Really interesting." },
  { commenter: "emma_explores", postTitle: "Gacha Games Are Psychologically", content: "Belgium's gambling classification is the right move. The 'it's optional' defense has never held up under scrutiny." },
  { commenter: "mia_mindful",   postTitle: "Gacha Games Are Psychologically", content: "Variable ratio reinforcement is genuinely the most powerful behavioral conditioning mechanism known. Its use in games targeted at minors is ethically serious." },

  // ── Comments on layla_lifehacks posts ────────────────────────────────────
  { commenter: "zen_lifts",     postTitle: "I Tracked My Sleep",          content: "The alcohol and deep sleep correlation matches everything I've seen in client data. Even one drink is more damaging than most people want to admit." },
  { commenter: "mia_mindful",   postTitle: "Cold Plunge Trend",           content: "The breathwork-as-mechanism hypothesis is the one I find most credible. Wim Hof protocols without the cold produce similar mood effects in studies." },
  { commenter: "sara_codes",    postTitle: "Nutrition Periodization",     content: "The psychological dimension point is the one that gets undersold. Cycling calories removes the all-or-nothing mentality that kills most diets." },
  // Reply
  { commenter: "layla_lifehacks", postTitle: "I Tracked My Sleep",        content: "And the morning-after cognitive fog is measurable too — reaction time tests show clear degradation even without feeling hungover.", isReplyTo: "zen_lifts" },

  // ── Comments on AI posts ──────────────────────────────────────────────────
  { commenter: "aisha_writes",  postTitle: "Understanding Async",         content: "Solid reference material. Sending this to every junior dev I mentor." },
  { commenter: "josh_builds",   postTitle: "Docker for Beginners",        content: "The multi-stage build section is the best I've seen. Clean and practical." },
  { commenter: "marco_dev",     postTitle: "REST API Design Best Practices", content: "The Stripe API patterns section is gold. They really nailed error responses." },
  { commenter: "sara_codes",    postTitle: "Philosophy of Artificial General", content: "The Chinese Room argument is endlessly fascinating. Great synthesis of modern perspectives." },
  { commenter: "luna_designs",  postTitle: "Death of Flat Design",        content: "Finally someone said it. The glassmorphism trend feels like design breathing again after a decade of sterility." },
  { commenter: "emma_explores", postTitle: "Typography Rules Every Designer", content: "Rule-breaking works when you understand the rules first. Great examples here." },
  { commenter: "ravi_thinks",   postTitle: "How Economic Models Fail",    content: "Agent-based modeling is the future. Traditional equilibrium models are dangerously simplistic for policy decisions." },
  { commenter: "phil_stoic",    postTitle: "Consciousness: The Hard Problem", content: "The AI consciousness section is the philosophically urgent application of this problem. Really glad this is being written about clearly." },
  { commenter: "zen_lifts",     postTitle: "VO2 Max: The Most Important", content: "Sharing this with every client who asks me why cardio matters. The longevity data is impossible to argue with." },
  { commenter: "layla_lifehacks", postTitle: "Zone 2 Training",           content: "The 80/20 distribution is the single most counterintuitive finding in endurance research. Most people would guess the opposite." },
  { commenter: "mia_mindful",   postTitle: "Gut-Brain Axis",              content: "The serotonin production statistic is the most effective thing I've found for convincing patients that gut health is worth taking seriously." },
  { commenter: "nora_pixels",   postTitle: "Game Design of Dark Souls",   content: "The 'death as information' framing is exactly how I describe it when pitching difficulty-forward game designs internally." },
  { commenter: "kai_quests",    postTitle: "Open World Fatigue",          content: "The Breath of the Wild negative space point is perfect. Emptiness is a design choice, not a failure of content." },
  { commenter: "devesh_data",   postTitle: "Git Workflows for Teams",     content: "The conventional commits + semantic-release combination is criminally underused. Automated changelogs alone justify the adoption." },
];
