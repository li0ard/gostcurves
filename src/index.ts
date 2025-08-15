import { bytesToNumberBE, concatBytes, numberToBytesBE, randomBytes } from "@noble/curves/utils";
import { type GostCurveParameters } from "./const";
import { mod } from "@noble/curves/abstract/modular";
import { weierstrassN } from "@noble/curves/abstract/weierstrass";

/**
 * Generate public key from private.
 * @param parameters Curve parameters
 * @param prv Private key
 * @returns {Uint8Array} Uncompressed public key in ANSI X9.62 format
 */
export const getPublicKey = (parameters: GostCurveParameters, prv: Uint8Array): Uint8Array => weierstrassN(parameters).BASE.multiply(bytesToNumberBE(prv)).toBytes(false);

/**
 * Generate signature of provided digest
 * @param parameters Curve parameters
 * @param prv Private key
 * @param digest Digest to sign
 * @param rand Optional. Predefined random data for `r` and `k` generation
 * @returns {Uint8Array} Concated `r` and `s`
 */
export const sign = (parameters: GostCurveParameters, prv: Uint8Array, digest: Uint8Array, rand?: Uint8Array): Uint8Array => {
    let size = parameters.length;
    let curve = weierstrassN(parameters)
    let Fn = curve.Fn;
    let e = Fn.fromBytes(digest);
    if(e === 0n) e = 1n;

    let prvNum = Fn.fromBytes(prv);
    while (true) {
        rand ||= randomBytes(size)
        let k = mod(bytesToNumberBE(rand), parameters.n);
        if(k === 0n) continue;
        try {
            let {x: r} = curve.BASE.multiply(k);
            r = Fn.create(r);
            if(r === 0n) continue;
            
            const s = Fn.add(Fn.mul(r, prvNum), Fn.mul(k, e));
            if (s === 0n) continue;

            return concatBytes(numberToBytesBE(r, parameters.length), numberToBytesBE(s, parameters.length))
        } catch(e) {
            if(e instanceof Error && e.message === "invalid scalar: out of range") continue;
            throw e;
        }
    }
}

/**
 * Verify signature of provided digest
 * @param parameters Curve parameters
 * @param pub Public key
 * @param digest Digest to verify
 * @param signature Signature (Concated `r` and `s`)
 */
export const verify = (parameters: GostCurveParameters, pub: Uint8Array, digest: Uint8Array, signature: Uint8Array): boolean => {
    let size = parameters.length;
    let curve = weierstrassN(parameters)
    let Fn = curve.Fn;

    if(signature.length != size * 2) throw new Error("Invalid signature")

    let r = bytesToNumberBE(signature.slice(0, size));
    let s = bytesToNumberBE(signature.slice(size));

    if(r <= 0 || r >= parameters.n || s <= 0 || s >= parameters.n) return false;
    let e = Fn.fromBytes(digest);
    if(e === 0n) e = 1n;

    let v = Fn.inv(e);

    let z1 = Fn.mul(s, v), z2 = Fn.mul(r, v);
    let P, Q;
    try {
        P = curve.BASE.multiply(z1);
        Q = curve.fromBytes(pub).multiply(z2).negate();
    } catch { return false; }
    return Fn.create(P.add(Q).x) === r;
}

export * from "./const";
export * from "./vko";
export * from "./conversion";