module.exports = {
  roulette_probability: parseFloat(process.env.ROULETTE_PROBABILITY) || 0.80, // 80% probability for roulette
  domino_probability: parseFloat(process.env.DOMINO_PROBABILITY) || 0.45, // 45% probability for domino
  album_probability: parseFloat(process.env.ALBUM_PROBABILITY) || 1.0 // 100% probability for album (always wins)
};
