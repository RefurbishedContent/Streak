import React, { useEffect, useState } from 'react';
import { Wallet, ArrowRight, Calendar } from 'lucide-react';
import type { VenueOption } from './App';
import { useVotingSimulation } from './hooks/useVotingSimulation';

interface VoteResultsProps {
  venues: VenueOption[];
  selectedVenue: number | null;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 flex-1">
    <div className="text-xl sm:text-2xl font-bold flowing-pink-text">
      {value.toString().padStart(2, '0')}
    </div>
    <div className="text-xs sm:text-sm text-gray-400">{label}</div>
  </div>
);

const VoteResults: React.FC<VoteResultsProps> = ({ venues: initialVenues, selectedVenue }) => {
  const timeLeft = useCountdown('2025-02-07T23:59:59');
  const liveVotes = useVotingSimulation();
  const [venues, setVenues] = useState(initialVenues);
  const [recentIncrements, setRecentIncrements] = useState<{[key: number]: number}>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (!liveVotes) return;

    setVenues(currentVenues => {
      return currentVenues.map(venue => {
        const newVoteCount = liveVotes[venue.id] || venue.votes;
        const oldVoteCount = venue.votes;
        
        if (newVoteCount > oldVoteCount) {
          setRecentIncrements(prev => ({
            ...prev,
            [venue.id]: newVoteCount - oldVoteCount
          }));
          
          setTimeout(() => {
            setRecentIncrements(prev => {
              const newIncrements = { ...prev };
              delete newIncrements[venue.id];
              return newIncrements;
            });
          }, 1000);
        }
        
        return {
          ...venue,
          votes: newVoteCount
        };
      });
    });
  }, [liveVotes]);

  const totalVotes = venues.reduce((sum, venue) => sum + venue.votes, 0);
  const maxVotes = Math.max(...venues.map(venue => venue.votes));

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 text-glow-3d">
            Live Vote Results
          </h1>
          <p className="text-xl sm:text-2xl mb-6 sm:mb-8 granulate-text font-bold">
            THANK YOU for Shaping the Future of $TREAK!
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-900/50 rounded-2xl p-4 sm:p-8 backdrop-blur-sm mb-8 sm:mb-16 glowing-border">
          <div className="glow-effect"></div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center flowing-pink-text">Current Standing</h2>
          
          <div className="space-y-4 sm:space-y-6">
            {venues.map((venue) => {
              const percentage = ((venue.votes / totalVotes) * 100).toFixed(1);
              const isSelected = venue.id === selectedVenue;
              const isLeader = venue.votes === maxVotes;
              const increment = recentIncrements[venue.id];
              
              return (
                <div key={venue.id} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold text-sm sm:text-base ${isSelected ? 'flowing-pink-text' : ''}`}>
                      {venue.name} {isSelected && '(Your Vote)'}
                    </span>
                    <div className="relative">
                      <span className={isLeader ? 'text-emerald-400' : 'flowing-pink-text'}>
                        {percentage}%
                      </span>
                      {increment && (
                        <span className="vote-increment">+{increment}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 sm:h-4">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isLeader 
                          ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400'
                          : isSelected 
                            ? 'bg-gradient-to-r from-[#FF69B4] via-[#FF1493] to-[#FF69B4]'
                            : 'bg-gray-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-400">
                    {venue.votes.toLocaleString()} votes
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#FF69B4]/10 via-[#FF1493]/20 to-[#FF69B4]/10 p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              <p className="text-center text-sm sm:text-lg font-bold">
                <span className="flowing-pink-text">All RAISED PROCEEDS</span>
                {' '}from{' '}
                <span className="flowing-pink-text">THE EVENT</span>
                {' '}will go{' '}
                <span className="flowing-pink-text">DIRECTLY INTO LP POOL</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
          <div className="glowing-border bg-gray-900/50 rounded-xl p-4 sm:p-8 backdrop-blur-sm">
            <div className="glow-effect"></div>
            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[#FF1493]" />
            <h3 className="text-xl sm:text-2xl font-bold mb-4 flowing-pink-text">Time is Running Out!</h3>
            <div className="flex gap-2 sm:gap-4 max-w-lg mx-auto mb-4">
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Min" />
              <TimeUnit value={timeLeft.seconds} label="Sec" />
            </div>
            <p className="text-sm sm:text-base text-gray-400">This legendary event is in your hands!</p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-glow-3d">
              Make Your Vote Count!
            </h2>
            <p className="text-lg sm:text-xl granulate-text max-w-2xl mx-auto">
              Buy $TREAK, Secure Your Rewards, and Make Real Events Happen!
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <a
                href="https://www.strkcrypto.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF69B4] via-[#FF1493] to-[#FF69B4] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:opacity-90 transition-all transform hover:scale-105"
              >
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                Buy STRK Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <p className="text-xs sm:text-sm text-gray-400">
                we are only just beginning...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { VoteResults };