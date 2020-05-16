#!/bin/bash

# Test map example for m00.json

iterations=20 # number of iterations per map.
for s in {1..5} # max 5 steps
do
    for r in {1..3}
    do
        for i in {00...25} # 25 maps per cycle
        do
            m=$(printf "%02d" $i)
            map_name="s${s}_r${r}_i${iterations}_m${m}"
            echo "generating: $map_name"
            # ./node_modules/.bin/ts-node \
            #     --project tsconfig.cli.json \
            #     src/cli/index.ts \
            #     --genMap \
            #     --radius $r \
            #     --steps $s \
            #     --iterations $iterations \
            #     --outputPath data/generated_maps/ \
            #     --name $map_name
        done
    done
done

