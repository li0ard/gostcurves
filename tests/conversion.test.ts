import { describe, test, expect } from "bun:test"
import { ID_GOSTR3410_2012_256_PARAM_SET_A, ID_GOSTR3410_2012_512_PARAM_SET_C, uv2xy, xy2uv } from "../src/"

describe("Point conversion (256 bit)", () => {
    let c = ID_GOSTR3410_2012_256_PARAM_SET_A
    test("(u,v) -> (x,y)", () => {
        let point = {
            x: 0x0dn,
            y: 0x60CA1E32AA475B348488C38FAB07649CE7EF8DBE87F22E81F92B2592DBA300E7n
        }
        let result = uv2xy(c, point);
        expect(result.x).toStrictEqual(c.CURVE.Gx);
        expect(result.y).toStrictEqual(c.CURVE.Gy);
    })

    test("(x,y) -> (u,v)", () => {
        let point = {
            x: c.CURVE.Gx,
            y: c.CURVE.Gy
        }
        let result = xy2uv(c, point);
        expect(result.x).toStrictEqual(0x0dn);
        expect(result.y).toStrictEqual(0x60CA1E32AA475B348488C38FAB07649CE7EF8DBE87F22E81F92B2592DBA300E7n);
    })
})

describe("Point conversion (512 bit)", () => {
    let c = ID_GOSTR3410_2012_512_PARAM_SET_C
    test("(u,v) -> (x,y)", () => {
        let point = {
            x: 0x12n,
            y: 0x469AF79D1FB1F5E16B99592B77A01E2A0FDFB0D01794368D9A56117F7B38669522DD4B650CF789EEBF068C5D139732F0905622C04B2BAAE7600303EE73001A3Dn
        }
        let result = uv2xy(c, point);
        expect(result.x).toStrictEqual(c.CURVE.Gx);
        expect(result.y).toStrictEqual(c.CURVE.Gy);
    })

    test("(x,y) -> (u,v)", () => {
        let point = {
            x: c.CURVE.Gx,
            y: c.CURVE.Gy
        }
        let result = xy2uv(c, point);
        expect(result.x).toStrictEqual(0x12n);
        expect(result.y).toStrictEqual(0x469AF79D1FB1F5E16B99592B77A01E2A0FDFB0D01794368D9A56117F7B38669522DD4B650CF789EEBF068C5D139732F0905622C04B2BAAE7600303EE73001A3Dn);
    })
})