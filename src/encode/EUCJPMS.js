/**
 * The script is part of Mojix.
 *
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 *
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import SJIS from "./SJIS.js";
import CP932 from "./CP932.js";

/**
 * eucJP-ms の変換マップ作成用クラス
 * @ignore
 */
class EUCJPMSMAP {
	/**
	 * 変換マップを初期化
	 */
	static init() {
		if (EUCJPMSMAP.is_initmap) {
			return;
		}
		EUCJPMSMAP.is_initmap = true;

		/**
		 * 変換マップ
		 * CP932のIBM拡張文字の一部は、eucJP-msのG3の83区から84区に配列されている。
		 * @type {Object<number, number>}
		 */
		// prettier-ignore
		const eucjpms_to_cp932_map = {
			0xF3F3: 0xFA40, 0xF3F4: 0xFA41, 0xF3F5: 0xFA42, 0xF3F6: 0xFA43, 0xF3F7: 0xFA44,
			0xF3F8: 0xFA45, 0xF3F9: 0xFA46, 0xF3FA: 0xFA47, 0xF3FB: 0xFA48, 0xF3FC: 0xFA49, 0xF3FD: 0x8754, 0xF3FE: 0x8755,
			0xF4A1: 0x8756, 0xF4A2: 0x8757, 0xF4A3: 0x8758, 0xF4A4: 0x8759, 0xF4A5: 0x875A, 0xF4A6: 0x875B, 0xF4A7: 0x875C,
			0xF4A8: 0x875D, 0xF4A9: 0xFA56, 0xF4AA: 0xFA57, 0xF4AB: 0x878A, 0xF4AC: 0x8782, 0xF4AD: 0x8784, 0xF4AE: 0xFA62, 0xF4AF: 0xFA6A,
			0xF4B0: 0xFA7C, 0xF4B1: 0xFA83, 0xF4B2: 0xFA8A, 0xF4B3: 0xFA8B, 0xF4B4: 0xFA90, 0xF4B5: 0xFA92, 0xF4B6: 0xFA96, 0xF4B7: 0xFA9B,
			0xF4B8: 0xFA9C, 0xF4B9: 0xFA9D, 0xF4BA: 0xFAAA, 0xF4BB: 0xFAAE, 0xF4BC: 0xFAB0, 0xF4BD: 0xFAB1, 0xF4BE: 0xFABA, 0xF4BF: 0xFABD,
			0xF4C0: 0xFAC1, 0xF4C1: 0xFACD, 0xF4C2: 0xFAD0, 0xF4C3: 0xFAD5, 0xF4C4: 0xFAD8, 0xF4C5: 0xFAE0, 0xF4C6: 0xFAE5, 0xF4C7: 0xFAE8,
			0xF4C8: 0xFAEA, 0xF4C9: 0xFAEE, 0xF4CA: 0xFAF2, 0xF4CB: 0xFB43, 0xF4CC: 0xFB44, 0xF4CD: 0xFB50, 0xF4CE: 0xFB58, 0xF4CF: 0xFB5E,
			0xF4D0: 0xFB6E, 0xF4D1: 0xFB70, 0xF4D2: 0xFB72, 0xF4D3: 0xFB75, 0xF4D4: 0xFB7C, 0xF4D5: 0xFB7D, 0xF4D6: 0xFB7E, 0xF4D7: 0xFB80,
			0xF4D8: 0xFB82, 0xF4D9: 0xFB85, 0xF4DA: 0xFB86, 0xF4DB: 0xFB89, 0xF4DC: 0xFB8D, 0xF4DD: 0xFB8E, 0xF4DE: 0xFB92, 0xF4DF: 0xFB94,
			0xF4E0: 0xFB9D, 0xF4E1: 0xFB9E, 0xF4E2: 0xFB9F, 0xF4E3: 0xFBA0, 0xF4E4: 0xFBA1, 0xF4E5: 0xFBA9, 0xF4E6: 0xFBAC, 0xF4E7: 0xFBAE,
			0xF4E8: 0xFBB0, 0xF4E9: 0xFBB1, 0xF4EA: 0xFBB3, 0xF4EB: 0xFBB4, 0xF4EC: 0xFBB6, 0xF4ED: 0xFBB7, 0xF4EE: 0xFBB8, 0xF4EF: 0xFBD3,
			0xF4F0: 0xFBDA, 0xF4F1: 0xFBE8, 0xF4F2: 0xFBE9, 0xF4F3: 0xFBEA, 0xF4F4: 0xFBEE, 0xF4F5: 0xFBF0, 0xF4F6: 0xFBF2, 0xF4F7: 0xFBF6,
			0xF4F8: 0xFBF7, 0xF4F9: 0xFBF9, 0xF4FA: 0xFBFA, 0xF4FB: 0xFBFC, 0xF4FC: 0xFC42, 0xF4FD: 0xFC49, 0xF4FE: 0xFC4B
		};

		/**
		 * @type {Object<number, number>}
		 */
		const cp932_to_eucjpms_map = {};

		for (const key in eucjpms_to_cp932_map) {
			const x = eucjpms_to_cp932_map[key];
			cp932_to_eucjpms_map[x] = parseInt(key, 10);
		}

		EUCJPMSMAP.cp932_to_eucjpms_map = cp932_to_eucjpms_map;
		EUCJPMSMAP.eucjpms_to_cp932_map = eucjpms_to_cp932_map;
	}

	/**
	 * @returns {Object<number, number>}
	 */
	static CP932_TO_EUCJPMS() {
		EUCJPMSMAP.init();
		return EUCJPMSMAP.cp932_to_eucjpms_map;
	}

	/**
	 * @returns {Object<number, number>}
	 */
	static EUCJPMS_TO_CP932() {
		EUCJPMSMAP.init();
		return EUCJPMSMAP.eucjpms_to_cp932_map;
	}
}

/**
 * 変換マップを初期化したかどうか
 * @type {boolean}
 */
EUCJPMSMAP.is_initmap = false;

/**
 * 変換用マップ
 * @type {Object<number, number>}
 */
EUCJPMSMAP.cp932_to_eucjpms_map = null;

/**
 * 変換用マップ
 * @type {Object<number, number>}
 */
EUCJPMSMAP.eucjpms_to_cp932_map = null;

/**
 * eucJP-ms を扱うクラス
 * @ignore
 */
export default class EUCJPMS {
	/**
	 * 文字列を eucJP-ms のバイナリ配列に変換。変換できない文字は "?" に変換される。
	 * - 日本語文字は2バイトとして、配列も2つ分、使用します。
	 * @param {String} text - 変換したいテキスト
	 * @returns {Array<number>} eucJP-ms のデータが入ったバイナリ配列
	 */
	static toEUCJPMSBinary(text) {
		const sjis_array = CP932.toCP932Array(text);
		const bin = [];
		const map = EUCJPMSMAP.CP932_TO_EUCJPMS();
		// prettier-ignore
		const SS2 = 0x8E; // C1制御文字 シングルシフト2
		// prettier-ignore
		const SS3 = 0x8F; // C1制御文字 シングルシフト3
		for (let i = 0; i < sjis_array.length; i++) {
			const code = sjis_array[i];
			const kuten = SJIS.toKuTenFromSJISCode(code);
			// prettier-ignore
			if (code < 0x80) {
				// G0 ASCII
				bin.push(code);
				// prettier-ignore
			} else if (code < 0xE0) {
				// G2 半角カタカナ
				bin.push(SS2);
				bin.push(code);
			} else {
				const eucjpms_code = map[code];
				if (!eucjpms_code) {
					// G1
					// prettier-ignore
					bin.push(kuten.ku + 0xA0);
					// prettier-ignore
					bin.push(kuten.ten + 0xA0);
				} else {
					// シングルシフト SS3 で G3 を呼び出す。
					// G3 は、eucJP-ms の場合 IBM拡張文字 を表す。
					bin.push(SS3);
					bin.push(eucjpms_code >> 8);
					bin.push(eucjpms_code & 0xFF);
				}
			}
		}
		return bin;
	}

	/**
	 * eucJP-ms の配列から文字列に変換
	 * @param {Array<number>} eucjp - 変換したいテキスト
	 * @returns {String} 変換後のテキスト
	 */
	static fromEUCJPMSBinary(eucjp) {
		const sjis_array = [];
		const ng = "?".charCodeAt(0);
		const map = EUCJPMSMAP.EUCJPMS_TO_CP932();
		// prettier-ignore
		const SS2 = 0x8E; // C1制御文字 シングルシフト2
		// prettier-ignore
		const SS3 = 0x8F; // C1制御文字 シングルシフト3
		for (let i = 0; i < eucjp.length; i++) {
			let x1, x2;
			x1 = eucjp[i];
			// ASCII
			// prettier-ignore
			if (x1 < 0x80) {
				sjis_array.push(x1);
				continue;
			}
			if (i >= eucjp.length - 1) {
				// 文字が足りない
				break;
			}
			{
				// 3バイト読み込み(G3)
				if (x1 === SS3) {
					// 文字が足りない
					if (i >= eucjp.length - 2) {
						break;
					}
					x1 = eucjp[i + 1];
					x2 = eucjp[i + 2];
					// シングルシフト SS3 で G3 を呼び出す。
					// G3 は、eucJP-ms の場合 IBM拡張文字 を表す。
					const nec_code = map[(x1 << 8) | x2];
					if (nec_code) {
						sjis_array.push(nec_code);
					} else {
						sjis_array.push(ng);
					}
					i += 2;
					continue;
				}
				// 2バイト読み込み
				else {
					x2 = eucjp[i + 1];
					i += 1;
				}
			}
			// 半角カタカナ
			if (x1 === SS2) {
				sjis_array.push(x2);
				continue;
			}

			// 日本語
			// prettier-ignore
			if (0xA1 <= x1 && x1 <= 0xFE && 0xA1 <= x2 && x2 <= 0xFE) {
				// prettier-ignore
				const kuten = {
					ku: x1 - 0xA0,
					ten: x2 - 0xA0
				};
				sjis_array.push(SJIS.toSJISCodeFromKuTen(kuten));
			} else {
				sjis_array.push(ng);
			}
		}
		return CP932.fromCP932Array(sjis_array);
	}
}
