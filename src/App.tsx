import React, { useState, useRef } from 'react';
import { Trophy, TrendingUp, Users, Wallet } from 'lucide-react';
import { VoteResults } from './VoteResults';
import { useProgressCalculation } from './hooks/useProgressCalculation';
import { useVotingSimulation } from './hooks/useVotingSimulation';

export type VenueOption = {
  id: number;
  name: string;
  votes: number;
  image: string;
};

function App() {
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const { percentage: progressPercentage, coins: progressCoins } = useProgressCalculation();
  const simulatedVotes = useVotingSimulation();
  const votingSectionRef = useRef<HTMLDivElement>(null);

  const scrollToVoting = () => {
    votingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePressClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const pressUrl = 'https://www.strkcrypto.com/';
    window.open(pressUrl, '_blank');
    const script = `
      setTimeout(() => {
        const pressSection = document.getElementById('press');
        if (pressSection) {
          pressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1500);
    `;
    const tempLink = document.createElement('a');
    tempLink.href = `javascript:(function(){${script}})()`;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  const venues: VenueOption[] = [
    {
      id: 1,
      name: "Touchdown Teaser Tailgate",
      votes: simulatedVotes[1],
      image: "https://cdn.discordapp.com/attachments/1194562267413483532/1333800367862841427/Superbowl_2025.png?ex=679a35e4&is=6798e464&hm=45678b6a7481c60a99075d00cd2ebbd2b8d0774dc9219d7f18f2bbd81557508c&"
    },
    {
      id: 2,
      name: "Bikini Cup Goalzone Party",
      votes: simulatedVotes[2],
      image: "https://cdn.discordapp.com/attachments/1194562267413483532/1333800304382181376/Bikini_Cup_2025.png?ex=679a35d5&is=6798e455&hm=4a6a90a61482cde7aa3be4f9d32aaccda17b0c107d9506b24267372a6a2e2644&"
    },
    {
      id: 3,
      name: "Championship Courtside Smackdown",
      votes: simulatedVotes[3],
      image: "https://cdn.discordapp.com/attachments/1194562267413483532/1333523103866945546/NBA.jpg?ex=679933ab&is=6797e22b&hm=911eb77374faf16bfc8d0426842b5e8112f20f03e0cbc6306f8205d33395fa04&"
    }
  ];

  const handleVoteSelect = (venueId: number) => {
    if (!hasVoted) {
      setSelectedVenue(venueId);
    }
  };

  const handleCastVote = () => {
    if (selectedVenue && !hasVoted) {
      // Update the local storage to increment the vote
      const currentVotes = JSON.parse(localStorage.getItem('streak-vote-state') || '{}');
      currentVotes[selectedVenue] = (currentVotes[selectedVenue] || 0) + 1;
      currentVotes.lastUpdate = Date.now();
      localStorage.setItem('streak-vote-state', JSON.stringify(currentVotes));
      
      setHasVoted(true);
      setShowResults(true);
    }
  };

  if (showResults) {
    const updatedVenues = venues.map(venue => ({
      ...venue,
      votes: venue.id === selectedVenue ? venue.votes + 1 : venue.votes
    }));
    return <VoteResults venues={updatedVenues} selectedVenue={selectedVenue} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow-3d">
            NEXT $TREAK MISSION
          </h1>
          <p className="text-2xl mb-8 granulate-text font-bold">
            Help Decide the Next Legendary Event!
          </p>
          
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex justify-between mb-2">
              <span className="flowing-pink-text font-semibold">Progress to next $TREAK Event</span>
              <span className="flowing-pink-text font-semibold">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-4 border border-gray-800">
              <div 
                className="bg-gradient-to-r from-[#FF69B4] via-[#FF1493] to-[#FF69B4] rounded-full h-3 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-4">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#FF69B4]/10 via-[#FF1493]/20 to-[#FF69B4]/10 p-4">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0">
                  <div className="flex items-center justify-center md:justify-start space-x-2 md:flex-1">
                    <span className="flowing-pink-text font-bold">{progressCoins.toLocaleString()}</span>
                    <span className="text-gray-300">$TREAK purchased</span>
                  </div>
                  <div className="hidden md:block border-r border-gray-700 h-8"></div>
                  <div className="flex items-center justify-center md:justify-end space-x-2 md:flex-1">
                    <span className="text-gray-300">Target:</span>
                    <span className="flowing-pink-text font-bold">150,000,000</span>
                    <span className="text-gray-300">$TREAK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div 
              onClick={scrollToVoting}
              className="glowing-border bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="glow-effect"></div>
              <Users className="w-8 h-8 mb-4 mx-auto text-[#FF1493]" />
              <h3 className="text-xl font-semibold mb-2 flowing-pink-text">Voting Power</h3>
              <p className="granulate-text">Shape Future $treaks</p>
            </div>
            <button 
              onClick={handlePressClick}
              className="glowing-border bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="glow-effect"></div>
              <Trophy className="w-8 h-8 mb-4 mx-auto text-[#FF1493]" />
              <h3 className="text-xl font-semibold mb-2 flowing-pink-text">Previous $TREAKS</h3>
              <p className="granulate-text">2 Legendary Events</p>
            </button>
            <a 
              href="https://dexscreener.com/solana/EjarweaCTzxT1pXB2jCXmjLcgDc4q2KPwYoCGEQRpump?__cf_chl_tk=FJ0blYq4uJLGW0mxd8oz.rVUD7nXppapEhP7zQvTXdw-1734044643-1.0.1.1-s80mUUWGfKTeWBvkVyxLDaB30TLABoRB8VEa7bp9zlc"
              target="_blank"
              rel="noopener noreferrer"
              className="glowing-border bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="glow-effect"></div>
              <TrendingUp className="w-8 h-8 mb-4 mx-auto text-[#FF1493]" />
              <h3 className="text-xl font-semibold mb-2 flowing-pink-text">Price Impact</h3>
              <p className="granulate-text">Proceeds to LP Pool</p>
            </a>
          </div>
        </div>

        <div ref={votingSectionRef} className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-glow-3d">
            Vote for Next Venue
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {venues.map((venue) => (
              <div key={venue.id} className="venue-card-wrapper">
                <div 
                  className={`venue-card glowing-border bg-gray-900/50 rounded-xl backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
                    selectedVenue === venue.id ? 'selected-venue' : ''
                  }`}
                  onClick={() => handleVoteSelect(venue.id)}
                >
                  <div className="glow-effect"></div>
                  <div className="venue-content">
                    <div className="image-container">
                      <img 
                        src={venue.image} 
                        alt={venue.name}
                      />
                    </div>
                    <div className="p-6 flex-grow flex items-center justify-center">
                      <h3 className="text-xl font-bold flowing-pink-text text-center">{venue.name}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleCastVote}
              disabled={!selectedVenue || hasVoted}
              className={`px-12 py-4 rounded-lg font-bold text-xl transition-all ${
                selectedVenue && !hasVoted
                  ? 'bg-gradient-to-r from-[#FF69B4] via-[#FF1493] to-[#FF69B4] text-white hover:opacity-90 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Cast Your Vote
            </button>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-6 text-glow-3d">
            Ready to Join the Movement?
          </h2>
          <p className="text-xl font-bold granulate-text mb-8 max-w-3xl mx-auto">
            <span className="flowing-pink-text">Investors</span> will unlock{' '}
            <span className="flowing-pink-text">HIDDEN REWARD PERKS</span>{' '}
            for the next phase of{' '}
            <span className="flowing-pink-text">$TREAK</span>!
          </p>
          <a
            href="https://www.strkcrypto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF69B4] via-[#FF1493] to-[#FF69B4] px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
          >
            <Wallet className="w-6 h-6" />
            Buy $TREAK Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;