import { Gost341194 } from "@li0ard/gost341194";
import { kdf_tree_gostr3411_2012_256, streebog256, streebog512 } from "@li0ard/streebog";
import { bytesToNumberBE, concatBytes, hexToBytes, numberToBytesLE } from "@noble/curves/utils";
import type { GostCurveParameters } from "./const";
import { Field } from "@noble/curves/abstract/modular";
import { weierstrassN } from "@noble/curves/abstract/weierstrass";

/**
 * Key agreement function (like ECDH)
 * @param parameters Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param ukm User keying material (aka salt)
 * @returns {Uint8Array} Shared key
 */
export const kek = (parameters: GostCurveParameters, prv: Uint8Array, pub: Uint8Array, ukm: Uint8Array): Uint8Array => {
    let Fn = Field(parameters.n);
    let key = weierstrassN(parameters).fromBytes(pub)
        .multiply(bytesToNumberBE(prv))
        .multiply(Fn.mulN(parameters.h, bytesToNumberBE(ukm)));
    return concatBytes(numberToBytesLE(key.x, parameters.length), numberToBytesLE(key.y, parameters.length))
}

/**
 * Key agreement function over GOST R 34.11-94 hash
 * @param parameters Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param ukm User keying material (aka salt)
 * @returns {Uint8Array} Shared key
 */
export const kek_34102001 = (parameters: GostCurveParameters, prv: Uint8Array, pub: Uint8Array, ukm: Uint8Array): Uint8Array => Gost341194.create().update(kek(parameters, prv, pub, ukm)).digest();

/**
 * Key agreement function over Streebog (GOST R 34.11-2012) 256 bit hash
 * @param parameters Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param ukm User keying material (aka salt)
 * @returns {Uint8Array} Shared key
 */
export const kek_34102012256 = (parameters: GostCurveParameters, prv: Uint8Array, pub: Uint8Array, ukm: Uint8Array): Uint8Array => streebog256(kek(parameters, prv, pub, ukm));

/**
 * Key agreement function over Streebog (GOST R 34.11-2012) 512 bit hash
 * @param parameters Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param ukm User keying material (aka salt)
 * @returns {Uint8Array} Shared key
 */
export const kek_34102012512 = (parameters: GostCurveParameters, prv: Uint8Array, pub: Uint8Array, ukm: Uint8Array): Uint8Array => streebog512(kek(parameters, prv, pub, ukm));

/**
 * Export key generation
 * @param parameters Curve parameters
 * @param prv Private key
 * @param pub Public key
 * @param h `h`-value (32 bytes)
 * @experimental Not tested, cuz there is no test vectors in standard
 */
export const keg = (parameters: GostCurveParameters, prv: Uint8Array, pub: Uint8Array, h: Uint8Array): Uint8Array => {
    if(h.length !== 32) throw new Error("Invalid 'h' length. Must be 32 bytes");

    if(parameters.length == 64) return kek_34102012512(parameters, prv, pub, h.slice(0, 16));
    let k_exp = kek_34102012256(parameters, prv, pub, h.slice(0, 16))
    return concatBytes(...kdf_tree_gostr3411_2012_256(k_exp, hexToBytes("6b64662074726565"), h.slice(16, 24), 2))
}
