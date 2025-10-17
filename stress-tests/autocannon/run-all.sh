#!/bin/bash
# 🐾⚡ AUTOCANNON - Run All Benchmarks ⚡🐾

echo "════════════════════════════════════════════════════════════════════════════════"
echo "🐾⚡ NEKO DEFENSE AUTOCANNON BENCHMARK SUITE ⚡🐾"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "This will run all autocannon benchmarks, nyaa~!"
echo "Estimated time: ~2 minutes, desu~!"
echo ""
echo "────────────────────────────────────────────────────────────────────────────────"

# Check if API is running
echo "🔍 Checking if Neko Defense API is running..."
if ! curl -s http://localhost:5001/api/health > /dev/null; then
    echo "❌ ERROR: API is not responding at http://localhost:5001"
    echo "   Please start the API first with: npm run start:dev"
    exit 1
fi

echo "✅ API is running, nyaa~!"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run benchmarks
echo "════════════════════════════════════════════════════════════════════════════════"
echo "🎯 TEST 1/3: Health Endpoint (Lightweight)"
echo "════════════════════════════════════════════════════════════════════════════════"
node "$SCRIPT_DIR/benchmark-health.js"

echo ""
echo "Waiting 5 seconds before next test, desu~..."
sleep 5
echo ""

echo "════════════════════════════════════════════════════════════════════════════════"
echo "📊 TEST 2/3: Stats Endpoint (Medium)"
echo "════════════════════════════════════════════════════════════════════════════════"
node "$SCRIPT_DIR/benchmark-stats.js"

echo ""
echo "Waiting 5 seconds before next test, nyaa~..."
sleep 5
echo ""

echo "════════════════════════════════════════════════════════════════════════════════"
echo "🎯 TEST 3/3: Threat Actors Endpoint (Heavy Database Query)"
echo "════════════════════════════════════════════════════════════════════════════════"
node "$SCRIPT_DIR/benchmark-threats.js"

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "✅ ALL AUTOCANNON BENCHMARKS COMPLETE, NYAA~! 🐾⚡"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Results saved to: stress-tests/results/"
echo "💡 To view results: ls -lh stress-tests/results/autocannon-*.json"
echo ""
echo "🐾 NEKO POWER: MAXIMUM! ⚡✨"
echo ""
