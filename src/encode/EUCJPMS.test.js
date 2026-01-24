import EUCJPMS from "./EUCJPMS.js";

/**
 * @param {number[]} x
 * @param {number[]} y
 * @returns {boolean}
 */
const equalsArray = function (x, y) {
	if (x.length !== y.length) {
		return false;
	}
	for (let i = 0; i < x.length; i++) {
		if (x[i] !== y[i]) {
			return false;
		}
	}
	return true;
};

{
	const text = "ぐ髙園aｱ⑯";
	// prettier-ignore
	const eucjp	= [0xA4, 0xB0, 0x8F, 0xF4, 0xFB, 0xB1, 0xE0, 0x61, 0x8E, 0xB1, 0xAD, 0xB0];
	// prettier-ignore
	test("toEUCJPBinary", () => { expect(equalsArray(EUCJPMS.toEUCJPMSBinary(text), eucjp)).toBe(true); });
	// prettier-ignore
	test("fromEUCJPBinary", () => { expect(EUCJPMS.fromEUCJPMSBinary(eucjp)).toBe(text); });
}
