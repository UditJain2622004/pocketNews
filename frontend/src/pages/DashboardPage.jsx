import React, { useState } from 'react'
import Dashboard from '../components/Dashboard'
import PublishedEpisodes from '../components/PublishedEpisodes'

export default function DashboardPage({ setShowLanding, user, onLogout, token, onProfileUpdate }) {
  // Cinematic news stories list
  const storiesList = [
    {
      id: 'silicon-wars',
      title: 'The Silicon Shield: Battle for the 1nm Chip',
      topic: 'Global Chip Monopoly',
      season: 'Season 1: Global Tech Cold War',
      narrative: {
        hook: "Imagine a machine so complex it requires three Boeing 747s to ship, costing $350 million. This isn't a spaceship. It's the only machine on Earth that can print the brain of tomorrow's AI.",
        context: "At the heart of the global technology race lies ASML, a Dutch company making Extreme Ultraviolet (EUV) lithography systems. Without them, Nvidia chips can't exist, and AI progress grinds to a halt.",
        conflict: "Now, a quiet geopolitical chess match is unfolding. The US has pressured the Dutch government to restrict EUV exports to competitors, triggering an aggressive race by other global giants to reverse-engineer light itself.",
        climax: "A mysterious startup claims to have bypassed EUV entirely using a new Nanoimprint technology. If true, the Dutch monopoly is shattered overnight, and the balance of technological power instantly shifts.",
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
      ],
      tag: 'Tech Thriller',
      plays: '178.4M',
      rating: '4.9',
      episodes: '4 Episodes',
      category: 'Geopolitics',
      badge: 'Trending #1',
      summary: 'A geopolitical tech thriller. One Dutch machine holds the key to the future of AI. Bypassing lithography is no longer just manufacturing; it is a global cold war.',
      color: 'from-[#4F46E5] to-[#7C3AED]'
    },
    {
      id: 'lithium-rush',
      title: 'The Lithium Gold Rush: Geopolitical Battle for White Gold',
      topic: 'Resource Geopolitics',
      season: 'Season 1: Global Tech Cold War',
      narrative: {
        hook: "Hidden deep under the salt flats of South America lies the fuel of the next century: white gold. It is not metal, it is Lithium.",
        context: "As the world transitions to electric vehicles, control over battery chemistry has become the new oil war of our generation.",
        conflict: "Global mining conglomerates are racing to secure rights, but local communities and environmentalists are blocking drilling rigs, claiming the extraction is drying up precious fresh water reserves.",
        climax: "A breakthrough sodium-ion battery is announced by a startup, threatening to make lithium obsolete overnight and crash the South American lithium economy.",
        takeaway: "The transition to clean energy does not remove geopolitical friction; it simply shifts the battleground to new resources."
      },
      perspectives: {
        investor: {
          title: "The Fund Manager",
          text: "Sodium-ion is a threat, but lithium moats are solid for the next 5 years. We are hedging by investing in battery recycling."
        },
        policymaker: {
          title: "The Energy Secretary",
          text: "Establishing domestic battery assembly lines is vital. We cannot rely entirely on South American extraction or foreign refining."
        },
        citizen: {
          title: "The EV Driver",
          text: "I want an eco-friendly car, but not if it means ruining drinking water for indigenous people in South America."
        },
        scientist: {
          title: "The Material Chemist",
          text: "Sodium is abundant and cheap, but its energy density is lower. The immediate future is hybrid batteries using both elements."
        }
      },
      whatNext: {
        question: "Will sodium-ion batteries replace lithium in consumer cars by 2028?",
        options: [
          { id: 'optA', text: "Yes, sodium batteries take over 60% of the EV market" },
          { id: 'optB', text: "No, lithium remains king for long-range travel" },
          { id: 'optC', text: "A new solid-state battery tech bypasses both" }
        ]
      },
      videoFrames: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800"
      ],
      tag: 'Resource War',
      plays: '92.1M',
      rating: '4.7',
      episodes: '5 Episodes',
      category: 'Geopolitics',
      badge: 'Popular',
      summary: 'As the world transitions to electric vehicles, control over battery chemistry has become the new oil war of our generation.',
      color: 'from-[#EC4899] to-[#D946EF]'
    },
    {
      id: 'space-race',
      title: "Artemis vs. Chang'e: Space Race 2.0",
      topic: 'Lunar Colonization',
      season: 'Season 2: Space Conquest',
      narrative: {
        hook: "The moon is no longer a symbolic flag-raising target. It is the ultimate military and industrial high ground.",
        context: "Water ice in the lunar South Pole can be split into hydrogen and oxygen—literally rocket fuel. The nation that controls the pole controls the gateway to Mars.",
        conflict: "US Artemis agreements clash with independent lunar plans of eastern coalitions. Both sides are selecting coordinates for overlapping landing zones.",
        climax: "A localized communication blackout leaves two competing lunar rovers stranded feet away from each other in a dark crater, forcing astronauts to cooperate or spark an interplanetary incident.",
        takeaway: "Space treaty loopholes mean the first country to set up physical infrastructure on the moon gets to claim de facto ownership."
      },
      perspectives: {
        investor: {
          title: "The Space VC",
          text: "Asteroid mining and lunar tourism are high risk, but launching satellites and manufacturing in zero gravity are multi-billion dollar markets today."
        },
        policymaker: {
          title: "The Space Force Commander",
          text: "Lunar orbits must be monitored. If another power sets up jamming arrays, they could control GPS and sat-coms globally."
        },
        citizen: {
          title: "The Earth Dweller",
          text: "We have climate change and poverty here. Why are we spending billions racing to mine space ice?"
        },
        scientist: {
          title: "The Astrophysicist",
          text: "The lunar South Pole contains ice that has been shielded from solar radiation for billions of years. Mining it will destroy precious solar system records."
        }
      },
      whatNext: {
        question: "Which nation will establish the first permanent crewed base at the lunar South Pole?",
        options: [
          { id: 'optA', text: "The US-led Artemis Coalition by 2029" },
          { id: 'optB', text: "The China-Russia Joint Station by 2028" },
          { id: 'optC', text: "A private commercial space station" }
        ]
      },
      videoFrames: [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=800"
      ],
      tag: 'Space Conquest',
      plays: '114.5M',
      rating: '4.8',
      episodes: '6 Episodes',
      category: 'Science',
      badge: 'Hot Show',
      summary: 'The moon is no longer a symbolic flag-raising target. It is the ultimate military and industrial high ground.',
      color: 'from-[#10B981] to-[#059669]'
    }
  ]

  const [activeStoryId, setActiveStoryId] = useState('silicon-wars')

  return (
    <><PublishedEpisodes token={token} /><Dashboard
      setShowLanding={setShowLanding}
      user={user}
      onLogout={onLogout}
      token={token}
      onProfileUpdate={onProfileUpdate}
      storiesList={storiesList}
      setActiveStoryId={setActiveStoryId}
    /></>
  )
}
