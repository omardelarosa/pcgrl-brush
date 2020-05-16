#!/bin/bash

# Test map example for m00.json
./node_modules/.bin/ts-node \
    --project tsconfig.cli.json \
    src/cli/index.ts \
    --mapJson data/test_maps/m00.json