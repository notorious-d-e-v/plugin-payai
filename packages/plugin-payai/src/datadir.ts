/*
 * Provide a data directory for the PayAI Plugin.
 * This will be the working directory + '/data/payai'
*/

const cwd = process.cwd();
export const dataDir = `${cwd}/data/payai`;