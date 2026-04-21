/**
 * pollUtils.js
 * Pure utility functions for poll data calculations.
 * These functions are tested independently with Vitest.
 */

/**
 * Calculates percentage for each option based on vote counts.
 * @param {number[]} votes - Array of vote counts per option
 * @param {number} totalVotes - Sum of all votes
 * @returns {number[]} - Array of rounded percentages (0–100)
 */
export const calculatePercentage = (votes, totalVotes) => {
  if (totalVotes === 0) return votes.map(() => 0);
  return votes.map(v => Math.round((v / totalVotes) * 100));
};

/**
 * Returns the index of the winning option.
 * @param {number[]} votes
 * @returns {number} - Index of winner (-1 if no votes)
 */
export const getWinnerIndex = (votes) => {
  if (!votes || votes.every(v => v === 0)) return -1;
  return votes.indexOf(Math.max(...votes));
};

/**
 * Formats a Stellar address for display (truncated).
 * @param {string} address - Full Stellar address
 * @returns {string} - e.g. "GDRX...JUJJ"
 */
export const formatAddress = (address) => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
