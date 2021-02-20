# MTASA Lua Utils for TypeScript compilation

The repository provides the transformer and post-build, pre-build utilities.

These utilities and transformers can be used with 
[TypescriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua) package.

## Transformer

The transformer provides:

- TypeScript `import` removing: Result Lua file should not have any `requires` calls

- TypeScript `export` (and inlined `export`) replace: All exported statements will be written to Lua's `_G`. 
  [Example](docs/export.md)

- File side checking: You cannot mix `import ... from '.../client'` 
  and `import ... from '.../server'`

### How to use

Insert into `tsconfig.json`:

```js
{
  "compilerOptions": {
    // ...

    "plugins": [
      {
        "transform": "mtasa-lua-utils/transformer",
        "after": false
      }
    ],
    
    // ...
  }
}
```

## PostBuild

Checks compiled lua files correctness:

- Are the files provided in `meta.xml`

### How to use

Insert into `package.json`:

```js
{
  // ...

  "scripts": {
    "postbuild": "mtasa-utils-postbuild",
  },   
          
  // ...
}
```
