import type { AffinePoint } from "@noble/curves/abstract/curve";
import type { GostCurveFn } from "./const";

/**
 * Compute parameters (`s`, `t`) for conversion
 * @param curve Curve to use
 */
export const computeST = (curve: GostCurveFn): bigint[] => {
    if(!curve.CURVE.e || !curve.CURVE.d) throw new Error("No Twisted Edwards parameters");

    let Fp = curve.Point.Fp;
    return [Fp.div(Fp.sub(curve.CURVE.e, curve.CURVE.d), 4n), Fp.div(Fp.add(curve.CURVE.e, curve.CURVE.d), 6n)];
}

/**
 * Convert Twisted Edwards point (`u`, `v`) to Weierstrass (`x`, `y`)
 * @param curve Curve to use
 * @param point Twisted Edwards point 
 */
export const uv2xy = (curve: GostCurveFn, point: AffinePoint<bigint>): AffinePoint<bigint> => {
    let Fp = curve.Point.Fp;
    let [s, t] = computeST(curve);

    let s1v = Fp.mul(s, Fp.add(1n, point.y)), onev = Fp.sub(1n, point.y);
    
    return {
        x: Fp.add(t, Fp.div(s1v, onev)),
        y: Fp.div(s1v, Fp.mul(point.x, onev))
    }
}

/**
 * Convert Weierstrass point (`x`, `y`) to Twisted Edwards (`u`, `v`)
 * @param curve Curve to use
 * @param point Weierstrass point
 */
export const xy2uv = (curve: GostCurveFn, point: AffinePoint<bigint>): AffinePoint<bigint> => {
    let Fp = curve.Point.Fp;
    let [s, t] = computeST(curve);
    let xt = Fp.sub(point.x, t)

    return {
        x: Fp.div(xt, point.y),
        y: Fp.div(Fp.sub(xt, s), Fp.add(xt, s))
    }
}