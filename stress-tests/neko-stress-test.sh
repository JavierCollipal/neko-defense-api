#!/bin/bash
# 🐾⚡ NEKO DEFENSE - UNIFIED STRESS TEST CLI ⚡🐾
# One command to rule them all, nyaa~!

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RESULTS_DIR="$SCRIPT_DIR/results"

# ASCII Art Banner
print_banner() {
    echo -e "${PURPLE}"
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo "    🐾⚡ NEKO DEFENSE STRESS TEST SUITE ⚡🐾"
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

# Check if API is running
check_api() {
    echo -e "${CYAN}🔍 Checking if Neko Defense API is running...${NC}"
    if ! curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
        echo -e "${RED}❌ ERROR: API is not responding at http://localhost:5001${NC}"
        echo -e "${YELLOW}   Please start the API first with:${NC}"
        echo -e "   ${GREEN}cd ~/Documents/github/neko-defense-api && npm run start:dev${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ API is operational, nyaa~!${NC}\n"
}

# Usage information
usage() {
    print_banner
    echo -e "${CYAN}USAGE:${NC}"
    echo -e "  $0 ${YELLOW}[command]${NC}"
    echo ""
    echo -e "${CYAN}COMMANDS:${NC}"
    echo ""
    echo -e "  ${GREEN}quick${NC}        - Quick autocannon benchmarks (~2 min)"
    echo -e "  ${GREEN}load${NC}         - K6 load test (50-100 users, ~14 min)"
    echo -e "  ${GREEN}stress${NC}       - K6 stress test (find breaking point, ~16 min)"
    echo -e "  ${GREEN}spike${NC}        - K6 spike test (traffic bursts, ~4 min)"
    echo -e "  ${GREEN}soak${NC}         - K6 soak test (1 hour endurance)"
    echo -e "  ${GREEN}artillery${NC}    - Artillery dashboard flow (~4 min)"
    echo -e "  ${GREEN}all-quick${NC}    - All quick tests (autocannon + spike, ~6 min)"
    echo -e "  ${GREEN}all-full${NC}     - Full test suite except soak (~40 min)"
    echo -e "  ${GREEN}help${NC}         - Show this help message"
    echo ""
    echo -e "${CYAN}EXAMPLES:${NC}"
    echo -e "  $0 quick          # Quick health check"
    echo -e "  $0 spike          # Test spike handling"
    echo -e "  $0 all-quick      # Run all quick tests"
    echo ""
    echo -e "${PURPLE}💖 NEKO POWER: MAXIMUM! ⚡✨${NC}"
    echo ""
}

# Run quick tests (autocannon)
run_quick() {
    echo -e "${YELLOW}🚀 Running QUICK BENCHMARKS (autocannon)...${NC}\n"
    bash "$SCRIPT_DIR/autocannon/run-all.sh"
}

# Run load test (k6)
run_load() {
    echo -e "${YELLOW}📊 Running LOAD TEST (k6)...${NC}\n"
    ~/bin/k6 run "$SCRIPT_DIR/k6/load-test.js" --out json="$RESULTS_DIR/k6-load-$(date +%Y%m%d-%H%M%S).json"
}

# Run stress test (k6)
run_stress() {
    echo -e "${YELLOW}🔥 Running STRESS TEST (k6 - Breaking Point)...${NC}\n"
    echo -e "${RED}⚠️  WARNING: This will push the API to its limits!${NC}\n"
    ~/bin/k6 run "$SCRIPT_DIR/k6/stress-test.js" --out json="$RESULTS_DIR/k6-stress-$(date +%Y%m%d-%H%M%S).json"
}

# Run spike test (k6)
run_spike() {
    echo -e "${YELLOW}🚨 Running SPIKE TEST (k6 - Traffic Bursts)...${NC}\n"
    ~/bin/k6 run "$SCRIPT_DIR/k6/spike-test.js" --out json="$RESULTS_DIR/k6-spike-$(date +%Y%m%d-%H%M%S).json"
}

# Run soak test (k6)
run_soak() {
    echo -e "${YELLOW}⏰ Running SOAK TEST (k6 - 1 Hour Endurance)...${NC}\n"
    echo -e "${RED}⚠️  WARNING: This test will take 1 HOUR!${NC}"
    echo -e "${CYAN}   Monitor system resources during this test:${NC}"
    echo -e "   - RAM usage: ${GREEN}htop${NC} or ${GREEN}free -h${NC}"
    echo -e "   - MongoDB: ${GREEN}mongostat${NC}"
    echo -e "   - API logs: ${GREEN}tail -f ~/neko-api.log${NC}\n"
    read -p "   Continue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ~/bin/k6 run "$SCRIPT_DIR/k6/soak-test.js" --out json="$RESULTS_DIR/k6-soak-$(date +%Y%m%d-%H%M%S).json"
    else
        echo -e "${YELLOW}Soak test cancelled, desu~!${NC}"
    fi
}

# Run artillery test
run_artillery() {
    echo -e "${YELLOW}📝 Running ARTILLERY TEST (Dashboard Flow)...${NC}\n"
    npx artillery run "$SCRIPT_DIR/artillery/dashboard-flow.yml" \
        --output "$RESULTS_DIR/artillery-dashboard-$(date +%Y%m%d-%H%M%S).json"
}

# Run all quick tests
run_all_quick() {
    echo -e "${YELLOW}🎯 Running ALL QUICK TESTS...${NC}\n"
    run_quick
    echo ""
    run_spike
}

# Run full test suite (except soak)
run_all_full() {
    echo -e "${YELLOW}🎯 Running FULL TEST SUITE (except soak)...${NC}\n"
    echo -e "${CYAN}Estimated time: ~40 minutes, nyaa~!${NC}\n"
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Full suite cancelled, desu~!${NC}"
        exit 0
    fi

    run_quick
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    run_artillery
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    run_spike
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    run_load
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    run_stress
}

# Print summary
print_summary() {
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ TEST SUITE COMPLETE, NYAA~! 🐾⚡${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}📁 Results saved to:${NC} $RESULTS_DIR/"
    echo -e "${CYAN}📊 View results:${NC}"
    echo -e "   ${GREEN}ls -lh $RESULTS_DIR/${NC}"
    echo -e "   ${GREEN}cat $RESULTS_DIR/*.txt${NC}"
    echo ""
    echo -e "${PURPLE}💖 NEKO POWER: MAXIMUM! ⚡✨${NC}"
    echo ""
}

# Main script
main() {
    # Create results directory
    mkdir -p "$RESULTS_DIR"

    # Check if command provided
    if [ $# -eq 0 ]; then
        usage
        exit 0
    fi

    # Parse command
    case "$1" in
        quick)
            print_banner
            check_api
            run_quick
            print_summary
            ;;
        load)
            print_banner
            check_api
            run_load
            print_summary
            ;;
        stress)
            print_banner
            check_api
            run_stress
            print_summary
            ;;
        spike)
            print_banner
            check_api
            run_spike
            print_summary
            ;;
        soak)
            print_banner
            check_api
            run_soak
            print_summary
            ;;
        artillery)
            print_banner
            check_api
            run_artillery
            print_summary
            ;;
        all-quick)
            print_banner
            check_api
            run_all_quick
            print_summary
            ;;
        all-full)
            print_banner
            check_api
            run_all_full
            print_summary
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}\n"
            usage
            exit 1
            ;;
    esac
}

# Run main
main "$@"
