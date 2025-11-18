/**
 * IO-Link Constants and Decoders
 *
 * Provides translation utilities for IO-Link specification constants
 * including bitrates, profile characteristics, wire colors, and more
 */

/**
 * IO-Link Communication Bitrates
 * COM1, COM2, COM3 standard rates
 */
export const IOLINK_BITRATES = {
  'COM1': { rate: 4800, unit: 'bps', display: '4.8 kbps', description: 'COM1 - 4.8 kbit/s' },
  'COM2': { rate: 38400, unit: 'bps', display: '38.4 kbps', description: 'COM2 - 38.4 kbit/s' },
  'COM3': { rate: 230400, unit: 'bps', display: '230.4 kbps', description: 'COM3 - 230.4 kbit/s' },
};

/**
 * Translate COM bitrate to human-readable format
 * @param {string} comRate - COM1, COM2, or COM3
 * @returns {string} Human-readable bitrate
 */
export function translateBitrate(comRate) {
  if (!comRate) return 'Unknown';
  const normalized = comRate.toUpperCase();
  const bitrate = IOLINK_BITRATES[normalized];
  return bitrate ? bitrate.display : comRate;
}

/**
 * Get full bitrate info
 * @param {string} comRate - COM1, COM2, or COM3
 * @returns {object} Bitrate information
 */