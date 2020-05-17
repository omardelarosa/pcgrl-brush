#!/bin/bash

# Test map example for m00.json
./node_modules/.bin/ts-node \
    --project tsconfig.cli.json \
    src/cli/index.ts \
    --solve \
    --o "data/test_results" \
    --name "generated_maps" \
    --f "data/generated_maps/*.map.results.json"
    # --f "data/generated_maps/s5_r3_i20_*.map.json"