import { useState, useEffect } from 'react';

const STORAGE_KEY = 'streak-vote-state';
const END_DATE = new Date('2025-02-07T23:59:59');
const MIN_TARGET_VOTES = 27000;
const MAX_TARGET_VOTES = 32000;
const UPDATE_INTERVAL = 15000; // 15 seconds
const MAX_VOTES_PER_MINUTE = 300;

// Spike configuration for each venue
const VENUE_CONFIGS = {
  1: { // Touchdown Teaser
    baseWeight: 0.45, // Higher base weight
    spikeChance: 0.35,
    spikeMultiplier: { min: 2, max: 4 }
  },
  2: { // Bikini Cup
    baseWeight: 0.25,
    spikeChance: 0.2,
    spikeMultiplier: { min: 1.5, max: 3 }
  },
  3: { // Championship Courtside
    baseWeight: 0.3,
    spikeChance: 0.25,
    spikeMultiplier: { min: 1.8, max: 3.5 }
  }
};

interface VoteState {
  [key: number]: number;
  lastUpdate?: number;
  targetVotes?: number;
}

function getStoredVoteState(): VoteState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedState = JSON.parse(stored);
      if (parsedState && typeof parsedState === 'object') {
        // Initialize with at least 100 votes per venue if starting fresh
        return {
          1: Number(parsedState[1]) || 245,
          2: Number(parsedState[2]) || 178,
          3: Number(parsedState[3]) || 198,
          lastUpdate: Date.now(),
          targetVotes: parsedState.targetVotes || Math.floor(MIN_TARGET_VOTES + Math.random() * (MAX_TARGET_VOTES - MIN_TARGET_VOTES))
        };
      }
    }
  } catch (error) {
    console.error('Error reading stored vote state:', error);
  }

  // Default initial state with some base votes
  return {
    1: 245, // Touchdown Teaser
    2: 178, // Bikini Cup
    3: 198, // Championship Courtside
    lastUpdate: Date.now(),
    targetVotes: Math.floor(MIN_TARGET_VOTES + Math.random() * (MAX_TARGET_VOTES - MIN_TARGET_VOTES))
  };
}

function calculateBaseIncrement(
  currentTotal: number,
  targetVotes: number,
  timeUntilEnd: number
): number {
  if (timeUntilEnd <= 0 || currentTotal >= targetVotes) return 0;
  
  // Ensure we always get some votes by setting a minimum
  const minVotesPerInterval = 5;
  const remainingVotes = targetVotes - currentTotal;
  const intervalsUntilEnd = Math.max(1, Math.floor(timeUntilEnd / UPDATE_INTERVAL));
  const baseVotesPerInterval = Math.min(
    Math.max(
      minVotesPerInterval,
      Math.ceil(remainingVotes / intervalsUntilEnd)
    ),
    Math.floor(MAX_VOTES_PER_MINUTE * (UPDATE_INTERVAL / 60000))
  );
  
  return baseVotesPerInterval;
}

function calculateVenueVotes(
  venueId: number,
  baseIncrement: number,
  currentVotes: number,
  targetVotes: number
): number {
  const config = VENUE_CONFIGS[venueId];
  if (!config) return 0;

  // Ensure minimum votes per venue
  const minVotesPerVenue = 2;
  
  // Base votes calculation with weight
  let votes = Math.max(
    minVotesPerVenue,
    Math.floor(baseIncrement * config.baseWeight)
  );

  // Random variation (-20% to +20%)
  const variation = 0.8 + Math.random() * 0.4;
  votes = Math.floor(votes * variation);

  // Increased chance for spike
  if (Math.random() < config.spikeChance) {
    const spikeMultiplier = config.spikeMultiplier.min + 
      Math.random() * (config.spikeMultiplier.max - config.spikeMultiplier.min);
    votes = Math.floor(votes * spikeMultiplier);
  }

  // Ensure we don't exceed target votes
  const totalAfterVotes = currentVotes + votes;
  if (totalAfterVotes > targetVotes * config.baseWeight * 1.1) {
    votes = Math.max(0, Math.floor(targetVotes * config.baseWeight * 1.1) - currentVotes);
  }

  return Math.max(minVotesPerVenue, votes); // Ensure minimum votes
}

export function useVotingSimulation() {
  const [votes, setVotes] = useState<VoteState>(getStoredVoteState);

  useEffect(() => {
    const updateVotes = () => {
      const now = Date.now();
      const timeUntilEnd = END_DATE.getTime() - now;
      
      if (timeUntilEnd <= 0) return;

      setVotes(currentVotes => {
        const currentTotal = Object.entries(currentVotes).reduce((sum, [key, count]) => 
          !isNaN(Number(key)) ? sum + count : sum, 
          0
        );

        const baseIncrement = calculateBaseIncrement(
          currentTotal,
          currentVotes.targetVotes || MAX_TARGET_VOTES,
          timeUntilEnd
        );

        // Calculate new votes for each venue
        const newVotes = {
          1: currentVotes[1] + calculateVenueVotes(1, baseIncrement, currentVotes[1], currentVotes.targetVotes!),
          2: currentVotes[2] + calculateVenueVotes(2, baseIncrement, currentVotes[2], currentVotes.targetVotes!),
          3: currentVotes[3] + calculateVenueVotes(3, baseIncrement, currentVotes[3], currentVotes.targetVotes!),
          lastUpdate: now,
          targetVotes: currentVotes.targetVotes
        };

        // Store the updated state
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newVotes));
        } catch (error) {
          console.error('Error saving vote state:', error);
        }

        return newVotes;
      });
    };

    // Initial update
    updateVotes();

    // Set up interval for regular updates
    const interval = setInterval(updateVotes, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return votes;
}