#!/bin/bash

# Test map example for m00.json
./node_modules/.bin/ts-node \
    --project tsconfig.cli.json \
    src/cli/index.ts \
    --genMap \
    --outputPath data/generated_maps/ \
    --name "generated_map"