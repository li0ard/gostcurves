<p align="center">
    <b>@li0ard/gostcurves</b><br>
    <b>GOST R 34.10 curves and DSA in pure TypeScript</b>
    <br>
    <a href="https://li0ard.is-cool.dev/gostcurves">docs</a>
    <br><br>
    <a href="https://github.com/li0ard/gostcurves/actions/workflows/test.yml"><img src="https://github.com/li0ard/gostcurves/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/li0ard/gostcurves/blob/main/LICENSE"><img src="https://img.shields.io/github/license/li0ard/gostcurves" /></a>
    <br>
    <a href="https://npmjs.com/package/@li0ard/gostcurves"><img src="https://img.shields.io/npm/v/@li0ard/gostcurves" /></a>
    <a href="https://jsr.io/@li0ard/gostcurves"><img src="https://jsr.io/badges/@li0ard/gostcurves" /></a>
    <br>
    <hr>
</p>

> [!WARNING]
> This library is currently in alpha stage: the lib is not very stable yet, and there may be a lot of bugs
> feel free to try it out, though, any feedback is appreciated!

> [!IMPORTANT]  
> Don't use methods from the elliptic curves objects (`GostCurveFn`). Use methods directly from library 
> (`sign`, `verify`, etc.)

## Installation

```bash
# from NPM
npm i @li0ard/gostcurves

# from JSR
bunx jsr i @li0ard/gostcurves
```

## Usage
### Create signature

```ts
import { ID_GOSTR3410_2012_256_PARAM_SET_A, sign, verify, getPublicKey } from "@li0ard/gostcurves";

let curve = ID_GOSTR3410_2012_256_PARAM_SET_A;
let privKey = hexToBytes("0ca68a44333dbee1daea1e80dbdd560a43215886a392472b898ed3721e1177e0");
let publicKey = getPublicKey(curve, privKey);
let digest = hexToBytes("2dfbc1b372d89a1188c09c52e0eec61fce52032ab1022e8e67ece6672b043ee5");

let signature = sign(curve, privKey, digest);
console.log(signature); // -> Uint8Array [...]
console.log(verify(curve, publicKey, digest, signature)); // -> true
```

### Create shared key with VKO algorithm
```ts
import { ID_GOSTR3410_2012_512_PARAM_SET_A, getPublicKey, kek_34102012256 } from "@li0ard/gostcurves"

let curve = ID_GOSTR3410_2012_512_PARAM_SET_A;
let ukm = hexToBytes("27c744853c60801d")

let alicePriv = hexToBytes("67b63ca4ac8d2bb32618d89296c7476dbeb9f9048496f202b1902cf2ce41dbc2f847712d960483458d4b380867f426c7ca0ff5782702dbc44ee8fc72d9ec90c9");
let bobPriv = hexToBytes("dbd09213a592da5bbfd8ed068cccccbbfbeda4feac96b9b4908591440b0714803b9eb763ef932266d4c0181a9b73eacf9013efc65ec07c888515f1b6f759c848");

let alicePub = getPublicKey(curve, alicePriv);
let bobPub = getPublicKey(curve, bobPriv);

console.log(kek_34102012256(curve, alicePriv, bobPub, ukm)) // -> c9a9a77320e2cc559ed72dce6f47e2192ccea95fa648670582c054c0ef36c221
console.log(kek_34102012256(curve, bobPriv, alicePub, ukm)) // -> c9a9a77320e2cc559ed72dce6f47e2192ccea95fa648670582c054c0ef36c221
```