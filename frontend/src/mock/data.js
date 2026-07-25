export const storytellers = [
  { id: 'sherlock', name: 'Sherlock AI', avatar: '🕵️‍♂️', role: 'Detective', preview: 'Follow the digital clues, kid. The silicon trail doesn\'t lie...' },
  { id: 'professor', name: 'Prof. Higgins', avatar: '🎓', role: 'Historian', preview: 'Historically speaking, this mimics the coal monopolies of 1880...' },
  { id: 'cyberpunk', name: 'Neo-V', avatar: '🤖', role: 'Cyberpunk AI', preview: 'System check: 1nm chip secured. Grid connection... online.' },
  { id: 'comedian', name: 'Sammy Sarcasm', avatar: '🎤', role: 'Comedian', preview: 'So ASML built a printer for $350 million. My office printer won\'t even scan!' },
  { id: 'sports', name: 'Coach Jax', avatar: '📣', role: 'Sports Commentator', preview: 'They\'re going deep into the semiconductor field, ladies and gentlemen!' },
  { id: 'journalist', name: 'Clara Kent', avatar: '✍️', role: 'Journalist', preview: 'Reporting live from the silicon trenches. Here is what they aren\'t saying...' },
  { id: 'anime', name: 'Kira-Chan', avatar: '✨', role: 'Anime Girl', preview: 'Nani?! A new microchip that controls light?! Kawaii!' },
  { id: 'captain', name: 'Captain Leo', avatar: '🚀', role: 'Space Captain', preview: 'Set course for the 1nm target. Warp speed in three, two, one...' }
]

export const storyGenres = [
  { id: 'adventure', name: 'Adventure', icon: '⚔️', excerpt: "The journey was fraught with geopolitical blockades. ASML engineers worked through the night, guarding the precious blueprints like an ancient treasure." },
  { id: 'comedy', name: 'Comedy', icon: '🤡', excerpt: "So, the US asked the Netherlands nicely, 'Hey, can you block those shipments?' And the Dutch said, 'Sure, as long as we can keep our tulip trade safe!'" },
  { id: 'trailer', name: 'Movie Trailer', icon: '🍿', excerpt: "In a world ruled by silicon... one machine holds the key to the future. This summer, the light will bend. ASML: The 1nm Incident." },
  { id: 'detective', name: 'Detective', icon: '🕵️‍♂️', excerpt: "A mysterious client, a Carl Zeiss lens, and $350 million in unmarked bills. Vance lit a cigarette, staring at the circuit boards. Something was missing." },
  { id: 'podcast', name: 'Podcast', icon: '🎙️', excerpt: "Welcome back to TechTalk. Today, we're dissecting the quiet monopoly of EUV machines. Joining us is a Silicon Valley insider..." },
  { id: 'documentary', name: 'Documentary', icon: '📹', excerpt: "For decades, the silent village of Veldhoven remained unnoticed. Today, it stands as the technological center of the global semiconductor war." }
]

export const episodes = [
  { num: 1, title: 'The Dutch Monopoly', date: 'June 10', active: true },
  { num: 2, title: 'TSMC\'s Fortress', date: 'June 18', active: true },
  { num: 3, title: 'The 1nm Breakthrough', date: 'July 05', active: true },
  { num: 4, title: 'Supercomputing War', date: 'Today', active: true, isToday: true },
  { num: 5, title: 'AI Sovereign Net', date: 'Upcoming', active: false, isFuture: true }
]

export const graphNodes = [
  { id: 'asml', name: 'ASML', x: 150, y: 100, color: '#7C3AED' },
  { id: 'tsmc', name: 'TSMC', x: 380, y: 80, color: '#2563EB' },
  { id: 'nvidia', name: 'Nvidia', x: 260, y: 220, color: '#EC4899' },
  { id: 'usgov', name: 'US Gov', x: 100, y: 280, color: '#F97316' },
  { id: 'aireg', name: 'AI Regs', x: 420, y: 260, color: '#10B981' },
  { id: 'chips', name: '1nm Target', x: 550, y: 170, color: '#D97706' }
]

export const graphConnections = [
  { from: 'asml', to: 'tsmc' },
  { from: 'asml', to: 'nvidia' },
  { from: 'tsmc', to: 'chips' },
  { from: 'nvidia', to: 'chips' },
  { from: 'usgov', to: 'asml' },
  { from: 'usgov', to: 'aireg' },
  { from: 'aireg', to: 'chips' }
]

export const stories = [
  {
    id: 'silicon-wars',
    title: 'The Silicon Shield: Battle for the 1nm Chip',
    topic: 'Global Chip Monopoly',
    season: 'Season 1: Global Tech Cold War',
    narrative: {
      hook: "Imagine a machine so complex it requires three Boeing 747s to ship, costing $350 million. This isn't a spaceship. It's the only machine on Earth that can print the brain of tomorrow's AI.",
      context: "At the heart of the global technology race lies ASML, a Dutch company making Extreme Ultraviolet (EUV) lithography systems. Without them, Nvidia chips can't exist, and AI progress grinds to a halt.",
      conflict: "Now, a quiet geopolitical chess match is unfolding. The US has pressured the Dutch government to restrict EUV exports to competitors, triggering an aggressive race by other global giants to reverse-engineer light itself.",
      climax: "A mysterious startup claims to have bypassed EUV entirely using a new Nanoimprint technology. If true, the Dutch monopoly shattered overnight, and the balance of technological power instantly shifts.",
      takeaway: "The ultimate weapon in modern geopolitics is no longer oil or nuclear warheads; it is control over the precision of light waves measured in nanometers."
    },
    perspectives: {
      investor: {
        title: "The Venture Capitalist",
        text: "ASML's stock volatility presents a once-in-a-generation buying opportunity. We are immediately allocating capital to alternative lithography startups. The moat is cracking, and the premium on TSMC alternatives is skyrocketing."
      },
      policymaker: {
        title: "The National Security Advisor",
        text: "Chip supply chains are national security. If our adversaries gain independent 1nm capability, our cyber defense advantages dissolve. Export bans must be expanded to include software tooling immediately."
      },
      citizen: {
        title: "The Everyday Consumer",
        text: "This means the phone in your pocket might double in price next year, or become ten times smarter. We are caught in a crossfire of corporations, but our daily tools are the ones holding the bill."
      },
      scientist: {
        title: "The Quantum Physicist",
        text: "At 1nm, we are fighting quantum tunneling—electrons literally jumping through barriers they shouldn't cross. Bypassing lithography isn't just a manufacturing feat; it's redefining atomic manipulation."
      }
    },
    whatNext: {
      question: "What happens if Nanoimprint technology replaces EUV next month?",
      options: [
        { id: 'optA', text: "TSMC and ASML stock plunges 40%" },
        { id: 'optB', text: "Governments declare Nanoimprint secret military tech" },
        { id: 'optC', text: "Open-source hardware hackers print 1nm chips at home" }
      ]
    },
    videoFrames: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
    ]
  }
]
