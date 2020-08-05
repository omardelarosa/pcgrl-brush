import os
from sokoban import State

# get game state based on lvlnumber
def readLevel(lvlnumber):
    f = open(os.path.dirname(__file__) + "/assets/levels/Level_{}.txt".format(lvlnumber))
    lines = f.readlines()
    f.close()
    state = State()
    state.stringInitialize(lines)
    return state

# get a unique hash for the current state
def getHash(state):
    key=str(state.player["x"]) + "," + str(state.player["y"]) + "," + str(len(state.crates)) + "," + str(len(state.targets))
    for c in state.crates:
        key += "," + str(c["x"]) + "," + str(c["y"]);
    for t in state.targets:
        key += "," + str(t["x"]) + "," + str(t["y"]);
    return key

# get the remaining heuristic cost for the current state
def getHeuristic(state):
    targets=[]
    for t in state.targets:
        targets.append(t)
    distance=0
    for c in state.crates:
        bestDist = state.width + state.height
        bestMatch = 0
        for i,t in enumerate(targets):
            if bestDist > abs(c["x"] - t["x"]) + abs(c["y"] - t["y"]):
                bestMatch = i
                bestDist = abs(c["x"] - t["x"]) + abs(c["y"] - t["y"])
        distance += abs(targets[bestMatch]["x"] - c["x"]) + abs(targets[bestMatch]["y"] - c["y"])
        del targets[bestMatch]
    return distance
