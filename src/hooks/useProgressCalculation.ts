import { useState, useEffect } from 'react';

const STORAGE_KEY = 'streak-start-date';
const END_DATE = new Date('2024-02-07T23:59:59');
const TARGET_COINS = 150000000;
const UPDATE_INTERVAL = 15000; // 15 seconds
const BASE_TOKENS_PER_MINUTE = 10000;
const BASE_TOKENS_PER_INTERVAL = (BASE_TOKENS_PER_MINUTE / 4); // Tokens per 15-second interval

// Bulk purchase configuration
const BULK_MIN = 2000;
const BULK_MAX = 7000;
const BULK_CHANCE = 0.3; // 30% chance of bulk purchase on each interval

// Get or set the start date
function getStartDate(): Date {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    localStorage.setItem(STORAGE_KEY, today.toISOString());
    return today;
  }
  return new Date(stored);
}

const START_DATE = getStartDate();

function getRandomBulkPurchase(): number {
  return Math.floor(BULK_MIN + Math.random() * (BULK_MAX - BULK_MIN));
}

function calculateProgress(currentDate: Date, previousCoins?: number): { percentage: number; coins: number } {
  // Calculate base progress based on time
  const totalDuration = END_DATE.getTime() - START_DATE.getTime();
  const elapsed = currentDate.getTime() - START_DATE.getTime();
  
  if (!previousCoins) {
    // Initial calculation based on elapsed time
    const totalMinutesElapsed = elapsed / (1000 * 60);
    const baseCoins = Math.floor(totalMinutesElapsed * BASE_TOKENS_PER_MINUTE);
    const coins = Math.min(baseCoins, TARGET_COINS * 0.94); // Cap at 94%
    const percentage = (coins / TARGET_COINS) * 100;
    return { coins, percentage };
  } else {
    // Regular interval update with possible bulk purchase
    const baseIncrement = BASE_TOKENS_PER_INTERVAL;
    const randomFactor = 0.7 + Math.random() * 0.6; // Random factor between 0.7 and 1.3
    let increment = Math.floor(baseIncrement * randomFactor);
    
    // Random chance for bulk purchase
    if (Math.random() < BULK_CHANCE) {
      increment += getRandomBulkPurchase();
    }
    
    let newCoins = previousCoins + increment;
    newCoins = Math.min(newCoins, TARGET_COINS * 0.94); // Cap at 94%
    
    const percentage = (newCoins / TARGET_COINS) * 100;
    return { coins: newCoins, percentage };
  }
}

export function useProgressCalculation() {
  const [progress, setProgress] = useState(() => calculateProgress(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => calculateProgress(new Date(), prev.coins));
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return progress;
}