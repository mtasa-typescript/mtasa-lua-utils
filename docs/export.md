# Export illustration

All exported identifiers will be assigned to `_G` (global scope)

TypeScript:
```typescript
export function ETestF() {

}

export class ETestC {

}

export interface ETestI {

}

export const ETestConst: number = 1;
export let ETestLet: number = 54, ETestLet2: number = 13;

class NETestC {

}

export default NETestC;

function NETestF() {

}

export {NETestF};
```

Lua (with some line-spaces):
```lua
local ____exports = {}

local function ETestF()
end
_G.ETestF = ETestF

local ETestC = __TS__Class()
ETestC.name = "ETestC"
function ETestC.prototype.____constructor(self)
end
_G.ETestC = ETestC

local ETestConst = 1
_G.ETestConst = ETestConst

local ETestLet = 54
local ETestLet2 = 13
_G.ETestLet = ETestLet
_G.ETestLet2 = ETestLet2

local NETestC = __TS__Class()
NETestC.name = "NETestC"
function NETestC.prototype.____constructor(self)
end
_G.NETestC = NETestC

local function NETestF()
end
_G.NETestF = NETestF

return ____exports
```
