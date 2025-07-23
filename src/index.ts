import { bytesToNumberBE, randomBytes } from "@noble/curves/utils";
import { type GostCurveFn } from "./const";
import { mod } from "@noble/curves/abstract/modular";

/**
 * Generate public key from private.
 * @param curve Curve parameters
 * @param prv Private key
 * @returns {Uint8Array} Uncompressed public key in ANSI X9.62 format
 */
export const getPublicKey = (curve: GostCurveFn, prv: Uint8Array): Uint8Array => curve.getPublicKey(prv, false);

/**
 * Generate signature of provided digest
 * @param curve Curve parameters
 * @param prv Private key
 * @param digest Digest to sign
 * @param rand Optional. Predefined random data for `r` and `k` generation
 * @returns {Uint8Array} Concated `r` and `s`
 */
export const sign = (curve: GostCurveFn, prv: Uint8Array, digest: Uint8Array, rand?: Uint8Array): Uint8Array => {
    let size = curve.info.lengths.secret;
    let Fn = curve.Point.Fn;
    
    let e = Fn.fromBytes(digest);
    if(e === 0n) e = 1n;

    while (true) {
        let k = mod(bytesToNumberBE(rand ?? randomBytes(size)), curve.CURVE.n);
        if(k === 0n) continue;
        try {
            let {x: r} = curve.Point.BASE.multiply(k);
            r = Fn.create(r);
            if(r === 0n) continue;
            
            const d = Fn.mul(Fn.fromBytes(prv), r);
            const s = Fn.add(d, Fn.mul(k, e));
            if (s === 0n) continue;

            return new curve.Signature(r, s).toBytes();
        } catch(e) {
            if((e as Error).message == "invalid scalar: out of range") continue;
        }
    }
}

/**
 * Verify signature of provided digest
 * @param curve Curve parameters
 * @param pub Public key
 * @param digest Digest to verify
 * @param signature Signature (Concated `r` and `s`)
 */
export const verify = (curve: GostCurveFn, pub: Uint8Array, digest: Uint8Array, signature: Uint8Array): boolean => {
    let size = curve.info.lengths.secret;
    let Fn = curve.Point.Fn,
        Fp = curve.Point.Fp;

    if(signature.length != size * 2) throw new Error("Invalid signature")

    let r = bytesToNumberBE(signature.slice(0, size));
    let s = bytesToNumberBE(signature.slice(size));

    if(r <= 0 || r >= curve.CURVE.n || s <= 0 || s >= curve.CURVE.n) return false;
    
    let e = Fn.fromBytes(digest);
    if(e === 0n) e = 1n;

    let v = Fn.inv(e)

    let z1 = Fn.mul(s, v),
        z2 = Fn.sub(curve.CURVE.n, Fn.mul(r, v));
    
    let P1, Q1;
    try {
        P1 = curve.Point.BASE.multiply(z1);
        Q1 = curve.Point.fromBytes(pub).multiply(z2);
    } catch {
        return false;
    }

    const { x: p1x, y: p1y } = P1;
    const { x: q1x, y: q1y } = Q1;

    if (p1x === q1x) {
        if (p1y === q1y) {
            // Double
            if (p1y === 0n) return false;
            const lam = Fp.mul(Fp.add(Fp.mul(3n, Fp.sqr(p1x)), curve.CURVE.a), Fp.inv(Fp.mul(2n, p1y)));
            const x3 = Fp.sub(Fp.sqr(lam), Fp.add(p1x, q1x));
            return Fn.create(x3) === r;
        } else {
            // P + (-P) = O
            return false;
        }
    }

    const lam = Fp.mul(Fp.sub(q1y, p1y), Fp.inv(Fp.sub(q1x, p1x)));
    const x3 = Fp.sub(Fp.sqr(lam), Fp.add(p1x, q1x));
    return Fn.create(x3) === r;
}

export * from "./const";
export * from "./vko";
export * from "./conversion";