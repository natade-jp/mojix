import Encode from "./Encode.js";

/* eslint-disable */

/**
 * @param {Array} x
 * @param {Array} y
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
	const text = "aあ①圡0𠮷";
	// prettier-ignore
	const utf_8			=                   [ 0x61, 0xE3, 0x81, 0x82, 0xE2, 0x91, 0xA0, 0xE5, 0x9C, 0xA1, 0x30, 0xF0, 0xA0, 0xAE, 0xB7];
	// prettier-ignore
	const utf_8_bom		= [ 0xEF, 0xBB, 0xBF, 0x61, 0xE3, 0x81, 0x82, 0xE2, 0x91, 0xA0, 0xE5, 0x9C, 0xA1, 0x30, 0xF0, 0xA0, 0xAE, 0xB7];
	// prettier-ignore
	const utf_16be		=             [ 0x00, 0x61, 0x30, 0x42, 0x24, 0x60, 0x57, 0x21, 0x00, 0x30, 0xD8, 0x42, 0xDF, 0xB7];
	// prettier-ignore
	const utf_16be_bom	= [ 0xFE, 0xFF, 0x00, 0x61, 0x30, 0x42, 0x24, 0x60, 0x57, 0x21, 0x00, 0x30, 0xD8, 0x42, 0xDF, 0xB7];
	// prettier-ignore
	const utf_16le		=             [ 0x61, 0x00, 0x42, 0x30, 0x60, 0x24, 0x21, 0x57, 0x30, 0x00, 0x42, 0xD8, 0xB7, 0xDF];
	// prettier-ignore
	const utf_16le_bom	= [ 0xFF, 0xFE, 0x61, 0x00, 0x42, 0x30, 0x60, 0x24, 0x21, 0x57, 0x30, 0x00, 0x42, 0xD8, 0xB7, 0xDF];
	// prettier-ignore
	const utf_32be		=                         [ 0x00, 0x00, 0x00, 0x61, 0x00, 0x00, 0x30, 0x42, 0x00, 0x00, 0x24, 0x60, 0x00, 0x00, 0x57, 0x21, 0x00, 0x00, 0x00, 0x30, 0x00, 0x02, 0x0B, 0xB7 ];
	// prettier-ignore
	const utf_32be_bom	= [ 0x00, 0x00, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x61, 0x00, 0x00, 0x30, 0x42, 0x00, 0x00, 0x24, 0x60, 0x00, 0x00, 0x57, 0x21, 0x00, 0x00, 0x00, 0x30, 0x00, 0x02, 0x0B, 0xB7 ];
	// prettier-ignore
	const utf_32le		=                         [ 0x61, 0x00, 0x00, 0x00, 0x42, 0x30, 0x00, 0x00, 0x60, 0x24, 0x00, 0x00, 0x21, 0x57, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00, 0xB7, 0x0B, 0x02, 0x00 ];
	// prettier-ignore
	const utf_32le_bom	= [ 0xFF, 0xFE, 0x00, 0x00, 0x61, 0x00, 0x00, 0x00, 0x42, 0x30, 0x00, 0x00, 0x60, 0x24, 0x00, 0x00, 0x21, 0x57, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00, 0xB7, 0x0B, 0x02, 0x00 ];

	// prettier-ignore
	test("encode 1-1", () => {expect(equalsArray(Encode.encode(text, "utf-8"), utf_8_bom)).toBe(true);});
	// prettier-ignore
	test("encode 1-2", () => {expect(equalsArray(Encode.encode(text, "utf-8", false), utf_8)).toBe(true);});
	// prettier-ignore
	test("encode 1-3", () => {expect(equalsArray(Encode.encode(text, "utf-16le", false), utf_16le)).toBe(true);});
	// prettier-ignore
	test("encode 1-4", () => {expect(equalsArray(Encode.encode(text, "utf-16be", false), utf_16be)).toBe(true);});
	// prettier-ignore
	test("encode 1-5", () => {expect(equalsArray(Encode.encode(text, "utf-32le", false), utf_32le)).toBe(true);});
	// prettier-ignore
	test("encode 1-6", () => {expect(equalsArray(Encode.encode(text, "utf-32be", false), utf_32be)).toBe(true);});

	// prettier-ignore
	test("decode 1-1", () => {expect(Encode.decode(utf_8_bom)).toBe(text);});
	// prettier-ignore
	test("decode 1-2", () => {expect(Encode.decode(utf_16be_bom)).toBe(text);});
	// prettier-ignore
	test("decode 1-3", () => {expect(Encode.decode(utf_16le_bom)).toBe(text);});
	// prettier-ignore
	test("decode 1-4", () => {expect(Encode.decode(utf_32be_bom)).toBe(text);});
	// prettier-ignore
	test("decode 1-5", () => {expect(Encode.decode(utf_32le_bom)).toBe(text);});
	// prettier-ignore
	test("decode 1-6", () => {expect(Encode.decode([0x61, 0x62])).toBe("ab");});
	// prettier-ignore
	test("decode 1-7", () => {expect(Encode.decode(utf_16be, "utf-16be")).toBe(text);});
}

{
	const text = "ABCあいう高髙①";
	// prettier-ignore
	const cp932 = [0x41, 0x42, 0x43, 0x82, 0xA0, 0x82, 0xA2, 0x82, 0xA4, 0x8D, 0x82, 0xFB, 0xFC, 0x87, 0x40];
	// prettier-ignore
	test("encode 2-1", () => {expect(equalsArray(Encode.encode(text, "Windows-31J"), cp932)).toBe(true);});
	// prettier-ignore
	test("decode 2-1", () => {expect(Encode.decode(cp932, "Windows-31J")).toBe(text);});
	// prettier-ignore
	test("decode 2-2", () => {expect(Encode.decode(cp932)).toBe(text);});
}

{
	const text = "圡①靁謹𪘂麵";
	// prettier-ignore
	const sjis2004	= [0x88, 0x62, 0x87, 0x40, 0xFB, 0x9A, 0xEE, 0xAE, 0xFC, 0xEE, 0xEF, 0xEE];
	// prettier-ignore
	test("encode 3-1", () => {expect(equalsArray(Encode.encode(text, "SJIS-2004"), sjis2004)).toBe(true);});
	// prettier-ignore
	test("decode 3-1", () => {expect(Encode.decode(sjis2004, "SJIS-2004")).toBe(text);});
}

{
	const text = "ぐ髙園aｱ⑯";
	// prettier-ignore
	const eucjp	= [0xA4, 0xB0, 0x8F, 0xF4, 0xFB, 0xB1, 0xE0, 0x61, 0x8E, 0xB1, 0xAD, 0xB0];
	// prettier-ignore
	test("encode 4-1", () => {expect(equalsArray(Encode.encode(text, "eucJP-ms"), eucjp)).toBe(true);});
	// prettier-ignore
	test("decode 4-1", () => {expect(Encode.decode(eucjp, "eucJP-ms")).toBe(text);});
}

{
	const text = "ぐ園aｱ⑯";
	// prettier-ignore
	const eucjp	= [0xA4, 0xB0, 0xB1, 0xE0, 0x61, 0x8E, 0xB1, 0xAD, 0xB0];
	// prettier-ignore
	test("encode 5-1", () => {expect(equalsArray(Encode.encode(text, "EUC-JP"), eucjp)).toBe(true);});
	// prettier-ignore
	test("decode 5-1", () => {expect(Encode.decode(eucjp, "EUC-JP")).toBe(text);});
}

{
	const text = "謹𪘂麵";
	// prettier-ignore
	const eucjis2004 = [0xFC, 0xB0, 0x8F, 0xFE, 0xF0, 0xFE, 0xF0];
	// prettier-ignore
	test("encode 6-1", () => {expect(equalsArray(Encode.encode(text, "EUC-JIS-2004"), eucjis2004)).toBe(true);});
	// prettier-ignore
	test("decode 6-1", () => {expect(Encode.decode(eucjis2004, "EUC-JIS-2004")).toBe(text);});
	// prettier-ignore
	test("decode 6-2", () => {expect(Encode.decode(eucjis2004)).toBe(text);});
}
