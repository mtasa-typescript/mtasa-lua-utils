# MTASA Lua Utils for TypeScript compilation

The repository provides the transformer and post-build, pre-build utilities.

## Transformer

The transformer provides:

- TypeScript `import` removing: Result Lua file should not have any `requires` calls

- TypeScript `export` replace: All exported statements will be written to Lua's `_G`  
    From: 
  ```typescript
    const awesomeGlobalVariable: number = 13;
    export {awesomeGlobalVariable};
  ```  
    To:
  ```lua
    local awesomeGlobalVariable = 13
    _G.awesomeGlobalVariable = awesomeGlobalVariable
  ```  

- TypeScript inline `export` replace:

- File side checking: You cannot mix `import ... from '.../client'` 
  and `import ... from '.../server'`

### How to use

## PreBuild

### How to use

## PostBuild

### How to use

