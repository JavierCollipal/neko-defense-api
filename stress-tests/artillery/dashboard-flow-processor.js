// 🐾⚡ Artillery Processor - Custom Logic for Dashboard Flow ⚡🐾

module.exports = {
  // Custom function to log scenario start
  logScenarioStart: function(context, events, done) {
    console.log(`🐾 [${new Date().toISOString()}] User scenario starting, nyaa~!`);
    return done();
  },

  // Custom function to validate responses
  validateResponse: function(requestParams, response, context, ee, next) {
    // Check for successful responses
    if (response.statusCode === 200) {
      console.log(`✅ Request successful: ${requestParams.url}`);
    } else if (response.statusCode === 429) {
      console.log(`⚠️  Rate limited (expected): ${requestParams.url}`);
    } else {
      console.log(`❌ Unexpected status ${response.statusCode}: ${requestParams.url}`);
    }

    return next();
  },

  // Generate random think time (simulate real users)
  randomThinkTime: function(context, events, done) {
    const thinkTime = Math.floor(Math.random() * 3) + 1; // 1-3 seconds
    setTimeout(done, thinkTime * 1000);
  }
};
