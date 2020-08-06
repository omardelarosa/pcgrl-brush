from helper import getHeuristic, getHash
from queue import PriorityQueue

# initialize deadlock locations where level can't be won from them
def intializeDeadlocks(state):
    sign = lambda x: int(x/max(1,abs(x)))

    state.deadlocks = []
    for y in range(state.height):
        state.deadlocks.append([])
        for x in range(state.width):
            state.deadlocks[y].append(False)

    corners = []
    for y in range(state.height):
        for x in range(state.width):
            if x == 0 or y == 0 or x == state.width - 1 or y == state.height - 1 or state.solid[y][x]:
                continue
            if (state.solid[y-1][x] and state.solid[y][x-1]) or (state.solid[y-1][x] and state.solid[y][x+1]) or (state.solid[y+1][x] and state.solid[y][x-1]) or (state.solid[y+1][x] and state.solid[y][x+1]):
                if not state._checkTargetLocation(x, y):
                    corners.append({"x":x, "y":y})
                    state.deadlocks[y][x] = True

    for c1 in corners:
        for c2 in corners:
            dx,dy = sign(c1["x"] - c2["x"]), sign(c1["y"] - c2["y"])
            if (dx == 0 and dy == 0) or (dx != 0 and dy != 0):
                continue
            walls = []
            x,y=c2["x"],c2["y"]
            if dx != 0:
                x += dx
                while x != c1["x"]:
                    if state._checkTargetLocation(x,y) or state.solid[y][x] or (not state.solid[y-1][x] and not state.solid[y+1][x]):
                        walls = []
                        break
                    walls.append({"x":x, "y":y})
                    x += dx
            if dy != 0:
                y += dy
                while y != c1["y"]:
                    if state._checkTargetLocation(x,y) or state.solid[y][x] or (not state.solid[y][x-1] and not state.solid[y][x+1]):
                        walls = []
                        break
                    walls.append({"x":x, "y":y})
                    y += dy
            for w in walls:
                state.deadlocks[w["y"]][w["x"]] = True

# check if the current state is a deadlock
def checkDeadlock(state):
    if hasattr(state, 'deadlocks'):
        for c in state.crates:
            if state.deadlocks[c["y"]][c["x"]]:
                return True
    return False

directions = [{"x":-1, "y":0}, {"x":1, "y":0}, {"x":0, "y":-1}, {"x":0, "y":1}]
# node class where the agent are using
class Node:
    balance = 0.5
    def __init__(self, state, parent, action):
        self.state = state
        self.parent = parent
        self.action = action
        self.depth = 0
        if self.parent != None:
            self.depth = parent.depth + 1

    def getChildren(self):
        children = []
        for d in directions:
            childState = self.state.clone()
            crateMove = childState.update(d["x"], d["y"])
            if childState.player["x"] == self.state.player["x"] and childState.player["y"] == self.state.player["y"]:
                continue
            if crateMove and checkDeadlock(childState):
                continue
            children.append(Node(childState, self, d))
        return children

    def getHash(self):
        return getHash(self.state)

    def getCost(self):
        return self.depth

    def getHeuristic(self):
        return getHeuristic(self.state)

    def checkWin(self):
        return self.state.checkWin()

    def getActions(self):
        actions = []
        current = self
        while(current.parent != None):
            actions.insert(0,current.action)
            current = current.parent
        return actions

    def __str__(self):
        return str(self.depth) + "," + str(self.getHeuristic()) + "\n" + str(self.state)

    def __lt__(self, other):
        return self.getHeuristic()+Node.balance*self.getCost() < other.getHeuristic()+Node.balance*other.getCost()


#Base class of agent
class Agent:
    def getSolution(self, state, maxIterations):
        return []

#BFS Agent code
class BFSAgent(Agent):
    def getSolution(self, state, maxIterations=-1):
        intializeDeadlocks(state)
        iterations = 0
        bestNode = None
        queue = [Node(state.clone(), None, None)]
        visisted = set()
        while (iterations < maxIterations or maxIterations <= 0) and len(queue) > 0:
            iterations += 1
            current = queue.pop(0)
            if current.checkWin():
                return current.getActions(), current, iterations
            if current.getHash() not in visisted:
                if bestNode == None or current.getHeuristic() < bestNode.getHeuristic():
                    bestNode = current
                elif current.getHeuristic() == bestNode.getHeuristic() and current.getCost() < bestNode.getCost():
                    bestNode = current
                visisted.add(current.getHash())
                queue.extend(current.getChildren())
        return bestNode.getActions(), bestNode, iterations

#DFS Agent Code
class DFSAgent(Agent):
    def getSolution(self, state, maxIterations=-1):
        intializeDeadlocks(state)
        iterations = 0
        bestNode = None
        queue = [Node(state.clone(), None, None)]
        visisted = set()
        while (iterations < maxIterations or maxIterations <= 0) and len(queue) > 0:
            iterations += 1
            current = queue.pop()
            if current.checkWin():
                return current.getActions(), current, iterations
            if current.getHash() not in visisted:
                if bestNode == None or current.getHeuristic() < bestNode.getHeuristic():
                    bestNode = current
                elif current.getHeuristic() == bestNode.getHeuristic() and current.getCost() < bestNode.getCost():
                    bestNode = current
                visisted.add(current.getHash())
                queue.extend(current.getChildren())
        return bestNode.getActions(), bestNode, iterations

#AStar Agent Code
class AStarAgent(Agent):
    def getSolution(self, state, balance=1, maxIterations=-1):
        intializeDeadlocks(state)
        iterations = 0
        bestNode = None
        Node.balance = balance
        queue = PriorityQueue()
        queue.put(Node(state.clone(), None, None))
        visisted = set()
        while (iterations < maxIterations or maxIterations <= 0) and queue.qsize() > 0:
            iterations += 1
            # queue = sorted(queue, key=lambda node: balance*node.getCost() + node.getHeuristic())
            current = queue.get()
            if current.checkWin():
                return current.getActions(), current, iterations
            if current.getHash() not in visisted:
                if bestNode == None or current.getHeuristic() < bestNode.getHeuristic():
                    bestNode = current
                elif current.getHeuristic() == bestNode.getHeuristic() and current.getCost() < bestNode.getCost():
                    bestNode = current
                visisted.add(current.getHash())
                children = current.getChildren()
                for c in children:
                    queue.put(c)
        return bestNode.getActions(), bestNode, iterations
