/**
 * normalizePlaceName.js
 *
 * Utility function to normalize or auto-correct place names before
 * making Google Places API calls.
 *
 * Example transformations:
 * 1. Replace curly quotes with straight quotes.
 * 2. Remove unnecessary punctuation (emojis, weird symbols).
 * 3. Normalize known brand expansions or synonyms.
 * 4. Trim extra whitespace.
 */

module.exports = function normalizePlaceName(originalName) {
    // Step 1: Convert curly quotes to straight quotes
    // and remove other non-alphanumeric characters if desired.
    let name = originalName
      // Replace curly single quotes ’‘ with straight '
      .replace(/[’‘]/g, "'")
      // Replace curly double quotes “” with straight "
      .replace(/[“”]/g, '"')
      // Remove other odd symbols (like emojis).
      // Keep letters, digits, common punctuation, and whitespace.
      .replace(/[^\w\s'\-,.&]/g, "");
  
    // Step 2: Handle known expansions or brand synonyms
  
    // Example: "Morgan’s Wonderland" => "Morgans Wonderland"
    name = name.replace(/Morgan’?s/gi, "Morgans");
  
    // Example: "Buc-ee’s" => "Buc-ees"
    name = name.replace(/Buc-ee'?s/gi, "Buc-ees");
  
    // Example: "Mission Concepci\u00f3n" => "Mission Concepcion"
    // (If you want to handle other accent marks, you could use a more robust approach like .normalize("NFD") + removing diacritics.)
    name = name.replace(/\u00f3n/gi, "on"); // specifically for ó → o
  
    // Step 3: Remove extra whitespace
    name = name.trim().replace(/\s{2,}/g, " ");
  
    // Step 4: Return the cleaned-up string
    return name;
  };
  