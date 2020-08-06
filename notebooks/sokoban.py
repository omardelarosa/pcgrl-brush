from PIL import Image
import os

#Current Sokoban State
class State:
    #Empty Sokoban Level
    def __init__(self):
        self.solid=[]
        self.targets=[]
        self.crates=[]
        self.player=None

    #Initialize a Sokoban level from lines
    def stringInitialize(self, lines):
        self.solid=[]
        self.targets=[]
        self.crates=[]
        self.player=None

        # clean the input
        for i in range(len(lines)):
            lines[i]=lines[i].replace("\n","")

        for i in range(len(lines)):
            if len(lines[i].strip()) != 0:
                break
            else:
                del lines[i]
                i-=1
        for i in range(len(lines)-1,0,-1):
            if len(lines[i].strip()) != 0:
                break
            else:
                del lines[i]
                i+=1

        #get size of the map
        self.width=0
        self.height=len(lines)
        for l in lines:
            if len(l) > self.width:
                self.width = len(l)

        #set the level
        for y in range(self.height):
            l = lines[y]
            self.solid.append([])
            for x in range(self.width):
                if x > len(l)-1:
                    self.solid[y].append(False)
                    continue
                c=l[x]
                if c == "#":
                    self.solid[y].append(True)
                else:
                    self.solid[y].append(False)
                    if c == "@" or c=="+":
                        self.player={"x":x, "y":y}
                    if c=="$" or c=="*":
                        self.crates.append({"x":x, "y":y})
                    if c=="." or c=="+" or c=="*":
                        self.targets.append({"x":x, "y":y})

    # Make a clone of the current state
    def clone(self):
        clone=State()
        clone.width = self.width
        clone.height = self.height
        # since the solid is not changing then copy by value
        clone.solid = self.solid
        if hasattr(self, 'deadlocks'):
            clone.deadlocks = self.deadlocks
        clone.player={"x":self.player["x"], "y":self.player["y"]}

        for t in self.targets:
            clone.targets.append({"x":t["x"], "y":t["y"]})

        for c in self.crates:
            clone.crates.append({"x":c["x"], "y":c["y"]})

        return clone

    # check if that state is a win state
    def checkWin(self):
        if len(self.targets) != len(self.crates) or len(self.targets) == 0 or len(self.crates) == 0:
            return False

        for t in self.targets:
            if self._checkCrateLocation(t["x"], t["y"]) is None:
                return False

        return True

    #update the current game state
    def update(self, dirX, dirY):
        if abs(dirX) > 0 and abs(dirY) > 0:
            return
        if self.checkWin():
            return
        if dirX > 0:
            dirX=1
        if dirX < 0:
            dirX=-1
        if dirY > 0:
            dirY=1
        if dirY < 0:
            dirY=-1
        newX=self.player["x"]+dirX
        newY=self.player["y"]+dirY
        if self._checkMovableLocation(newX, newY):
            self.player["x"]=newX
            self.player["y"]=newY
        else:
            crate=self._checkCrateLocation(newX,newY)
            if crate is not None:
                crateX=crate["x"]+dirX
                crateY=crate["y"]+dirY
                if self._checkMovableLocation(crateX,crateY):
                    self.player["x"]=newX
                    self.player["y"]=newY
                    crate["x"]=crateX
                    crate["y"]=crateY
                    return True
        return False

    #render the level as a string or as an image based on the input
    def render(self, mode="string"):
        if mode == "string":
            result = ""
            for y in range(self.height):
                for x in range(self.width):
                    if self.solid[y][x]:
                        result += "#"
                    else:
                        crate=self._checkCrateLocation(x,y) is not None
                        target=self._checkTargetLocation(x,y) is not None
                        player=self.player["x"]==x and self.player["y"]==y
                        if crate:
                            if target:
                                result += "*"
                            else:
                                result += "$"
                        elif player:
                            if target:
                                result += "+"
                            else:
                                result += "@"
                        else:
                            if target:
                                result += "."
                            else:
                                result += " "
                result += "\n"
            return result[:-1]
        elif mode == "image":
            if not hasattr(self, '_graphics'):
                self._graphics = {
                    "empty": Image.open(os.path.dirname(__file__) + "/assets/graphics/empty.png").convert('RGBA'),
                    "solid": Image.open(os.path.dirname(__file__) + "/assets/graphics/solid.png").convert('RGBA'),
                    "player": Image.open(os.path.dirname(__file__) + "/assets/graphics/player.png").convert('RGBA'),
                    "crate": Image.open(os.path.dirname(__file__) + "/assets/graphics/crate.png").convert('RGBA'),
                    "target": Image.open(os.path.dirname(__file__) + "/assets/graphics/target.png").convert('RGBA')
                }
            lvl_image = Image.new("RGBA", (self.width*16, self.height*16), (0,0,0,255))
            for y in range(self.height):
                for x in range(self.width):
                    type = "empty"
                    if self.solid[y][x]:
                        type = "solid"
                    location = (x*16, y*16, (x+1)*16, (y+1)*16)
                    lvl_image.paste(self._graphics[type], location)
                    if self._checkTargetLocation(x,y) is not None:
                        lvl_image.paste(self._graphics["target"], location, self._graphics["target"])
                    if self.player["x"] == x and self.player["y"] == y:
                        lvl_image.paste(self._graphics["player"], location, self._graphics["player"])
                    elif self._checkCrateLocation(x,y) is not None:
                        lvl_image.paste(self._graphics["crate"], location, self._graphics["crate"])
            return lvl_image

#################### PRIVATE HELPER FUNCTIONS #################### 
    def __str__(self):
        return self.render("string")

    def _checkOutside(self, x, y):
        return x < 0 or y < 0 or x > len(self.solid[0]) - 1 or y > len(self.solid) - 1

    def _checkTargetLocation(self, x, y):
        for t in self.targets:
            if t["x"] == x and t["y"] == y:
                return t
        return None

    def _checkCrateLocation(self, x, y):
        for c in self.crates:
            if c["x"] == x and c["y"] == y:
                return c
        return None

    def _checkMovableLocation(self, x, y):
        return not self._checkOutside(x, y) and not self.solid[y][x] and self._checkCrateLocation(x,y) is None
