import { Gost341194 } from "@li0ard/gost341194";
import { streebog256, streebog512 } from "@li0ard/streebog";
import { bytesToNumberBE, numberToBytesLE } from "@noble/curves/utils";
import type { GostCurveFn } from "./const";

/**
 * Key agreement function (like ECDH)
 * @param curve Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param ukm User keying material (aka salt)
 * @returns {Uint8Array} Shared key
 */
export const kek = (curve: GostCurveFn, prv: Uint8Array, pub: Uint8Array, ukm: Uint8Array): Uint8Array => {
    let Fn = curve.Point.Fn;
    let key = curve.Point.fromBytes(pub).multiply(bytesToNumberBE(prv));
    
    key = key.multiply(Fn.mulN(curve.CURVE.h, bytesToNumberBE(ukm)));
    let result = new Uint8Array(curve.info.lengths.secret*2);
    result.set(numberToBytesLE(key.x, curve.info.lengths.secret));
    result.set(numberToBytesLE(key.y, curve.info.lengths.secret), curve.info.lengths.secret);

    return result
}

/**
 * Key agreement function over GOST R 34.11-94 hash
 * @param curve Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param ukm User keying material (aka salt)
 * @returns {Uint8Array} Shared key
 */
export const kek_34102001 = (curve: GostCurveFn, prv: Uint8Array, pub: Uint8Array, ukm: Uint8Array): Uint8Array => Gost341194.create().update(kek(curve, prv, pub, ukm)).digest();

/**
 * Key agreement function over Streebog (GOST R 34.11-2012) 256 bit hash
 * @param curve Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param ukm User keying material (aka salt)
 * @returns {Uint8Array} Shared key
 */
export const kek_34102012256 = (curve: GostCurveFn, prv: Uint8Array, pub: Uint8Array, ukm: Uint8Array): Uint8Array => streebog256(kek(curve, prv, pub, ukm));

/**
 * Key agreement function over Streebog (GOST R 34.11-2012) 512 bit hash
 * @param curve Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param ukm User keying material (aka salt)
 * @returns {Uint8Array} Shared key
 */
export const kek_34102012512 = (curve: GostCurveFn, prv: Uint8Array, pub: Uint8Array, ukm: Uint8Array): Uint8Array => streebog512(kek(curve, prv, pub, ukm));

/**
 * Export key generation
 * @param curve Curve to use
 * @param prv Private key
 * @param pub Public key
 * @param h `h`-value (32 bytes)
 * @experimental Not tested, cuz there is no test vectors in standard
 */
/*export const keg = (curve: GostCurveFn, prv: Uint8Array, pub: Uint8Array, h: Uint8Array): Uint8Array => {
    if(h.length !== 32) throw new Error("Invalid 'h' length. Must be 32 bytes");

    if(curve.info.lengths.secret == 64) return kek_34102012512(curve, prv, pub, h.slice(0, 16));
    let k_exp = kek_34102012256(curve, prv, pub, h.slice(0, 16))
    return concatBytes(...kdf_tree_gostr3411_2012_256(k_exp, hexToBytes("6b64662074726565"), h.slice(16, 24), 2))
}*/
