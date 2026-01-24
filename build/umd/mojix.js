(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.mojix = factory());
})(this, (function () { 'use strict';

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * 制御文字マップ
	 * @type {Record<number, string>}
	 * @ignore
	 */
	let control_charcter_map = null;

	/**
	 * コードポイントからUnicodeのブロック名に変換する
	 * @type {(codepoint: number) => (string)}
	 * @ignore
	 */
	let toBlockNameFromUnicode = null;

	/**
	 * コードポイントから異体字セレクタの判定をする
	 * @type {(codepoint: number, annotate?: boolean) => (string|null)}
	 * @ignore
	 */
	let getVariationSelectorsnumberFromCodePoint = null;

	/**
	 * コードポイントからタグ文字の判定をする
	 * @type {(codepoint: number) => (string|null)}
	 * @ignore
	 */
	let getTagCharacterFromCodePoint = null;

	/**
	 * Unicode を扱うクラス
	 * @ignore
	 */
	class Unicode {
		/**
		 * 初期化
		 */
		static init() {
			if (Unicode.is_initmap) {
				return;
			}
			Unicode.is_initmap = true;

			/**
			 * 制御文字、VS、タグ文字は多いため含めていない
			 */
			// prettier-ignore
			control_charcter_map = {
				// --- C0 control characters (ASCII 0x00–0x1F) ---
				0: "NUL", // Null
				1: "SOH", // Start of Heading
				2: "STX", // Start of Text
				3: "ETX", // End of Text
				4: "EOT", // End of Transmission
				5: "ENQ", // Enquiry
				6: "ACK", // Acknowledge
				7: "BEL", // Bell (beep)

				8: "BS",  // Backspace
				9: "HT",  // Horizontal Tab
				10: "LF",  // Line Feed
				11: "VT",  // Vertical Tab
				12: "FF",  // Form Feed
				13: "CR",  // Carriage Return
				14: "SO",  // Shift Out
				15: "SI",  // Shift In

				16: "DLE", // Data Link Escape
				17: "DC1", // Device Control 1 (XON)
				18: "DC2", // Device Control 2
				19: "DC3", // Device Control 3 (XOFF)
				20: "DC4", // Device Control 4
				21: "NAK", // Negative Acknowledge
				22: "SYN", // Synchronous Idle
				23: "ETB", // End of Transmission Block

				24: "CAN", // Cancel
				25: "EM",  // End of Medium
				26: "SUB", // Substitute
				27: "ESC", // Escape
				28: "FS",  // File Separator
				29: "GS",  // Group Separator
				30: "RS",  // Record Separator
				31: "US",  // Unit Separator

				// --- DEL ---
				127: "DEL", // Delete

				// --- C1 control characters (ISO/IEC 6429, 0x80–0x9F) ---
				128: "PAD", // Padding Character
				129: "HOP", // High Octet Preset
				130: "BPH", // Break Permitted Here
				131: "NBH", // No Break Here
				132: "IND", // Index
				133: "NEL", // Next Line
				134: "SSA", // Start of Selected Area
				135: "ESA", // End of Selected Area
				136: "HTS", // Horizontal Tab Set
				137: "HTJ", // Horizontal Tab with Justification
				138: "VTS", // Vertical Tab Set
				139: "PLD", // Partial Line Down
				140: "PLU", // Partial Line Up
				141: "RI",  // Reverse Index
				142: "SS2", // Single Shift 2
				143: "SS3", // Single Shift 3
				144: "DCS", // Device Control String
				145: "PU1", // Private Use 1
				146: "PU2", // Private Use 2
				147: "STS", // Set Transmit State
				148: "CCH", // Cancel Character
				149: "MW",  // Message Waiting
				150: "SPA", // Start of Protected Area
				151: "EPA", // End of Protected Area
				152: "SOS", // Start of String
				153: "SGCI", // Single Graphic Character Introducer
				154: "SCI", // Single Character Introducer
				155: "CSI", // Control Sequence Introducer
				156: "ST",  // String Terminator
				157: "OSC", // Operating System Command
				158: "PM",  // Privacy Message
				159: "APC", // Application Program Command

				// --- Unicode but制御的に扱われる文字 ---
				160: "NBSP", // No-Break Space（表示は空白だが改行不可）
				173: "SHY",  // Soft Hyphen（通常は表示されない）

				// --- Unicode Interlinear Annotation ---
				65529: "IAA", // Interlinear Annotation Anchor
				65530: "IAS", // Interlinear Annotation Separator
				65531: "IAT", // Interlinear Annotation Terminator

				// Zero Width / Joiner 系（Cf）
				0x200B: "ZWSP",   // ZERO WIDTH SPACE ゼロ幅スペース
				0x200C: "ZWNJ",   // ZERO WIDTH NON-JOINER ゼロ幅非接合子
				0x200D: "ZWJ",    // ZERO WIDTH JOINER ゼロ幅接合子
				0x2060: "WJ",     // WORD JOINER 単語結合子
				0xFEFF: "BOM",    // BYTE ORDER MARK / ZERO WIDTH NO-BREAK SPACE

				// 双方向（BiDi）制御文字
				0x202A: "LRE",    // LEFT-TO-RIGHT EMBEDDING
				0x202B: "RLE",    // RIGHT-TO-LEFT EMBEDDING
				0x202C: "PDF",    // POP DIRECTIONAL FORMATTING
				0x202D: "LRO",    // LEFT-TO-RIGHT OVERRIDE
				0x202E: "RLO",    // RIGHT-TO-LEFT OVERRIDE

				0x2066: "LRI",    // LEFT-TO-RIGHT ISOLATE
				0x2067: "RLI",    // RIGHT-TO-LEFT ISOLATE
				0x2068: "FSI",    // FIRST STRONG ISOLATE
				0x2069: "PDI",    // POP DIRECTIONAL ISOLATE

				// Unicode Noncharacter（検証・防御用途）
				0xFFFE: "NONCHAR_FFFE",
				0xFFFF: "NONCHAR_FFFF"
			};

			// prettier-ignore
			const unicode_blockname_array = [
				"Basic Latin", "Latin-1 Supplement", "Latin Extended-A", "Latin Extended-B", "IPA Extensions", "Spacing Modifier Letters", "Combining Diacritical Marks", "Greek and Coptic", 
				"Cyrillic", "Cyrillic Supplement", "Armenian", "Hebrew", "Arabic", "Syriac", "Arabic Supplement", "Thaana", 
				"NKo", "Samaritan", "Mandaic", "Syriac Supplement", "Arabic Extended-B", "Arabic Extended-A", "Devanagari", "Bengali", 
				"Gurmukhi", "Gujarati", "Oriya", "Tamil", "Telugu", "Kannada", "Malayalam", "Sinhala", 
				"Thai", "Lao", "Tibetan", "Myanmar", "Georgian", "Hangul Jamo", "Ethiopic", "Ethiopic Supplement", 
				"Cherokee", "Unified Canadian Aboriginal Syllabics", "Ogham", "Runic", "Tagalog", "Hanunoo", "Buhid", "Tagbanwa", 
				"Khmer", "Mongolian", "Unified Canadian Aboriginal Syllabics Extended", "Limbu", "Tai Le", "New Tai Lue", "Khmer Symbols", "Buginese", 
				"Tai Tham", "Combining Diacritical Marks Extended", "Balinese", "Sundanese", "Batak", "Lepcha", "Ol Chiki", "Cyrillic Extended-C", 
				"Georgian Extended", "Sundanese Supplement", "Vedic Extensions", "Phonetic Extensions", "Phonetic Extensions Supplement", "Combining Diacritical Marks Supplement", "Latin Extended Additional", "Greek Extended", 
				"General Punctuation", "Superscripts and Subscripts", "Currency Symbols", "Combining Diacritical Marks for Symbols", "Letterlike Symbols", "number Forms", "Arrows", "Mathematical Operators", 
				"Miscellaneous Technical", "Control Pictures", "Optical Character Recognition", "Enclosed Alphanumerics", "Box Drawing", "Block Elements", "Geometric Shapes", "Miscellaneous Symbols", 
				"Dingbats", "Miscellaneous Mathematical Symbols-A", "Supplemental Arrows-A", "Braille Patterns", "Supplemental Arrows-B", "Miscellaneous Mathematical Symbols-B", "Supplemental Mathematical Operators", "Miscellaneous Symbols and Arrows", 
				"Glagolitic", "Latin Extended-C", "Coptic", "Georgian Supplement", "Tifinagh", "Ethiopic Extended", "Cyrillic Extended-A", "Supplemental Punctuation", 
				"CJK Radicals Supplement", "Kangxi Radicals", "Ideographic Description Characters", "CJK Symbols and Punctuation", "Hiragana", "Katakana", "Bopomofo", "Hangul Compatibility Jamo", 
				"Kanbun", "Bopomofo Extended", "CJK Strokes", "Katakana Phonetic Extensions", "Enclosed CJK Letters and Months", "CJK Compatibility", "CJK Unified Ideographs Extension A", "Yijing Hexagram Symbols", 
				"CJK Unified Ideographs", "Yi Syllables", "Yi Radicals", "Lisu", "Vai", "Cyrillic Extended-B", "Bamum", "Modifier Tone Letters", 
				"Latin Extended-D", "Syloti Nagri", "Common Indic number Forms", "Phags-pa", "Saurashtra", "Devanagari Extended", "Kayah Li", "Rejang", 
				"Hangul Jamo Extended-A", "Javanese", "Myanmar Extended-B", "Cham", "Myanmar Extended-A", "Tai Viet", "Meetei Mayek Extensions", "Ethiopic Extended-A", 
				"Latin Extended-E", "Cherokee Supplement", "Meetei Mayek", "Hangul Syllables", "Hangul Jamo Extended-B", "High Surrogates", "High Private Use Surrogates", "Low Surrogates", 
				"Private Use Area", "CJK Compatibility Ideographs", "Alphabetic Presentation Forms", "Arabic Presentation Forms-A", "Variation Selectors", "Vertical Forms", "Combining Half Marks", "CJK Compatibility Forms", 
				"Small Form Variants", "Arabic Presentation Forms-B", "Halfwidth and Fullwidth Forms", "Specials", "Linear B Syllabary", "Linear B Ideograms", "Aegean numbers", "Ancient Greek numbers", 
				"Ancient Symbols", "Phaistos Disc", "Lycian", "Carian", "Coptic Epact numbers", "Old Italic", "Gothic", "Old Permic", 
				"Ugaritic", "Old Persian", "Deseret", "Shavian", "Osmanya", "Osage", "Elbasan", "Caucasian Albanian", 
				"Vithkuqi", "Linear A", "Latin Extended-F", "Cypriot Syllabary", "Imperial Aramaic", "Palmyrene", "Nabataean", "Hatran", 
				"Phoenician", "Lydian", "Meroitic Hieroglyphs", "Meroitic Cursive", "Kharoshthi", "Old South Arabian", "Old North Arabian", "Manichaean", 
				"Avestan", "Inscriptional Parthian", "Inscriptional Pahlavi", "Psalter Pahlavi", "Old Turkic", "Old Hungarian", "Hanifi Rohingya", "Rumi Numeral Symbols", 
				"Yezidi", "Arabic Extended-C", "Old Sogdian", "Sogdian", "Old Uyghur", "Chorasmian", "Elymaic", "Brahmi", 
				"Kaithi", "Sora Sompeng", "Chakma", "Mahajani", "Sharada", "Sinhala Archaic numbers", "Khojki", "Multani", 
				"Khudawadi", "Grantha", "Newa", "Tirhuta", "Siddham", "Modi", "Mongolian Supplement", "Takri", 
				"Ahom", "Dogra", "Warang Citi", "Dives Akuru", "Nandinagari", "Zanabazar Square", "Soyombo", "Unified Canadian Aboriginal Syllabics Extended-A", 
				"Pau Cin Hau", "Devanagari Extended-A", "Bhaiksuki", "Marchen", "Masaram Gondi", "Gunjala Gondi", "Makasar", "Kawi", 
				"Lisu Supplement", "Tamil Supplement", "Cuneiform", "Cuneiform numbers and Punctuation", "Early Dynastic Cuneiform", "Cypro-Minoan", "Egyptian Hieroglyphs", "Egyptian Hieroglyph Format Controls", 
				"Anatolian Hieroglyphs", "Bamum Supplement", "Mro", "Tangsa", "Bassa Vah", "Pahawh Hmong", "Medefaidrin", "Miao", 
				"Ideographic Symbols and Punctuation", "Tangut", "Tangut Components", "Khitan Small Script", "Tangut Supplement", "Kana Extended-B", "Kana Supplement", "Kana Extended-A", 
				"Small Kana Extension", "Nushu", "Duployan", "Shorthand Format Controls", "Znamenny Musical Notation", "Byzantine Musical Symbols", "Musical Symbols", "Ancient Greek Musical Notation", 
				"Kaktovik Numerals", "Mayan Numerals", "Tai Xuan Jing Symbols", "Counting Rod Numerals", "Mathematical Alphanumeric Symbols", "Sutton SignWriting", "Latin Extended-G", "Glagolitic Supplement", 
				"Cyrillic Extended-D", "Nyiakeng Puachue Hmong", "Toto", "Wancho", "Nag Mundari", "Ethiopic Extended-B", "Mende Kikakui", "Adlam", 
				"Indic Siyaq numbers", "Ottoman Siyaq numbers", "Arabic Mathematical Alphabetic Symbols", "Mahjong Tiles", "Domino Tiles", "Playing Cards", "Enclosed Alphanumeric Supplement", "Enclosed Ideographic Supplement", 
				"Miscellaneous Symbols and Pictographs", "Emoticons", "Ornamental Dingbats", "Transport and Map Symbols", "Alchemical Symbols", "Geometric Shapes Extended", "Supplemental Arrows-C", "Supplemental Symbols and Pictographs", 
				"Chess Symbols", "Symbols and Pictographs Extended-A", "Symbols for Legacy Computing", "CJK Unified Ideographs Extension B", "CJK Unified Ideographs Extension C", "CJK Unified Ideographs Extension D", "CJK Unified Ideographs Extension E", "CJK Unified Ideographs Extension F", "CJK Unified Ideographs Extension I", 
				"CJK Compatibility Ideographs Supplement", "CJK Unified Ideographs Extension G", "CJK Unified Ideographs Extension H", "CJK Unified Ideographs Extension J", "Tags", "Variation Selectors Supplement", "Supplementary Private Use Area-A", "Supplementary Private Use Area-B"
			];

			// prettier-ignore
			const unicode_blockaddress_array = [
				0x007F, 0x00FF, 0x017F, 0x024F, 0x02AF, 0x02FF, 0x036F, 0x03FF, 0x04FF, 0x052F, 0x058F, 0x05FF, 0x06FF, 0x074F, 0x077F, 0x07BF,
				0x07FF, 0x083F, 0x085F, 0x086F, 0x089F, 0x08FF, 0x097F, 0x09FF, 0x0A7F, 0x0AFF, 0x0B7F, 0x0BFF, 0x0C7F, 0x0CFF, 0x0D7F, 0x0DFF,
				0x0E7F, 0x0EFF, 0x0FFF, 0x109F, 0x10FF, 0x11FF, 0x137F, 0x139F, 0x13FF, 0x167F, 0x169F, 0x16FF, 0x171F, 0x173F, 0x175F, 0x177F,
				0x17FF, 0x18AF, 0x18FF, 0x194F, 0x197F, 0x19DF, 0x19FF, 0x1A1F, 0x1AAF, 0x1AFF, 0x1B7F, 0x1BBF, 0x1BFF, 0x1C4F, 0x1C7F, 0x1C8F,
				0x1CBF, 0x1CCF, 0x1CFF, 0x1D7F, 0x1DBF, 0x1DFF, 0x1EFF, 0x1FFF, 0x206F, 0x209F, 0x20CF, 0x20FF, 0x214F, 0x218F, 0x21FF, 0x22FF,
				0x23FF, 0x243F, 0x245F, 0x24FF, 0x257F, 0x259F, 0x25FF, 0x26FF, 0x27BF, 0x27EF, 0x27FF, 0x28FF, 0x297F, 0x29FF, 0x2AFF, 0x2BFF,
				0x2C5F, 0x2C7F, 0x2CFF, 0x2D2F, 0x2D7F, 0x2DDF, 0x2DFF, 0x2E7F, 0x2EFF, 0x2FDF, 0x2FFF, 0x303F, 0x309F, 0x30FF, 0x312F, 0x318F,
				0x319F, 0x31BF, 0x31EF, 0x31FF, 0x32FF, 0x33FF, 0x4DBF, 0x4DFF, 0x9FFF, 0xA48F, 0xA4CF, 0xA4FF, 0xA63F, 0xA69F, 0xA6FF, 0xA71F,
				0xA7FF, 0xA82F, 0xA83F, 0xA87F, 0xA8DF, 0xA8FF, 0xA92F, 0xA95F, 0xA97F, 0xA9DF, 0xA9FF, 0xAA5F, 0xAA7F, 0xAADF, 0xAAFF, 0xAB2F,
				0xAB6F, 0xABBF, 0xABFF, 0xD7AF, 0xD7FF, 0xDB7F, 0xDBFF, 0xDFFF, 0xF8FF, 0xFAFF, 0xFB4F, 0xFDFF, 0xFE0F, 0xFE1F, 0xFE2F, 0xFE4F,
				0xFE6F, 0xFEFF, 0xFFEF, 0xFFFF, 0x1007F, 0x100FF, 0x1013F, 0x1018F, 0x101CF, 0x101FF, 0x1029F, 0x102DF, 0x102FF, 0x1032F, 0x1034F, 0x1037F,
				0x1039F, 0x103DF, 0x1044F, 0x1047F, 0x104AF, 0x104FF, 0x1052F, 0x1056F, 0x105BF, 0x1077F, 0x107BF, 0x1083F, 0x1085F, 0x1087F, 0x108AF, 0x108FF,
				0x1091F, 0x1093F, 0x1099F, 0x109FF, 0x10A5F, 0x10A7F, 0x10A9F, 0x10AFF, 0x10B3F, 0x10B5F, 0x10B7F, 0x10BAF, 0x10C4F, 0x10CFF, 0x10D3F, 0x10E7F,
				0x10EBF, 0x10EFF, 0x10F2F, 0x10F6F, 0x10FAF, 0x10FDF, 0x10FFF, 0x1107F, 0x110CF, 0x110FF, 0x1114F, 0x1117F, 0x111DF, 0x111FF, 0x1124F, 0x112AF,
				0x112FF, 0x1137F, 0x1147F, 0x114DF, 0x115FF, 0x1165F, 0x1167F, 0x116CF, 0x1174F, 0x1184F, 0x118FF, 0x1195F, 0x119FF, 0x11A4F, 0x11AAF, 0x11ABF,
				0x11AFF, 0x11B5F, 0x11C6F, 0x11CBF, 0x11D5F, 0x11DAF, 0x11EFF, 0x11F5F, 0x11FBF, 0x11FFF, 0x123FF, 0x1247F, 0x1254F, 0x12FFF, 0x1342F, 0x1345F,
				0x1467F, 0x16A3F, 0x16A6F, 0x16ACF, 0x16AFF, 0x16B8F, 0x16E9F, 0x16F9F, 0x16FFF, 0x187FF, 0x18AFF, 0x18CFF, 0x18D7F, 0x1AFFF, 0x1B0FF, 0x1B12F,
				0x1B16F, 0x1B2FF, 0x1BC9F, 0x1BCAF, 0x1CFCF, 0x1D0FF, 0x1D1FF, 0x1D24F, 0x1D2DF, 0x1D2FF, 0x1D35F, 0x1D37F, 0x1D7FF, 0x1DAAF, 0x1DFFF, 0x1E02F,
				0x1E08F, 0x1E14F, 0x1E2BF, 0x1E2FF, 0x1E4FF, 0x1E7FF, 0x1E8DF, 0x1E95F, 0x1ECBF, 0x1ED4F, 0x1EEFF, 0x1F02F, 0x1F09F, 0x1F0FF, 0x1F1FF, 0x1F2FF,
				0x1F5FF, 0x1F64F, 0x1F67F, 0x1F6FF, 0x1F77F, 0x1F7FF, 0x1F8FF, 0x1F9FF, 0x1FA6F, 0x1FAFF, 0x1FBFF, 0x2A6DF, 0x2B73F, 0x2B81F, 0x2CEAF, 0x2EBEF, 0x2EE5F,
				0x2FA1F, 0x3134F, 0x323AF, 0x3347F, 0xE007F, 0xE01EF, 0xFFFFF, 0x10FFFF
			];

			/**
			 * コードポイントからUnicodeのブロック名に変換する
			 * 変換できない場合は "-" を返す
			 * @param {number} codepoint - コードポイント
			 * @returns {string}
			 */
			toBlockNameFromUnicode = function (codepoint) {
				for (let i = 0; i < unicode_blockname_array.length; i++) {
					if (codepoint <= unicode_blockaddress_array[i]) {
						return unicode_blockname_array[i];
					}
				}
				return "-";
			};

			/**
			 * コードポイントから異体字セレクタの判定
			 * @param {number} codepoint - コードポイント
			 * @param {boolean} [annotate = false] - 注釈をつけるか否か
			 * @returns {string|null} 確認結果(異体字セレクタではない場合はNULLを返す)
			 */
			getVariationSelectorsnumberFromCodePoint = function (codepoint, annotate) {
				// モンゴル自由字形選択子 U+180B〜U+180D (3個)
				// prettier-ignore
				if (0x180B <= codepoint && codepoint <= 0x180D) {
					// prettier-ignore
					return "FVS" + (codepoint - 0x180B + 1);
				}
				// SVSで利用される異体字セレクタ U+FE00〜U+FE0F (VS1～VS16) (16個)
				// prettier-ignore
				if (0xFE00 <= codepoint && codepoint <= 0xFE0F) {
					// prettier-ignore
					const n = codepoint - 0xFE00 + 1;
					if (!annotate) return "VS" + n;
					// prettier-ignore
					if (codepoint === 0xFE0E) return "VS15 (text)";
					// prettier-ignore
					if (codepoint === 0xFE0F) return "VS16 (emoji)";
					return "VS" + n;
				}
				// IVSで利用される異体字セレクタ U+E0100〜U+E01EF (VS17～VS256) (240個)
				// prettier-ignore
				else if (0xE0100 <= codepoint && codepoint <= 0xE01EF) {
					// prettier-ignore
					return "VS" + (codepoint - 0xE0100 + 17);
				}
				return null;
			};

			/**
			 * コードポイントからタグ文字の判定
			 * @param {number} codepoint - コードポイント
			 * @returns {string|null} 確認結果(タグ文字ではない場合はNULLを返す)
			 */
			getTagCharacterFromCodePoint = function (codepoint) {
				// TAG characters U+E0020..U+E007F
				// prettier-ignore
				if (0xE0020 <= codepoint && codepoint <= 0xE007F) {
					// CANCEL TAG
					// prettier-ignore
					if (codepoint === 0xE007F) {
						return "CANCEL_TAG";
					}
					// TAG_20..TAG_7E のように返す
					// prettier-ignore
					const ascii = codepoint - 0xE0000; // 0x20..0x7E
					return "TAG_" + ascii.toString(16).toUpperCase().padStart(2, "0");
				}
				return null;
			};
		}

		/**
		 * 上位のサロゲートペアの判定
		 * @param {string} text - 対象テキスト
		 * @param {number} index - インデックス
		 * @returns {boolean} 確認結果
		 */
		static isHighSurrogateAt(text, index) {
			const ch = text.charCodeAt(index);
			// prettier-ignore
			return 0xD800 <= ch && ch <= 0xDBFF;
		}

		/**
		 * 下位のサロゲートペアの判定
		 * @param {string} text - 対象テキスト
		 * @param {number} index - インデックス
		 * @returns {boolean} 確認結果
		 */
		static isLowSurrogateAt(text, index) {
			const ch = text.charCodeAt(index);
			// prettier-ignore
			return 0xDC00 <= ch && ch <= 0xDFFF;
		}

		/**
		 * サロゲートペアの判定
		 * @param {string} text - 対象テキスト
		 * @param {number} index - インデックス
		 * @returns {boolean} 確認結果
		 */
		static isSurrogatePairAt(text, index) {
			const ch = text.charCodeAt(index);
			// prettier-ignore
			return 0xD800 <= ch && ch <= 0xDFFF;
		}

		/**
		 * サロゲートペア対応のコードポイント取得
		 * @param {string} text - 対象テキスト
		 * @param {number} [index = 0] - インデックス
		 * @returns {number} コードポイント
		 */
		static codePointAt(text, index) {
			const index_ = index !== undefined ? index : 0;
			if (Unicode.isHighSurrogateAt(text, index_)) {
				const high = text.charCodeAt(index_);
				const low = text.charCodeAt(index_ + 1);
				// prettier-ignore
				return (((high - 0xD800) << 10) | (low - 0xDC00)) + 0x10000;
			} else {
				return text.charCodeAt(index_);
			}
		}

		/**
		 * インデックスの前にあるコードポイント
		 * @param {string} text - 対象テキスト
		 * @param {number} index - インデックス
		 * @returns {number} コードポイント
		 */
		static codePointBefore(text, index) {
			if (!Unicode.isLowSurrogateAt(text, index - 1)) {
				return text.charCodeAt(index - 1);
			} else {
				return text.codePointAt(index - 2);
			}
		}

		/**
		 * コードポイント換算で文字列数をカウント
		 * @param {string} text - 対象テキスト
		 * @param {number} [beginIndex=0] - 最初のインデックス（省略可）
		 * @param {number} [endIndex] - 最後のインデックス（ここは含めない）（省略可）
		 * @returns {number} 文字数
		 */
		static codePointCount(text, beginIndex, endIndex) {
			if (beginIndex === undefined) {
				beginIndex = 0;
			}
			if (endIndex === undefined) {
				endIndex = text.length;
			}
			let count = 0;
			for (; beginIndex < endIndex; beginIndex++) {
				count++;
				if (Unicode.isSurrogatePairAt(text, beginIndex)) {
					beginIndex++;
				}
			}
			return count;
		}

		/**
		 * コードポイント換算で文字列配列の位置を計算
		 * @param {string} text - 対象テキスト
		 * @param {number} index - オフセット
		 * @param {number} codePointOffset - ずらすコードポイント数
		 * @returns {number} ずらしたインデックス
		 */
		static offsetByCodePoints(text, index, codePointOffset) {
			let count = 0;
			if (codePointOffset === 0) {
				return index;
			}
			if (codePointOffset > 0) {
				for (; index < text.length; index++) {
					count++;
					if (Unicode.isHighSurrogateAt(text, index)) {
						index++;
					}
					if (count === codePointOffset) {
						return index + 1;
					}
				}
			} else {
				codePointOffset = -codePointOffset;
				for (; index >= 0; index--) {
					count++;
					if (Unicode.isLowSurrogateAt(text, index - 1)) {
						index--;
					}
					if (count === codePointOffset) {
						return index - 1;
					}
				}
			}
			throw "error offsetByCodePoints";
		}

		/**
		 * コードポイントの数値データをUTF16の配列に変換
		 * @param {...(number|number[])} codepoint - 変換したいUTF-32の配列、又はコードポイントを並べた可変引数
		 * @returns {number[]} 変換後のテキスト
		 */
		static toUTF16ArrayFromCodePoint() {
			/**
			 * @type {number[]}
			 */
			const utf16_array = [];
			/**
			 * @type {number[]}
			 */
			let codepoint_array = [];
			if (arguments[0].length) {
				codepoint_array = arguments[0];
			} else {
				for (let i = 0; i < arguments.length; i++) {
					codepoint_array[i] = arguments[i];
				}
			}
			for (let i = 0; i < codepoint_array.length; i++) {
				const codepoint = codepoint_array[i];
				if (0x10000 <= codepoint) {
					// prettier-ignore
					const high = ((codepoint - 0x10000) >> 10) + 0xD800;
					// prettier-ignore
					const low = (codepoint & 0x3FF) + 0xDC00;
					utf16_array.push(high);
					utf16_array.push(low);
				} else {
					utf16_array.push(codepoint);
				}
			}
			return utf16_array;
		}

		/**
		 * コードポイントの数値データを文字列に変換
		 * @param {...(number|number[])} codepoint - 変換したいコードポイントの数値配列、又は数値を並べた可変引数
		 * @returns {string} 変換後のテキスト
		 */
		static fromCodePoint(codepoint) {
			let utf16_array = null;
			if (codepoint instanceof Array) {
				utf16_array = Unicode.toUTF16ArrayFromCodePoint(codepoint);
			} else {
				const codepoint_array = [];
				for (let i = 0; i < arguments.length; i++) {
					codepoint_array[i] = arguments[i];
				}
				utf16_array = Unicode.toUTF16ArrayFromCodePoint(codepoint_array);
			}
			const text = [];
			for (let i = 0; i < utf16_array.length; i++) {
				text[text.length] = String.fromCharCode(utf16_array[i]);
			}
			return text.join("");
		}

		/**
		 * 文字列をUTF32(コードポイント)の配列に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} UTF32(コードポイント)のデータが入った配列
		 */
		static toUTF32Array(text) {
			const utf32 = [];
			for (let i = 0; i < text.length; i = Unicode.offsetByCodePoints(text, i, 1)) {
				utf32.push(Unicode.codePointAt(text, i));
			}
			return utf32;
		}

		/**
		 * UTF32の配列から文字列に変換
		 * @param {number[]} utf32 - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromUTF32Array(utf32) {
			return Unicode.fromCodePoint(utf32);
		}

		/**
		 * 文字列をUTF16の配列に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} UTF16のデータが入った配列
		 */
		static toUTF16Array(text) {
			const utf16 = [];
			for (let i = 0; i < text.length; i++) {
				utf16[i] = text.charCodeAt(i);
			}
			return utf16;
		}

		/**
		 * UTF16の配列から文字列に変換
		 * @param {number[]} utf16 - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromUTF16Array(utf16) {
			const text = [];
			for (let i = 0; i < utf16.length; i++) {
				text[i] = String.fromCharCode(utf16[i]);
			}
			return text.join("");
		}

		/**
		 * 文字列をUTF8の配列に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} UTF8のデータが入った配列
		 */
		static toUTF8Array(text) {
			return Unicode.toUTFBinaryFromCodePoint(Unicode.toUTF32Array(text), "utf-8", false);
		}

		/**
		 * UTF8の配列から文字列に変換
		 * @param {number[]} utf8 - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromUTF8Array(utf8) {
			return Unicode.fromCodePoint(Unicode.toCodePointFromUTFBinary(utf8, "utf-8"));
		}

		/**
		 * 指定したテキストを切り出す
		 * - 単位は文字数
		 * @param {string} text - 切り出したいテキスト
		 * @param {number} offset - 切り出し位置
		 * @param {number} size - 切り出す長さ
		 * @returns {string} 切り出したテキスト
		 */
		static cutTextForCodePoint(text, offset, size) {
			const utf32 = Unicode.toUTF32Array(text);
			const cut = [];
			for (let i = 0, point = offset; i < size && point < utf32.length; i++, point++) {
				cut.push(utf32[point]);
			}
			return Unicode.fromUTF32Array(cut);
		}

		/**
		 * UTFのバイナリ配列からバイトオーダーマーク(BOM)を調査する
		 * @param {number[]} utfbinary - 調査するバイナリ配列
		 * @returns {string} 符号化形式(不明時はnull)
		 */
		static getCharsetFromBOM(utfbinary) {
			if (utfbinary.length >= 4) {
				// prettier-ignore
				if (utfbinary[0] === 0x00 && utfbinary[1] === 0x00 && utfbinary[2] === 0xFE && utfbinary[3] === 0xFF) {
					return "UTF-32BE";
				}
				// prettier-ignore
				if (utfbinary[0] === 0xFF && utfbinary[1] === 0xFE && utfbinary[2] === 0x00 && utfbinary[3] === 0x00) {
					return "UTF-32LE";
				}
			}
			if (utfbinary.length >= 3) {
				// prettier-ignore
				if (utfbinary[0] === 0xEF && utfbinary[1] === 0xBB && utfbinary[2] === 0xBF) {
					return "UTF-8";
				}
			}
			if (utfbinary.length >= 2) {
				// prettier-ignore
				if (utfbinary[0] === 0xFE && utfbinary[1] === 0xFF) {
					return "UTF-16BE";
				}
				// prettier-ignore
				if (utfbinary[0] === 0xFF && utfbinary[1] === 0xFE) {
					return "UTF-16LE";
				}
			}
			return null;
		}

		/**
		 * UTFのバイナリ配列からコードポイントに変換
		 * @param {number[]} binary - 変換したいバイナリ配列
		 * @param {string} [charset] - UTFの種類（省略した場合はBOM付きを期待する）
		 * @returns {number[]} コードポイントの配列(失敗時はnull)
		 */
		static toCodePointFromUTFBinary(binary, charset) {
			const utf32_array = [];
			let check_charset = charset;
			let offset = 0;
			// バイトオーダーマーク(BOM)がある場合は BOM を優先
			const charset_for_bom = Unicode.getCharsetFromBOM(binary);
			if (charset_for_bom) {
				check_charset = charset_for_bom;
				if (/utf-?8/i.test(charset_for_bom)) {
					offset = 3;
				} else if (/utf-?16/i.test(charset_for_bom)) {
					offset = 2;
				} else if (/utf-?32/i.test(charset_for_bom)) {
					offset = 4;
				}
			}
			// BOM付きではない＋指定もしていないので変換失敗
			if (!charset_for_bom && !charset) {
				return null;
			}
			// UTF-8
			if (/utf-?8n?/i.test(check_charset)) {
				let size = 0;
				let write = 0;
				for (let i = offset; i < binary.length; i++) {
					const bin = binary[i];
					if (size === 0) {
						if (bin < 0x80) {
							utf32_array.push(bin);
							// prettier-ignore
						} else if (bin < 0xE0) {
							size = 1;
							// prettier-ignore
							write = bin & 0x1F; // 0001 1111
							// prettier-ignore
						} else if (bin < 0xF0) {
							size = 2;
							// prettier-ignore
							write = bin & 0xF; // 0000 1111
						} else {
							size = 3;
							// prettier-ignore
							write = bin & 0x7; // 0000 0111
						}
					} else {
						write <<= 6;
						// prettier-ignore
						write |= bin & 0x3F; // 0011 1111
						size--;
						if (size === 0) {
							utf32_array.push(write);
						}
					}
				}
				return utf32_array;
			}
			// UTF-16
			else if (/utf-?16/i.test(check_charset)) {
				// UTF-16 につめる
				const utf16 = [];
				// UTF-16BE
				if (/utf-?16(be)/i.test(check_charset)) {
					for (let i = offset; i < binary.length; i += 2) {
						utf16.push((binary[i] << 8) | binary[i + 1]);
					}
				}
				// UTF-16LE
				else if (/utf-?16(le)?/i.test(check_charset)) {
					for (let i = offset; i < binary.length; i += 2) {
						utf16.push(binary[i] | (binary[i + 1] << 8));
					}
				}
				// UTF-32 につめる
				for (let i = 0; i < utf16.length; i++) {
					// prettier-ignore
					if (0xD800 <= utf16[i] && utf16[i] <= 0xDBFF) {
						if (i + 2 <= utf16.length) {
							const high = utf16[i];
							const low = utf16[i + 1];
							// prettier-ignore
							utf32_array.push((((high - 0xD800) << 10) | (low - 0xDC00)) + 0x10000);
						}
						i++;
					} else {
						utf32_array.push(utf16[i]);
					}
				}
				return utf32_array;
			}
			// UTF-32
			else {
				// UTF-32BE
				if (/utf-?32(be)/i.test(check_charset)) {
					for (let i = offset; i < binary.length; i += 4) {
						utf32_array.push((binary[i] << 24) | (binary[i + 1] << 16) | (binary[i + 2] << 8) | binary[i + 3]);
					}
					return utf32_array;
				}
				// UTF-32LE
				else if (/utf-?32(le)?/i.test(check_charset)) {
					for (let i = offset; i < binary.length; i += 4) {
						utf32_array.push(binary[i] | (binary[i + 1] << 8) | (binary[i + 2] << 16) | (binary[i + 3] << 24));
					}
					return utf32_array;
				}
			}
			return null;
		}

		/**
		 * UTF32配列からバイナリ配列に変換
		 * @param {number[]} utf32_array - 変換したいUTF-32配列
		 * @param {string} charset - UTFの種類
		 * @param {boolean} [is_with_bom=true] - BOMをつけるかどうか
		 * @returns {number[]} バイナリ配列(失敗時はnull)
		 */
		static toUTFBinaryFromCodePoint(utf32_array, charset, is_with_bom) {
			let is_with_bom_ = is_with_bom !== undefined ? is_with_bom : true;
			// charset に" with BOM" が入っている場合はBOM付きとする
			if (/\s+with\s+bom$/i.test(charset)) {
				is_with_bom_ = true;
			}
			/**
			 * @type {number[]}
			 */
			const binary = [];
			// UTF-8
			if (/utf-?8n?/i.test(charset)) {
				// bom をつける
				if (is_with_bom_) {
					// prettier-ignore
					binary.push(0xEF);
					// prettier-ignore
					binary.push(0xBB);
					// prettier-ignore
					binary.push(0xBF);
				}
				for (let i = 0; i < utf32_array.length; i++) {
					let codepoint = utf32_array[i];
					// 1バイト文字
					if (codepoint <= 0x7F) {
						binary.push(codepoint);
						continue;
					}
					const buffer = [];
					let size = 0;
					// 2バイト以上
					if (codepoint < 0x800) {
						size = 2;
					} else if (codepoint < 0x10000) {
						size = 3;
					} else {
						size = 4;
					}
					for (let j = 0; j < size; j++) {
						let write = codepoint & ((1 << 6) - 1);
						if (j === size - 1) {
							if (size === 2) {
								// prettier-ignore
								write |= 0xC0; // 1100 0000
							} else if (size === 3) {
								// prettier-ignore
								write |= 0xE0; // 1110 0000
							} else {
								// prettier-ignore
								write |= 0xF0; // 1111 0000
							}
							buffer.push(write);
							break;
						}
						buffer.push(write | 0x80); // 1000 0000
						codepoint = codepoint >> 6;
					}
					// 反転
					for (let j = buffer.length - 1; j >= 0; j--) {
						binary.push(buffer[j]);
					}
				}
				return binary;
			}
			// UTF-16
			else if (/utf-?16/i.test(charset)) {
				// UTF-16 に詰め替える
				const utf16_array = Unicode.toUTF16ArrayFromCodePoint(utf32_array);
				// UTF-16BE
				if (/utf-?16(be)/i.test(charset)) {
					// bom をつける
					if (is_with_bom_) {
						binary.push(0xFE);
						binary.push(0xFF);
					}
					for (let i = 0; i < utf16_array.length; i++) {
						binary.push(utf16_array[i] >> 8);
						binary.push(utf16_array[i] & 0xFF);
					}
				}
				// UTF-16LE
				else if (/utf-?16(le)?/i.test(charset)) {
					// bom をつける
					if (is_with_bom_) {
						binary.push(0xFF);
						binary.push(0xFE);
					}
					for (let i = 0; i < utf16_array.length; i++) {
						binary.push(utf16_array[i] & 0xFF);
						binary.push(utf16_array[i] >> 8);
					}
				}
				return binary;
			}
			// UTF-32
			else if (/utf-?32/i.test(charset)) {
				// UTF-32BE
				if (/utf-?32(be)/i.test(charset)) {
					// bom をつける
					if (is_with_bom_) {
						binary.push(0x00);
						binary.push(0x00);
						binary.push(0xFE);
						binary.push(0xFF);
					}
					for (let i = 0; i < utf32_array.length; i++) {
						binary.push((utf32_array[i] >> 24) & 0xFF);
						binary.push((utf32_array[i] >> 16) & 0xFF);
						binary.push((utf32_array[i] >> 8) & 0xFF);
						binary.push(utf32_array[i] & 0xFF);
					}
				}
				// UTF-32LE
				else if (/utf-?32(le)?/i.test(charset)) {
					// bom をつける
					if (is_with_bom_) {
						binary.push(0xFF);
						binary.push(0xFE);
						binary.push(0x00);
						binary.push(0x00);
					}
					for (let i = 0; i < utf32_array.length; i++) {
						binary.push(utf32_array[i] & 0xFF);
						binary.push((utf32_array[i] >> 8) & 0xFF);
						binary.push((utf32_array[i] >> 16) & 0xFF);
						binary.push((utf32_array[i] >> 24) & 0xFF);
					}
				}
				return binary;
			}
			return null;
		}

		/**
		 * コードポイントからUnicodeのブロック名に変換する
		 * 変換できない場合は "-" を返す
		 * @param {number} codepoint - コードポイント
		 * @returns {string}
		 */
		static toBlockNameFromUnicode(codepoint) {
			Unicode.init();
			return toBlockNameFromUnicode(codepoint);
		}

		/**
		 * コードポイントから制御文字名に変換する
		 * 変換できない場合は null を返す
		 * @param {number} codepoint - コードポイント
		 * @returns {string}
		 */
		static toControlCharcterName(codepoint) {
			Unicode.init();

			// 異体字セレクタの確認を行い、異体字セレクタ用の制御文字(FVS, VSx)を返す
			const info_variation_selectors_number = getVariationSelectorsnumberFromCodePoint(codepoint);
			if (info_variation_selectors_number !== null) {
				return info_variation_selectors_number;
			}
			// タグ文字の確認を行い、タグ文字用の制御文字(TAG_xx)を返す
			const info_tag_character = getTagCharacterFromCodePoint(codepoint);
			if (info_tag_character !== null) {
				return info_tag_character;
			}
			// その他の制御文字の確認を行う
			const name = control_charcter_map[codepoint];
			return name ? name : null;
		}

		/**
		 * コードポイントからグラフェム（見た目の1文字）を構成する文字の判定
		 *
		 * 含まれるもの:
		 * - 結合文字 (Mn / Mc / Me ※VS除外)
		 * - 異体字セレクタ (VS / IVS / FVS)
		 * - スキントーン修飾子（EMOJI MODIFIER FITZPATRICK）
		 * - タグ文字（TAG CHARACTER）
		 * - ゼロ幅接合子
		 *
		 * @param {number} codepoint - コードポイント
		 * @returns {boolean} 確認結果
		 */
		static isGraphemeComponentFromCodePoint(codepoint) {
			// prettier-ignore
			return (
				Unicode.isCombiningMarkFromCodePoint(codepoint) || // 結合文字
				Unicode.isVariationSelectorFromCodePoint(codepoint) || // 異体字セレクタ
				Unicode.isEmojiModifierFromCodePoint(codepoint) || // スキントーン修飾子
				Unicode.isTagCharacterFromCodePoint(codepoint) || // タグ文字
				codepoint === 0x200D // ZWJ (ZERO WIDTH JOINER) ゼロ幅接合子
			);
		}

		/**
		 * コードポイントから「表示上の横幅が 0 の文字」の文字の判定
		 *
		 * 含まれるもの:
		 * - ゼロ幅スペース, ゼロ幅非接合子, ゼロ幅接合子, 単語結合子
		 * @param {number} codepoint - コードポイント
		 * @returns {boolean} 確認結果
		 */
		static isZeroWidthCharacterFromCodePoint(codepoint) {
			// prettier-ignore
			return (
				codepoint === 0x200B || // ZWSP (ZERO WIDTH SPACE) ゼロ幅スペース
				codepoint === 0x200C || // ZWNJ (ZERO WIDTH NON-JOINER) ゼロ幅非接合子
				codepoint === 0x200D || // ZWJ (ZERO WIDTH JOINER) ゼロ幅接合子
				codepoint === 0x2060 // WJ (WORD JOINER) 単語結合子
			);
		}

		/**
		 * コードポイントから結合文字の判定
		 * @param {number} codepoint - コードポイント
		 * @returns {boolean} 確認結果
		 */
		static isCombiningMarkFromCodePoint(codepoint) {
			// 異体字セレクタは除外
			if (Unicode.isVariationSelectorFromCodePoint(codepoint)) {
				return false;
			}
			try {
				return new RegExp("\\p{Mark}", "u").test(String.fromCodePoint(codepoint));
			} catch (e) {
				// フォールバック処理
				return (
					// Combining Diacritical Marks
					// prettier-ignore
					(0x0300 <= codepoint && codepoint <= 0x036F) ||
					// Combining Diacritical Marks Extended
					// prettier-ignore
					(0x1AB0 <= codepoint && codepoint <= 0x1AFF) ||
					// Combining Diacritical Marks Supplement
					// prettier-ignore
					(0x1DC0 <= codepoint && codepoint <= 0x1DFF) ||
					// Combining Diacritical Marks for Symbols
					// prettier-ignore
					(0x20D0 <= codepoint && codepoint <= 0x20FF) ||
					// 日本語に含まれる2種類の文字
					// COMBINING VOICED SOUND MARK
					// COMBINING SEMI-VOICED SOUND MARK
					// prettier-ignore
					(0x3099 <= codepoint && codepoint <= 0x309A) ||
					// Combining Half Marks
					// prettier-ignore
					(0xFE20 <= codepoint && codepoint <= 0xFE2F)
				);
			}
		}

		/**
		 * コードポイントから異体字セレクタの判定
		 * @param {number} codepoint - コードポイント
		 * @returns {boolean} 確認結果
		 */
		static isVariationSelectorFromCodePoint(codepoint) {
			return (
				// モンゴル自由字形選択子 U+180B〜U+180D (3個)
				// prettier-ignore
				(0x180B <= codepoint && codepoint <= 0x180D) ||
				// SVSで利用される異体字セレクタ U+FE00〜U+FE0F (VS1～VS16) (16個)
				// prettier-ignore
				(0xFE00 <= codepoint && codepoint <= 0xFE0F) ||
				// IVSで利用される異体字セレクタ U+E0100〜U+E01EF (VS17～VS256) (240個)
				// prettier-ignore
				(0xE0100 <= codepoint && codepoint <= 0xE01EF)
			);
		}

		/**
		 * コードポイントからスキントーン修飾子の判定
		 * @param {number} codepoint - コードポイント
		 * @returns {boolean} 確認結果
		 */
		static isEmojiModifierFromCodePoint(codepoint) {
			return (
				// EMOJI MODIFIER FITZPATRICK
				// prettier-ignore
				0x1F3FB <= codepoint && codepoint <= 0x1F3FF
			);
		}

		/**
		 * コードポイントからタグ文字の判定
		 * @param {number} codepoint - コードポイント
		 * @returns {boolean} 確認結果
		 */
		static isTagCharacterFromCodePoint(codepoint) {
			return (
				// TAG CHARACTER
				// prettier-ignore
				0xE0000 <= codepoint && codepoint <= 0xE007F
			);
		}
	}

	/**
	 * マップを初期化した否か
	 */
	Unicode.is_initmap = false;

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * 面区点情報
	 * @typedef {Object} MenKuTen
	 * @property {string} [text] 面-区-点
	 * @property {number} [men=1] 面
	 * @property {number} ku 区
	 * @property {number} ten 点
	 */

	/**
	 * Shift_JIS を扱うクラス
	 * @ignore
	 */
	class SJIS {
		/**
		 * 文字列を Shift_JIS の配列に変換。変換できない文字は "?" に変換される。
		 * @param {string} text - 変換したいテキスト
		 * @param {Record<number, number>} unicode_to_sjis - Unicode から Shift_JIS への変換マップ
		 * @returns {number[]} Shift_JIS のデータが入った配列
		 * @ignore
		 */
		static toSJISArray(text, unicode_to_sjis) {
			const map = unicode_to_sjis;
			const utf32 = Unicode.toUTF32Array(text);
			const sjis = [];
			const ng = "?".charCodeAt(0);
			for (let i = 0; i < utf32.length; i++) {
				const map_bin = map[utf32[i]];
				if (map_bin) {
					sjis.push(map_bin);
				} else {
					sjis.push(ng);
				}
			}
			return sjis;
		}

		/**
		 * 文字列を Shift_JIS のバイナリ配列に変換。変換できない文字は "?" に変換される。
		 * - 日本語文字は2バイトとして、配列も2つ分、使用します。
		 * @param {string} text - 変換したいテキスト
		 * @param {Record<number, number>} unicode_to_sjis - Unicode から Shift_JIS への変換マップ
		 * @returns {number[]} Shift_JIS のデータが入ったバイナリ配列
		 * @ignore
		 */
		static toSJISBinary(text, unicode_to_sjis) {
			const sjis = SJIS.toSJISArray(text, unicode_to_sjis);
			const sjisbin = [];
			for (let i = 0; i < sjis.length; i++) {
				if (sjis[i] < 0x100) {
					sjisbin.push(sjis[i]);
				} else {
					sjisbin.push(sjis[i] >> 8);
					sjisbin.push(sjis[i] & 0xFF);
				}
			}
			return sjisbin;
		}

		/**
		 * SJISの配列から文字列に変換
		 * @param {number[]} sjis - 変換したいテキスト
		 * @param {Record<number, number|number[]>} sjis_to_unicode - Shift_JIS から Unicode への変換マップ
		 * @returns {string} 変換後のテキスト
		 * @ignore
		 */
		static fromSJISArray(sjis, sjis_to_unicode) {
			const map = sjis_to_unicode;
			const utf16 = [];
			const ng = "?".charCodeAt(0);
			for (let i = 0; i < sjis.length; i++) {
				let x = sjis[i];
				/**
				 * @type {number|number[]}
				 */
				let y = [];
				if (x >= 0x100) {
					// すでに1つの変数にまとめられている
					y = map[x];
				} else {
					// 2バイト文字かのチェック
					// prettier-ignore
					if ((0x81 <= x && x <= 0x9F) || (0xE0 <= x && x <= 0xFC)) {
						x <<= 8;
						i++;
						x |= sjis[i];
						y = map[x];
					} else {
						y = map[x];
					}
				}
				if (y) {
					// 配列なら配列を結合
					// ※ Unicodeの結合文字の可能性があるため
					if (y instanceof Array) {
						for (let j = 0; j < y.length; j++) {
							utf16.push(y[j]);
						}
					}
					// 値しかない場合は値を結合
					else {
						utf16.push(y);
					}
				} else {
					utf16.push(ng);
				}
			}
			return Unicode.fromUTF32Array(utf16);
		}

		/**
		 * 指定したコードポイントの文字から Shift_JIS 上の符号化数値に変換
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @param {Record<number, number>} unicode_to_sjis - Unicode から Shift_JIS への変換マップ
		 * @returns {number} 符号化数値(変換できない場合はnullとなる)
		 * @ignore
		 */
		static toSJISCodeFromUnicode(unicode_codepoint, unicode_to_sjis) {
			if (!unicode_to_sjis[unicode_codepoint]) {
				return null;
			}
			const utf16_text = Unicode.fromUTF32Array([unicode_codepoint]);
			const sjis_array = SJIS.toSJISArray(utf16_text, unicode_to_sjis);
			return sjis_array[0];
		}

		/**
		 * 指定した Shift_JIS-2004 のコードから面区点番号に変換
		 * @param {number} sjis_code - Shift_JIS-2004 のコードポイント
		 * @returns {MenKuTen} 面区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
		 */
		static toMenKuTenFromSJIS2004Code(sjis_code) {
			if (!sjis_code) {
				return null;
			}
			const x = sjis_code;
			if (x < 0x100) {
				return null;
			}
			// アルゴリズムは面区点番号表からリバースエンジニアリング

			let s1 = x >> 8;
			let s2 = x & 0xFF;
			let men = 0;
			let ku = 0;
			let ten = 0;

			// 面情報の位置判定
			if (s1 < 0xF0) {
				men = 1;
				// 区の計算方法の切り替え
				// 63区から、0x9F→0xE0に飛ぶ
				// prettier-ignore
				if (s1 < 0xE0) {
					// prettier-ignore
					s1 = s1 - 0x81;
				} else {
					// prettier-ignore
					s1 = s1 - 0xC1;
				}
			} else {
				// ※2面は第4水準のみ
				men = 2;
				// 2面1区 ～ 2面8区
				// prettier-ignore
				if (((s1 === 0xF0 || s1 === 0xF2) && s2 < 0x9F) || s1 === 0xF1) {
					// prettier-ignore
					s1 = s1 - 0xF0;
				}
				// 2面12区 ～ 2面15区
				// prettier-ignore
				else if ((s1 === 0xF4 && s2 < 0x9F) || s1 < 0xF4) {
					// prettier-ignore
					s1 = s1 - 0xED;
				}
				// 2面78区 ～ 2面94区
				else {
					// prettier-ignore
					s1 = s1 - 0xCE;
				}
			}

			// 区情報の位置判定
			// prettier-ignore
			if (s2 < 0x9F) {
				ku = s1 * 2 + 1;
				// 点情報の計算方法の切り替え
				// 0x7Fが欠番のため「+1」を除去
				// prettier-ignore
				if (s2 < 0x80) {
					// prettier-ignore
					s2 = s2 - 0x40 + 1;
				} else {
					// prettier-ignore
					s2 = s2 - 0x40;
				}
			} else {
				ku = s1 * 2 + 2;
				// prettier-ignore
				s2 = s2 - 0x9F + 1;
			}

			// 点情報の位置判定
			ten = s2;

			return {
				text: "" + men + "-" + ku + "-" + ten,
				men: men,
				ku: ku,
				ten: ten
			};
		}

		/**
		 * 指定したコードポイントの文字から Shift_JIS-2004 上の面区点番号に変換
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @param {Record<number, number>} unicode_to_sjis - Unicode から Shift_JIS-2004 への変換マップ
		 * @returns {MenKuTen} 面区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
		 * @ignore
		 */
		static toMenKuTenFromUnicode(unicode_codepoint, unicode_to_sjis) {
			if (!unicode_to_sjis[unicode_codepoint]) {
				return null;
			}
			const x = SJIS.toSJISCodeFromUnicode(unicode_codepoint, unicode_to_sjis);
			return SJIS.toMenKuTenFromSJIS2004Code(x);
		}

		/**
		 * 指定した面区点番号から Shift_JIS-2004 コードに変換
		 * @param {MenKuTen|string} menkuten - 面区点番号（面が省略された場合は、1とみなす）
		 * @returns {number} Shift_JIS-2004 のコードポイント(存在しない場合はnullを返す)
		 */
		static toSJIS2004CodeFromMenKuTen(menkuten) {
			let m = null,
				k = null,
				t = null;
			let text = null;
			if (menkuten instanceof Object) {
				if (menkuten.text && typeof menkuten.text === "string") {
					text = menkuten.text;
				} else if (menkuten.ku && menkuten.ten) {
					m = menkuten.men ? menkuten.men : 1;
					k = menkuten.ku;
					t = menkuten.ten;
				}
			} else if (typeof menkuten === "string") {
				text = menkuten;
			}
			if (text) {
				const strmkt = text.split("-");
				if (strmkt.length === 3) {
					m = parseInt(strmkt[0], 10);
					k = parseInt(strmkt[1], 10);
					t = parseInt(strmkt[2], 10);
				} else if (strmkt.length === 2) {
					m = 1;
					k = parseInt(strmkt[0], 10);
					t = parseInt(strmkt[1], 10);
				}
			}
			if (!m || !k || !t) {
				throw "IllegalArgumentException";
			}

			let s1 = -1;
			let s2 = -1;

			/**
			 * @type {Record<number, number>}
			 */
			const kmap = { 1: 1, 3: 1, 4: 1, 5: 1, 8: 1, 12: 1, 13: 1, 14: 1, 15: 1 };

			// 参考
			// 2019/1/1 Shift JIS - Wikipedia
			// https://en.wikipedia.org/wiki/Shift_JIS
			//
			// 区や点の判定部分は、通常94までであるため、正確にはkやtは <=94 とするべき。
			// しかし、Shift_JIS範囲外（IBM拡張漢字）でも利用されるため制限を取り払っている。

			if (m === 1) {
				if (1 <= k && k <= 62) {
					s1 = Math.floor((k + 257) / 2);
				} else if (63 <= k) {
					s1 = Math.floor((k + 385) / 2);
				}
			} else if (m === 2) {
				if (kmap[k]) {
					s1 = Math.floor((k + 479) / 2) - Math.floor(k / 8) * 3;
				} else if (78 <= k) {
					s1 = Math.floor((k + 411) / 2);
				}
			}

			if (k % 2 === 1) {
				if (1 <= t && t <= 63) {
					s2 = t + 63;
				} else if (64 <= t) {
					s2 = t + 64;
				}
			} else {
				s2 = t + 158;
			}

			if (s1 === -1 || s2 === -1) {
				return null;
			}
			return (s1 << 8) | s2;
		}

		/**
		 * 指定した面区点番号から Unicode コードポイントに変換
		 * @param {MenKuTen|string} menkuten - 面区点番号
		 * @param {Object<number, number|number[]>} sjis_to_unicode - Shift_JIS-2004 から Unicode への変換マップ
		 * @returns {number[]} UTF-32の配列(存在しない場合はnullを返す)
		 * @ignore
		 */
		static toUnicodeCodeFromMenKuTen(menkuten, sjis_to_unicode) {
			const sjis_code = SJIS.toSJIS2004CodeFromMenKuTen(menkuten);
			if (!sjis_code) {
				return null;
			}
			const unicode = sjis_to_unicode[sjis_code];
			if (!unicode) {
				return null;
			}
			if (unicode instanceof Array) {
				return unicode;
			} else {
				return [unicode];
			}
		}

		/**
		 * 指定した Shift_JIS のコードから区点番号に変換
		 * @param {number} sjis_code - Shift_JIS のコードポイント
		 * @returns {MenKuTen} 区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
		 */
		static toKuTenFromSJISCode(sjis_code) {
			if (!sjis_code) {
				return null;
			}
			const x = sjis_code;
			if (x < 0x100) {
				return null;
			}
			// アルゴリズムは区点番号表からリバースエンジニアリング

			let s1 = x >> 8;
			let s2 = x & 0xFF;
			let ku = 0;
			let ten = 0;

			// 区の計算方法の切り替え
			// 63区から、0x9F→0xE0に飛ぶ
			// prettier-ignore
			if (s1 < 0xE0) {
				s1 = s1 - 0x81;
			} else {
				s1 = s1 - 0xC1;
			}

			// 区情報の位置判定
			// prettier-ignore
			if (s2 < 0x9F) {
				ku = s1 * 2 + 1;
				// 点情報の計算方法の切り替え
				// 0x7Fが欠番のため「+1」を除去
				// prettier-ignore
				if (s2 < 0x80) {
					// prettier-ignore
					s2 = s2 - 0x40 + 1;
				} else {
					// prettier-ignore
					s2 = s2 - 0x40;
				}
			} else {
				ku = s1 * 2 + 2;
				// prettier-ignore
				s2 = s2 - 0x9F + 1;
			}

			// 点情報の位置判定
			ten = s2;

			return {
				text: ku + "-" + ten,
				men: 1,
				ku: ku,
				ten: ten
			};
		}

		/**
		 * 指定したコードポイントの文字から Shift_JIS 上の面区点番号に変換
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @param {Record<number, number>} unicode_to_sjis - Unicode から Shift_JIS への変換マップ
		 * @returns {MenKuTen} 面区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
		 * @ignore
		 */
		static toKuTenFromUnicode(unicode_codepoint, unicode_to_sjis) {
			if (!unicode_to_sjis[unicode_codepoint]) {
				return null;
			}
			const x = SJIS.toSJISCodeFromUnicode(unicode_codepoint, unicode_to_sjis);
			return SJIS.toKuTenFromSJISCode(x);
		}

		/**
		 * 指定した面区点番号／区点番号から Shift_JIS コードに変換
		 * @param {MenKuTen|string} kuten - 面区点番号／区点番号
		 * @returns {number} Shift_JIS のコードポイント(存在しない場合はnullを返す)
		 */
		static toSJISCodeFromKuTen(kuten) {
			// 1～94区まで存在しているため面句点変換用で流用可能。
			// ただ、CP932の場合、範囲外の区、115区〜119区にIBM拡張文字が存在している。
			// 今回、toSJIS2004CodeFromMenKuTenでは区の範囲チェックをしないため問題なし。
			return SJIS.toSJIS2004CodeFromMenKuTen(kuten);
		}

		/**
		 * 指定した区点番号から Unicode コードポイントに変換
		 * @param {MenKuTen|string} kuten - 区点番号
		 * @param {Object<number, number|number[]>} sjis_to_unicode - Shift_JIS から Unicode への変換マップ
		 * @returns {number[]} UTF-32の配列(存在しない場合はnullを返す)
		 * @ignore
		 */
		static toUnicodeCodeFromKuTen(kuten, sjis_to_unicode) {
			const sjis_code = SJIS.toSJISCodeFromKuTen(kuten);
			if (!sjis_code) {
				return null;
			}
			const unicode = sjis_to_unicode[sjis_code];
			if (!unicode) {
				return null;
			}
			if (unicode instanceof Array) {
				return unicode;
			} else {
				return [unicode];
			}
		}

		/**
		 * Shift_JIS のコードポイントからJIS漢字水準（JIS Chinese character standard）に変換
		 * @param {number} sjis_code - Shift_JIS-2004 のコードポイント
		 * @returns {number} -1...変換不可, 0...水準なし, 1...第1水準, ...
		 */
		static toJISKanjiSuijunFromSJISCode(sjis_code) {
			if (!sjis_code) {
				return 0;
			}
			const menkuten = SJIS.toMenKuTenFromSJIS2004Code(sjis_code);
			// アルゴリズムはJIS漢字一覧表からリバースエンジニアリング
			if (!menkuten) {
				return 0;
			}
			// 2面は第4水準
			if (menkuten.men > 1) {
				return 4;
			}
			// 1面は第1～3水準
			if (menkuten.ku < 14) {
				// 14区より小さいと非漢字
				return 0;
			}
			if (menkuten.ku < 16) {
				// 14区と15区は第3水準
				return 3;
			}
			if (menkuten.ku < 47) {
				return 1;
			}
			// 47区には、第1水準と第3水準が混じる
			if (menkuten.ku === 47) {
				if (menkuten.ten < 52) {
					return 1;
				} else {
					return 3;
				}
			}
			if (menkuten.ku < 84) {
				return 2;
			}
			// 84区には、第2水準と第3水準が混じる
			if (menkuten.ku === 84) {
				if (menkuten.ten < 7) {
					return 2;
				} else {
					return 3;
				}
			}
			// 残り94区まで第3水準
			if (menkuten.ku < 95) {
				return 3;
			}
			return 0;
		}

		/**
		 * Unicode のコードポイントからJIS漢字水準（JIS Chinese character standard）に変換
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @param {Record<number, number>} unicode_to_sjis - Unicode から Shift_JIS への変換マップ
		 * @returns {number} -1...変換不可, 0...水準なし, 1...第1水準, ...
		 * @ignore
		 */
		static toJISKanjiSuijunFromUnicode(unicode_codepoint, unicode_to_sjis) {
			if (!unicode_to_sjis[unicode_codepoint]) {
				return -1;
			}
			const x = SJIS.toSJISCodeFromUnicode(unicode_codepoint, unicode_to_sjis);
			return SJIS.toJISKanjiSuijunFromSJISCode(x);
		}

		/**
		 * 指定した面区点番号から Shift_JIS の仕様上、正規な物か判定
		 * @param {MenKuTen|string} menkuten - 面区点番号（面が省略された場合は、1とみなす）
		 * @returns {boolean} 正規なデータは true, 不正なデータは false
		 */
		static isRegularMenKuten(menkuten) {
			let m, k, t;

			// 引数のテスト
			if (menkuten instanceof Object) {
				m = menkuten.men ? menkuten.men : 1;
				k = menkuten.ku;
				t = menkuten.ten;
			} else if (typeof menkuten === "string") {
				const strmkt = menkuten.split("-");
				if (strmkt.length === 3) {
					m = parseInt(strmkt[0], 10);
					k = parseInt(strmkt[1], 10);
					t = parseInt(strmkt[2], 10);
				} else if (strmkt.length === 2) {
					m = 1;
					k = parseInt(strmkt[0], 10);
					t = parseInt(strmkt[1], 10);
				} else {
					return false;
				}
			} else {
				return false;
			}

			/**
			 * @type {Record<number, number>}
			 */
			const kmap = { 1: 1, 3: 1, 4: 1, 5: 1, 8: 1, 12: 1, 13: 1, 14: 1, 15: 1 };
			if (m === 1) {
				// 1面は1-94区まで存在
				if (!(1 <= k && k <= 94)) {
					return false;
				}
			} else if (m === 2) {
				// 2面は、1,3,4,5,8,12,13,14,15,78-94区まで存在
				if (!(kmap[k] || (78 <= k && k <= 94))) {
					return false;
				}
			} else {
				// 面が不正
				return false;
			}
			// 点は1-94点まで存在
			if (!(1 <= t && t <= 94)) {
				return false;
			}
			return true;
		}
	}

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * @typedef {import('./SJIS.js').MenKuTen} MenKuTen
	 */

	/**
	 * CP932, Windows-31J の変換マップ作成用クラス
	 * @ignore
	 */
	class CP932MAP {
		/**
		 * 変換マップを初期化
		 */
		static init() {
			if (CP932MAP.is_initmap) {
				return;
			}
			CP932MAP.is_initmap = true;

			/**
			 * @returns {Record<number, number>}
			 */
			const getCp932ToUnicodeMap = function () {

				/**
				 * 1バイトの変換マップ
				 *
				 *
				 * 参考：WideCharToMultiByte
				 * メモ：今回は使っていないが、以下の文献も参考になるかもしれません。
				 * ftp://www.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/JIS/JIS0208.TXT
				 * @type {Record<number, number>}
				 */
				// prettier-ignore
				const cp932_to_unicode_map = {
					0x01: 0x01, 0x02: 0x02, 0x03: 0x03, 0x04: 0x04, 0x05: 0x05, 0x06: 0x06, 0x07: 0x07, 0x08: 0x08,
					0x09: 0x09, 0x0A: 0x0A, 0x0B: 0x0B, 0x0C: 0x0C, 0x0D: 0x0D, 0x0E: 0x0E, 0x0F: 0x0F, 0x10: 0x10,
					0x11: 0x11, 0x12: 0x12, 0x13: 0x13, 0x14: 0x14, 0x15: 0x15, 0x16: 0x16, 0x17: 0x17, 0x18: 0x18,
					0x19: 0x19, 0x1A: 0x1A, 0x1B: 0x1B, 0x1C: 0x1C, 0x1D: 0x1D, 0x1E: 0x1E, 0x1F: 0x1F, 0x20: 0x20,
					0x21: 0x21, 0x22: 0x22, 0x23: 0x23, 0x24: 0x24, 0x25: 0x25, 0x26: 0x26, 0x27: 0x27, 0x28: 0x28,
					0x29: 0x29, 0x2A: 0x2A, 0x2B: 0x2B, 0x2C: 0x2C, 0x2D: 0x2D, 0x2E: 0x2E, 0x2F: 0x2F, 0x30: 0x30,
					0x31: 0x31, 0x32: 0x32, 0x33: 0x33, 0x34: 0x34, 0x35: 0x35, 0x36: 0x36, 0x37: 0x37, 0x38: 0x38,
					0x39: 0x39, 0x3A: 0x3A, 0x3B: 0x3B, 0x3C: 0x3C, 0x3D: 0x3D, 0x3E: 0x3E, 0x3F: 0x3F, 0x40: 0x40,
					0x41: 0x41, 0x42: 0x42, 0x43: 0x43, 0x44: 0x44, 0x45: 0x45, 0x46: 0x46, 0x47: 0x47, 0x48: 0x48,
					0x49: 0x49, 0x4A: 0x4A, 0x4B: 0x4B, 0x4C: 0x4C, 0x4D: 0x4D, 0x4E: 0x4E, 0x4F: 0x4F, 0x50: 0x50,
					0x51: 0x51, 0x52: 0x52, 0x53: 0x53, 0x54: 0x54, 0x55: 0x55, 0x56: 0x56, 0x57: 0x57, 0x58: 0x58,
					0x59: 0x59, 0x5A: 0x5A, 0x5B: 0x5B, 0x5C: 0x5C, 0x5D: 0x5D, 0x5E: 0x5E, 0x5F: 0x5F, 0x60: 0x60,
					0x61: 0x61, 0x62: 0x62, 0x63: 0x63, 0x64: 0x64, 0x65: 0x65, 0x66: 0x66, 0x67: 0x67, 0x68: 0x68,
					0x69: 0x69, 0x6A: 0x6A, 0x6B: 0x6B, 0x6C: 0x6C, 0x6D: 0x6D, 0x6E: 0x6E, 0x6F: 0x6F, 0x70: 0x70,
					0x71: 0x71, 0x72: 0x72, 0x73: 0x73, 0x74: 0x74, 0x75: 0x75, 0x76: 0x76, 0x77: 0x77, 0x78: 0x78,
					0x79: 0x79, 0x7A: 0x7A, 0x7B: 0x7B, 0x7C: 0x7C, 0x7D: 0x7D, 0x7E: 0x7E, 0x7F: 0x7F, 0x80: 0x80,
					0xA0: 0xF8F0, 0xA1: 0xFF61, 0xA2: 0xFF62, 0xA3: 0xFF63, 0xA4: 0xFF64, 0xA5: 0xFF65, 0xA6: 0xFF66, 0xA7: 0xFF67,
					0xA8: 0xFF68, 0xA9: 0xFF69, 0xAA: 0xFF6A, 0xAB: 0xFF6B, 0xAC: 0xFF6C, 0xAD: 0xFF6D, 0xAE: 0xFF6E, 0xAF: 0xFF6F,
					0xB0: 0xFF70, 0xB1: 0xFF71, 0xB2: 0xFF72, 0xB3: 0xFF73, 0xB4: 0xFF74, 0xB5: 0xFF75, 0xB6: 0xFF76, 0xB7: 0xFF77,
					0xB8: 0xFF78, 0xB9: 0xFF79, 0xBA: 0xFF7A, 0xBB: 0xFF7B, 0xBC: 0xFF7C, 0xBD: 0xFF7D, 0xBE: 0xFF7E, 0xBF: 0xFF7F,
					0xC0: 0xFF80, 0xC1: 0xFF81, 0xC2: 0xFF82, 0xC3: 0xFF83, 0xC4: 0xFF84, 0xC5: 0xFF85, 0xC6: 0xFF86, 0xC7: 0xFF87,
					0xC8: 0xFF88, 0xC9: 0xFF89, 0xCA: 0xFF8A, 0xCB: 0xFF8B, 0xCC: 0xFF8C, 0xCD: 0xFF8D, 0xCE: 0xFF8E, 0xCF: 0xFF8F,
					0xD0: 0xFF90, 0xD1: 0xFF91, 0xD2: 0xFF92, 0xD3: 0xFF93, 0xD4: 0xFF94, 0xD5: 0xFF95, 0xD6: 0xFF96, 0xD7: 0xFF97,
					0xD8: 0xFF98, 0xD9: 0xFF99, 0xDA: 0xFF9A, 0xDB: 0xFF9B, 0xDC: 0xFF9C, 0xDD: 0xFF9D, 0xDE: 0xFF9E, 0xDF: 0xFF9F,
					0xFD: 0xF8F1, 0xFE: 0xF8F2, 0xFF: 0xF8F3
				};

				/**
				 * 2バイト文字（0x8140-0xffff）の変換マップ作成用の文字列
				 * @type {string}
				 */
				// prettier-ignore
				const map = [
					"　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈〉《》「」『』【】＋－±×1÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓11∈∋⊆⊇⊂⊃∪∩8∧∨￢⇒⇔∀∃11∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬7Å‰♯♭♪†‡¶4◯82",
					"０１２３４５６７８９7ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ7ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ4ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをん78",
					"ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミ1ムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ8ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ8αβγδεζηθικλμνξοπρστυφχψω105АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ15абвгдеёжзийклмн1опрстуфхцчшщъыьэюя13─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂641",
					"①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ1㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡8㍻1〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪258",
					"亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭67",
					"院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円1園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改67",
					"魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫1橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄67",
					"機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救1朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈67",
					"掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨1劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向67",
					"后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降1項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷67",
					"察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止1死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周67",
					"宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳1準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾67",
					"拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨1逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線67",
					"繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻1操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只67",
					"叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄1逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓67",
					"邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬1凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入67",
					"如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅1楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美67",
					"鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷1斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋67",
					"法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆1摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒67",
					"諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲1沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯67",
					"蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕44弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲67",
					"僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭1凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨67",
					"咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸1噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩67",
					"奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀1它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏67",
					"廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠1怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛67",
					"戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫1捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼67",
					"曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎1梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣67",
					"檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯1麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌16451",
					"漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝1烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱67",
					"瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿1痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬67",
					"磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰1窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆67",
					"紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷1縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋67",
					"隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤1艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈67",
					"蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬1蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞67",
					"襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧1諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊67",
					"蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜1轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮67",
					"錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙1閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰67",
					"顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃1騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈67",
					"鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯1黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙667",
					"纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏1塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱67",
					"犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙1蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑2ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ￢￤＇＂323",
					"167",
					"167",
					"167",
					"167",
					"167",
					"167",
					"167",
					"167",
					"167",
					"167",
					"ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ￢￤＇＂㈱№℡∵纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊1兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯67",
					"涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神1祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙67",
					"髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"
				].join("");

				 

				/*
				上の変換マップ作成用の文字列は数値が入った変換マップのコードから作成している
				let output = "";
				let nul_count = 0;
				for(i = 0x8140; i <= 0xffff; i++) {
					if(map[i]) {
						if(nul_count !== 0){
							output += nul_count;
							nul_count = 0;
						}
						output += MojiJS.fromCodePoint(map[i]);
					}
					else {
						nul_count++;
					}
				}
				*/

				/**
				 * UTF16へ変換
				 */
				const utf16_array = Unicode.toUTF16Array(map);

				// マップ展開
				let is_num = false;
				let num_array = [];
				let key = 0x8140;
				for (let i = 0; i < utf16_array.length; i++) {
					const x = utf16_array[i];
					if (0x30 <= x && x <= 0x39) {
						if (!is_num) {
							is_num = true;
							num_array = [];
						}
						num_array.push(x);
					} else {
						if (is_num) {
							key += parseFloat(Unicode.fromUTF16Array(num_array));
							is_num = false;
						}
						cp932_to_unicode_map[key] = x;
						key++;
					}
				}

				return cp932_to_unicode_map;
			};

			/**
			 * CP932 変換マップ
			 * @type {Record<number, number>}
			 */
			const cp932_to_unicode_map = getCp932ToUnicodeMap();

			/**
			 * 重複された CP932 のコード
			 * @type {number[]}
			 */
			// prettier-ignore
			const duplicate_map_array = [
				0x8790, 0x8791, 0x8792, 0x8795, 0x8796, 0x8797, 0x879A, 0x879B, 0x879C, 0xED40, 0xED41, 0xED42, 0xED43, 0xED44, 0xED45, 0xED46,
				0xED47, 0xED48, 0xED49, 0xED4A, 0xED4B, 0xED4C, 0xED4D, 0xED4E, 0xED4F, 0xED50, 0xED51, 0xED52, 0xED53, 0xED54, 0xED55, 0xED56,
				0xED57, 0xED58, 0xED59, 0xED5A, 0xED5B, 0xED5C, 0xED5D, 0xED5E, 0xED5F, 0xED60, 0xED61, 0xED62, 0xED63, 0xED64, 0xED65, 0xED66,
				0xED67, 0xED68, 0xED69, 0xED6A, 0xED6B, 0xED6C, 0xED6D, 0xED6E, 0xED6F, 0xED70, 0xED71, 0xED72, 0xED73, 0xED74, 0xED75, 0xED76,
				0xED77, 0xED78, 0xED79, 0xED7A, 0xED7B, 0xED7C, 0xED7D, 0xED7E, 0xED80, 0xED81, 0xED82, 0xED83, 0xED84, 0xED85, 0xED86, 0xED87,
				0xED88, 0xED89, 0xED8A, 0xED8B, 0xED8C, 0xED8D, 0xED8E, 0xED8F, 0xED90, 0xED91, 0xED92, 0xED93, 0xED94, 0xED95, 0xED96, 0xED97,
				0xED98, 0xED99, 0xED9A, 0xED9B, 0xED9C, 0xED9D, 0xED9E, 0xED9F, 0xEDA0, 0xEDA1, 0xEDA2, 0xEDA3, 0xEDA4, 0xEDA5, 0xEDA6, 0xEDA7,
				0xEDA8, 0xEDA9, 0xEDAA, 0xEDAB, 0xEDAC, 0xEDAD, 0xEDAE, 0xEDAF, 0xEDB0, 0xEDB1, 0xEDB2, 0xEDB3, 0xEDB4, 0xEDB5, 0xEDB6, 0xEDB7,
				0xEDB8, 0xEDB9, 0xEDBA, 0xEDBB, 0xEDBC, 0xEDBD, 0xEDBE, 0xEDBF, 0xEDC0, 0xEDC1, 0xEDC2, 0xEDC3, 0xEDC4, 0xEDC5, 0xEDC6, 0xEDC7,
				0xEDC8, 0xEDC9, 0xEDCA, 0xEDCB, 0xEDCC, 0xEDCD, 0xEDCE, 0xEDCF, 0xEDD0, 0xEDD1, 0xEDD2, 0xEDD3, 0xEDD4, 0xEDD5, 0xEDD6, 0xEDD7,
				0xEDD8, 0xEDD9, 0xEDDA, 0xEDDB, 0xEDDC, 0xEDDD, 0xEDDE, 0xEDDF, 0xEDE0, 0xEDE1, 0xEDE2, 0xEDE3, 0xEDE4, 0xEDE5, 0xEDE6, 0xEDE7,
				0xEDE8, 0xEDE9, 0xEDEA, 0xEDEB, 0xEDEC, 0xEDED, 0xEDEE, 0xEDEF, 0xEDF0, 0xEDF1, 0xEDF2, 0xEDF3, 0xEDF4, 0xEDF5, 0xEDF6, 0xEDF7,
				0xEDF8, 0xEDF9, 0xEDFA, 0xEDFB, 0xEDFC, 0xEE40, 0xEE41, 0xEE42, 0xEE43, 0xEE44, 0xEE45, 0xEE46, 0xEE47, 0xEE48, 0xEE49, 0xEE4A,
				0xEE4B, 0xEE4C, 0xEE4D, 0xEE4E, 0xEE4F, 0xEE50, 0xEE51, 0xEE52, 0xEE53, 0xEE54, 0xEE55, 0xEE56, 0xEE57, 0xEE58, 0xEE59, 0xEE5A,
				0xEE5B, 0xEE5C, 0xEE5D, 0xEE5E, 0xEE5F, 0xEE60, 0xEE61, 0xEE62, 0xEE63, 0xEE64, 0xEE65, 0xEE66, 0xEE67, 0xEE68, 0xEE69, 0xEE6A,
				0xEE6B, 0xEE6C, 0xEE6D, 0xEE6E, 0xEE6F, 0xEE70, 0xEE71, 0xEE72, 0xEE73, 0xEE74, 0xEE75, 0xEE76, 0xEE77, 0xEE78, 0xEE79, 0xEE7A,
				0xEE7B, 0xEE7C, 0xEE7D, 0xEE7E, 0xEE80, 0xEE81, 0xEE82, 0xEE83, 0xEE84, 0xEE85, 0xEE86, 0xEE87, 0xEE88, 0xEE89, 0xEE8A, 0xEE8B,
				0xEE8C, 0xEE8D, 0xEE8E, 0xEE8F, 0xEE90, 0xEE91, 0xEE92, 0xEE93, 0xEE94, 0xEE95, 0xEE96, 0xEE97, 0xEE98, 0xEE99, 0xEE9A, 0xEE9B,
				0xEE9C, 0xEE9D, 0xEE9E, 0xEE9F, 0xEEA0, 0xEEA1, 0xEEA2, 0xEEA3, 0xEEA4, 0xEEA5, 0xEEA6, 0xEEA7, 0xEEA8, 0xEEA9, 0xEEAA, 0xEEAB,
				0xEEAC, 0xEEAD, 0xEEAE, 0xEEAF, 0xEEB0, 0xEEB1, 0xEEB2, 0xEEB3, 0xEEB4, 0xEEB5, 0xEEB6, 0xEEB7, 0xEEB8, 0xEEB9, 0xEEBA, 0xEEBB,
				0xEEBC, 0xEEBD, 0xEEBE, 0xEEBF, 0xEEC0, 0xEEC1, 0xEEC2, 0xEEC3, 0xEEC4, 0xEEC5, 0xEEC6, 0xEEC7, 0xEEC8, 0xEEC9, 0xEECA, 0xEECB,
				0xEECC, 0xEECD, 0xEECE, 0xEECF, 0xEED0, 0xEED1, 0xEED2, 0xEED3, 0xEED4, 0xEED5, 0xEED6, 0xEED7, 0xEED8, 0xEED9, 0xEEDA, 0xEEDB,
				0xEEDC, 0xEEDD, 0xEEDE, 0xEEDF, 0xEEE0, 0xEEE1, 0xEEE2, 0xEEE3, 0xEEE4, 0xEEE5, 0xEEE6, 0xEEE7, 0xEEE8, 0xEEE9, 0xEEEA, 0xEEEB,
				0xEEEC, 0xEEEF, 0xEEF0, 0xEEF1, 0xEEF2, 0xEEF3, 0xEEF4, 0xEEF5, 0xEEF6, 0xEEF7, 0xEEF8, 0xEEF9, 0xEEFA, 0xEEFB, 0xEEFC, 0xFA4A,
				0xFA4B, 0xFA4C, 0xFA4D, 0xFA4E, 0xFA4F, 0xFA50, 0xFA51, 0xFA52, 0xFA53, 0xFA54, 0xFA58, 0xFA59, 0xFA5A, 0xFA5B
			];

			/**
			 * @type {Record<number, number>}
			 */
			const duplicate_map = {};

			/**
			 * @type {Record<number, number>}
			 */
			const unicode_to_cp932_map = {};

			for (const key in duplicate_map_array) {
				duplicate_map[duplicate_map_array[key]] = 1;
			}
			for (const key in cp932_to_unicode_map) {
				// 重複登録された文字
				// IBM拡張文字 と NEC特殊文字 と NEC選定IBM拡張文字 で
				// マッピング先が一部重複している。
				// WideCharToMultiByte の仕様に基づき、登録しない。
				if (duplicate_map[key]) {
					continue;
				}
				const x = cp932_to_unicode_map[key];
				unicode_to_cp932_map[x] = parseInt(key, 10);
			}

			// 逆引きの注意点

			// 半角￥マーク問題
			// 半角￥マークは、Shift_JISの「5c 0xReverse Solidus 逆斜線」にする
			// Unicode '¥' 0x00a5 Yen Sign 半角円マーク
			unicode_to_cp932_map[0xA5] = 0x5C;

			// 波線問題
			// SJIS2004上は 0x8160 と 0x81B0 とで区別されている。
			// Shift_JISは 0x301c を 0x8160 に統一
			// Unicode '〜' 0x301c Shift_JIS-2004 0x8160 Wave Dash 波ダッシュ
			// Unicode '～' 0xff5e Shift_JIS-2004 0x81B0 Fullwidth Tilde 全角チルダ
			unicode_to_cp932_map[0x301C] = 0x8160;

			// マイナス問題
			// SJIS2004上は 0x817c と 0x81af とで区別されている。
			// Shift_JISは、0x2212 を全角負記号 0x817c へ変更
			// Unicode `−` 0x2212 Shift_JIS-2004 0x817c 負符号/減算記号
			// Unicode `－` 0xff0d Shift_JIS-2004 0x81af ハイフンマイナス
			unicode_to_cp932_map[0x2212] = 0x817C;

			CP932MAP.cp932_to_unicode_map = cp932_to_unicode_map;
			CP932MAP.unicode_to_cp932_map = unicode_to_cp932_map;
		}

		/**
		 * @returns {Record<number, number>}
		 */
		static CP932_TO_UNICODE() {
			CP932MAP.init();
			return CP932MAP.cp932_to_unicode_map;
		}

		/**
		 * @returns {Record<number, number>}
		 */
		static UNICODE_TO_CP932() {
			CP932MAP.init();
			return CP932MAP.unicode_to_cp932_map;
		}
	}

	/**
	 * 変換マップを初期化したかどうか
	 * @type {boolean}
	 */
	CP932MAP.is_initmap = false;

	/**
	 * 変換用マップ
	 * @type {Record<number, number>}
	 */
	CP932MAP.cp932_to_unicode_map = null;

	/**
	 * 変換用マップ
	 * @type {Record<number, number>}
	 */
	CP932MAP.unicode_to_cp932_map = null;

	/**
	 * CP932, Windows-31J を扱うクラス
	 * @ignore
	 */
	class CP932 {
		/**
		 * Unicode のコードから CP932 のコードに変換
		 * @param {number} unicode_codepoint - Unicode のコードポイント
		 * @returns {number} CP932 のコードポイント (存在しない場合は undefined)
		 */
		static toCP932FromUnicode(unicode_codepoint) {
			return CP932MAP.UNICODE_TO_CP932()[unicode_codepoint];
		}

		/**
		 * CP932 のコードから Unicode のコードに変換
		 * @param {number} cp932_codepoint - CP932 のコードポイント
		 * @returns {number} Unicode のコードポイント (存在しない場合は undefined)
		 */
		static toUnicodeFromCP932(cp932_codepoint) {
			return CP932MAP.CP932_TO_UNICODE()[cp932_codepoint];
		}

		/**
		 * 文字列を CP932 の配列に変換。変換できない文字は "?" に変換される。
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} CP932 のデータが入った配列
		 */
		static toCP932Array(text) {
			return SJIS.toSJISArray(text, CP932MAP.UNICODE_TO_CP932());
		}

		/**
		 * 文字列を CP932 のバイナリ配列に変換。変換できない文字は "?" に変換される。
		 * - 日本語文字は2バイトとして、配列も2つ分、使用します。
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} CP932 のデータが入ったバイナリ配列
		 */
		static toCP932Binary(text) {
			return SJIS.toSJISBinary(text, CP932MAP.UNICODE_TO_CP932());
		}

		/**
		 * CP932 の配列から文字列に変換
		 * @param {number[]} cp932 - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromCP932Array(cp932) {
			return SJIS.fromSJISArray(cp932, CP932MAP.CP932_TO_UNICODE());
		}

		/**
		 * 指定した文字から Windows-31J 上の区点番号に変換
		 * - 2文字以上を指定した場合は、1文字目のみを変換する
		 * @param {string} text - 変換したいテキスト
		 * @returns {MenKuTen} 区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
		 */
		static toKuTen(text) {
			if (text.length === 0) {
				return null;
			}
			const cp932_code = CP932.toCP932FromUnicode(Unicode.toUTF32Array(text)[0]);
			return cp932_code ? SJIS.toKuTenFromSJISCode(cp932_code) : null;
		}

		/**
		 * Windows-31J 上の区点番号から文字列に変換
		 * @param {MenKuTen|string} kuten - 区点番号
		 * @returns {string} 変換後のテキスト
		 */
		static fromKuTen(kuten) {
			const code = SJIS.toUnicodeCodeFromKuTen(kuten, CP932MAP.CP932_TO_UNICODE());
			return code ? Unicode.fromUTF32Array(code) : "";
		}
	}

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * @typedef {import('./SJIS.js').MenKuTen} MenKuTen
	 */

	/**
	 * Shift_JIS-2004 の変換マップ作成用クラス
	 * @ignore
	 */
	class SJIS2004MAP {
		/**
		 * 変換マップを初期化
		 */
		static init() {
			if (SJIS2004MAP.is_initmap) {
				return;
			}
			SJIS2004MAP.is_initmap = true;

			/**
			 * 変換マップを作成
			 *
			 *
			 * @returns {Object<number, number|number[]>}
			 */
			const getSJIS2004ToUnicodeMap = function () {
				/**
				 * 変換マップ
				 * - 2文字に変換される場合もあるので注意
				 *
				 *
				 * 参考：JIS X 0213 - Wikipedia (2019/1/1)
				 * https://ja.wikipedia.org/wiki/JIS_X_0213
				 * @type {Object<number, number|number[]>}
				 */
				// prettier-ignore
				const sjis2004_to_unicode_map = {
					// ASCII コード部分は CP932 を参考
					0x00: 0x00, 
					0x01: 0x01, 0x02: 0x02, 0x03: 0x03, 0x04: 0x04, 0x05: 0x05, 0x06: 0x06, 0x07: 0x07, 0x08: 0x08,
					0x09: 0x09, 0x0A: 0x0A, 0x0B: 0x0B, 0x0C: 0x0C, 0x0D: 0x0D, 0x0E: 0x0E, 0x0F: 0x0F, 0x10: 0x10,
					0x11: 0x11, 0x12: 0x12, 0x13: 0x13, 0x14: 0x14, 0x15: 0x15, 0x16: 0x16, 0x17: 0x17, 0x18: 0x18,
					0x19: 0x19, 0x1A: 0x1A, 0x1B: 0x1B, 0x1C: 0x1C, 0x1D: 0x1D, 0x1E: 0x1E, 0x1F: 0x1F, 0x20: 0x20,
					0x21: 0x21, 0x22: 0x22, 0x23: 0x23, 0x24: 0x24, 0x25: 0x25, 0x26: 0x26, 0x27: 0x27, 0x28: 0x28,
					0x29: 0x29, 0x2A: 0x2A, 0x2B: 0x2B, 0x2C: 0x2C, 0x2D: 0x2D, 0x2E: 0x2E, 0x2F: 0x2F, 0x30: 0x30,
					0x31: 0x31, 0x32: 0x32, 0x33: 0x33, 0x34: 0x34, 0x35: 0x35, 0x36: 0x36, 0x37: 0x37, 0x38: 0x38,
					0x39: 0x39, 0x3A: 0x3A, 0x3B: 0x3B, 0x3C: 0x3C, 0x3D: 0x3D, 0x3E: 0x3E, 0x3F: 0x3F, 0x40: 0x40,
					0x41: 0x41, 0x42: 0x42, 0x43: 0x43, 0x44: 0x44, 0x45: 0x45, 0x46: 0x46, 0x47: 0x47, 0x48: 0x48,
					0x49: 0x49, 0x4A: 0x4A, 0x4B: 0x4B, 0x4C: 0x4C, 0x4D: 0x4D, 0x4E: 0x4E, 0x4F: 0x4F, 0x50: 0x50,
					0x51: 0x51, 0x52: 0x52, 0x53: 0x53, 0x54: 0x54, 0x55: 0x55, 0x56: 0x56, 0x57: 0x57, 0x58: 0x58,
					0x59: 0x59, 0x5A: 0x5A, 0x5B: 0x5B, 0x5C: 0x5C, 0x5D: 0x5D, 0x5E: 0x5E, 0x5F: 0x5F, 0x60: 0x60,
					0x61: 0x61, 0x62: 0x62, 0x63: 0x63, 0x64: 0x64, 0x65: 0x65, 0x66: 0x66, 0x67: 0x67, 0x68: 0x68,
					0x69: 0x69, 0x6A: 0x6A, 0x6B: 0x6B, 0x6C: 0x6C, 0x6D: 0x6D, 0x6E: 0x6E, 0x6F: 0x6F, 0x70: 0x70,
					0x71: 0x71, 0x72: 0x72, 0x73: 0x73, 0x74: 0x74, 0x75: 0x75, 0x76: 0x76, 0x77: 0x77, 0x78: 0x78,
					0x79: 0x79, 0x7A: 0x7A, 0x7B: 0x7B, 0x7C: 0x7C, 0x7D: 0x7D, 0x7E: 0x7E, 0x7F: 0x7F, 0x80: 0x80,
					0xA0: 0xF8F0, 0xA1: 0xFF61, 0xA2: 0xFF62, 0xA3: 0xFF63, 0xA4: 0xFF64, 0xA5: 0xFF65, 0xA6: 0xFF66, 0xA7: 0xFF67,
					0xA8: 0xFF68, 0xA9: 0xFF69, 0xAA: 0xFF6A, 0xAB: 0xFF6B, 0xAC: 0xFF6C, 0xAD: 0xFF6D, 0xAE: 0xFF6E, 0xAF: 0xFF6F,
					0xB0: 0xFF70, 0xB1: 0xFF71, 0xB2: 0xFF72, 0xB3: 0xFF73, 0xB4: 0xFF74, 0xB5: 0xFF75, 0xB6: 0xFF76, 0xB7: 0xFF77,
					0xB8: 0xFF78, 0xB9: 0xFF79, 0xBA: 0xFF7A, 0xBB: 0xFF7B, 0xBC: 0xFF7C, 0xBD: 0xFF7D, 0xBE: 0xFF7E, 0xBF: 0xFF7F,
					0xC0: 0xFF80, 0xC1: 0xFF81, 0xC2: 0xFF82, 0xC3: 0xFF83, 0xC4: 0xFF84, 0xC5: 0xFF85, 0xC6: 0xFF86, 0xC7: 0xFF87,
					0xC8: 0xFF88, 0xC9: 0xFF89, 0xCA: 0xFF8A, 0xCB: 0xFF8B, 0xCC: 0xFF8C, 0xCD: 0xFF8D, 0xCE: 0xFF8E, 0xCF: 0xFF8F,
					0xD0: 0xFF90, 0xD1: 0xFF91, 0xD2: 0xFF92, 0xD3: 0xFF93, 0xD4: 0xFF94, 0xD5: 0xFF95, 0xD6: 0xFF96, 0xD7: 0xFF97,
					0xD8: 0xFF98, 0xD9: 0xFF99, 0xDA: 0xFF9A, 0xDB: 0xFF9B, 0xDC: 0xFF9C, 0xDD: 0xFF9D, 0xDE: 0xFF9E, 0xDF: 0xFF9F,
					0xFD: 0xF8F1, 0xFE: 0xF8F2, 0xFF: 0xF8F3,
					// 以下、数字記号部分の変換マップ
					0x8140: 0x3000, 0x8141: 0x3001, 0x8142: 0x3002, 0x8143: 0x002C, 0x8144: 0x002E, 0x8145: 0x30FB, 0x8146: 0x003A, 0x8147: 0x003B,
					0x8148: 0x003F, 0x8149: 0x0021, 0x814A: 0x309B, 0x814B: 0x309C, 0x814C: 0x00B4, 0x814D: 0x0060, 0x814E: 0x00A8, 0x814F: 0x005E,
					0x8150: 0x203E, 0x8151: 0x005F, 0x8152: 0x30FD, 0x8153: 0x30FE, 0x8154: 0x309D, 0x8155: 0x309E, 0x8156: 0x3003, 0x8157: 0x4EDD,
					0x8158: 0x3005, 0x8159: 0x3006, 0x815A: 0x3007, 0x815B: 0x30FC, 0x815C: 0x2014, 0x815D: 0x2010, 0x815E: 0x002F, 0x815F: 0x005C,
					0x8160: 0x301C, 0x8161: 0x2016, 0x8162: 0x007C, 0x8163: 0x2026, 0x8164: 0x2025, 0x8165: 0x2018, 0x8166: 0x2019, 0x8167: 0x201C,
					0x8168: 0x201D, 0x8169: 0x0028, 0x816A: 0x0029, 0x816B: 0x3014, 0x816C: 0x3015, 0x816D: 0x005B, 0x816E: 0x005D, 0x816F: 0x007B,
					0x8170: 0x007D, 0x8171: 0x3008, 0x8172: 0x3009, 0x8173: 0x300A, 0x8174: 0x300B, 0x8175: 0x300C, 0x8176: 0x300D, 0x8177: 0x300E,
					0x8178: 0x300F, 0x8179: 0x3010, 0x817A: 0x3011, 0x817B: 0x002B, 0x817C: 0x2212, 0x817D: 0x00B1, 0x817E: 0x00D7, 0x8180: 0x00F7,
					0x8181: 0x003D, 0x8182: 0x2260, 0x8183: 0x003C, 0x8184: 0x003E, 0x8185: 0x2266, 0x8186: 0x2267, 0x8187: 0x221E, 0x8188: 0x2234,
					0x8189: 0x2642, 0x818A: 0x2640, 0x818B: 0x00B0, 0x818C: 0x2032, 0x818D: 0x2033, 0x818E: 0x2103, 0x818F: 0x00A5, 0x8190: 0x0024,
					0x8191: 0x00A2, 0x8192: 0x00A3, 0x8193: 0x0025, 0x8194: 0x0023, 0x8195: 0x0026, 0x8196: 0x002A, 0x8197: 0x0040, 0x8198: 0x00A7,
					0x8199: 0x2606, 0x819A: 0x2605, 0x819B: 0x25CB, 0x819C: 0x25CF, 0x819D: 0x25CE, 0x819E: 0x25C7, 0x819F: 0x25C6, 0x81A0: 0x25A1,
					0x81A1: 0x25A0, 0x81A2: 0x25B3, 0x81A3: 0x25B2, 0x81A4: 0x25BD, 0x81A5: 0x25BC, 0x81A6: 0x203B, 0x81A7: 0x3012, 0x81A8: 0x2192,
					0x81A9: 0x2190, 0x81AA: 0x2191, 0x81AB: 0x2193, 0x81AC: 0x3013, 0x81AD: 0x0027, 0x81AE: 0x0022, 0x81AF: 0x002D, 0x81B0: 0x007E,
					0x81B1: 0x3033, 0x81B2: 0x3034, 0x81B3: 0x3035, 0x81B4: 0x303B, 0x81B5: 0x303C, 0x81B6: 0x30FF, 0x81B7: 0x309F, 0x81B8: 0x2208,
					0x81B9: 0x220B, 0x81BA: 0x2286, 0x81BB: 0x2287, 0x81BC: 0x2282, 0x81BD: 0x2283, 0x81BE: 0x222A, 0x81BF: 0x2229, 0x81C0: 0x2284,
					0x81C1: 0x2285, 0x81C2: 0x228A, 0x81C3: 0x228B, 0x81C4: 0x2209, 0x81C5: 0x2205, 0x81C6: 0x2305, 0x81C7: 0x2306, 0x81C8: 0x2227,
					0x81C9: 0x2228, 0x81CA: 0x00AC, 0x81CB: 0x21D2, 0x81CC: 0x21D4, 0x81CD: 0x2200, 0x81CE: 0x2203, 0x81CF: 0x2295, 0x81D0: 0x2296,
					0x81D1: 0x2297, 0x81D2: 0x2225, 0x81D3: 0x2226, 0x81D4: 0xFF5F, 0x81D5: 0xFF60, 0x81D6: 0x3018, 0x81D7: 0x3019, 0x81D8: 0x3016,
					0x81D9: 0x3017, 0x81DA: 0x2220, 0x81DB: 0x22A5, 0x81DC: 0x2312, 0x81DD: 0x2202, 0x81DE: 0x2207, 0x81DF: 0x2261, 0x81E0: 0x2252,
					0x81E1: 0x226A, 0x81E2: 0x226B, 0x81E3: 0x221A, 0x81E4: 0x223D, 0x81E5: 0x221D, 0x81E6: 0x2235, 0x81E7: 0x222B, 0x81E8: 0x222C,
					0x81E9: 0x2262, 0x81EA: 0x2243, 0x81EB: 0x2245, 0x81EC: 0x2248, 0x81ED: 0x2276, 0x81EE: 0x2277, 0x81EF: 0x2194, 0x81F0: 0x212B,
					0x81F1: 0x2030, 0x81F2: 0x266F, 0x81F3: 0x266D, 0x81F4: 0x266A, 0x81F5: 0x2020, 0x81F6: 0x2021, 0x81F7: 0x00B6, 0x81F8: 0x266E,
					0x81F9: 0x266B, 0x81FA: 0x266C, 0x81FB: 0x2669, 0x81FC: 0x25EF, 0x8240: 0x25B7, 0x8241: 0x25B6, 0x8242: 0x25C1, 0x8243: 0x25C0,
					0x8244: 0x2197, 0x8245: 0x2198, 0x8246: 0x2196, 0x8247: 0x2199, 0x8248: 0x21C4, 0x8249: 0x21E8, 0x824A: 0x21E6, 0x824B: 0x21E7,
					0x824C: 0x21E9, 0x824D: 0x2934, 0x824E: 0x2935, 0x824F: 0x0030, 0x8250: 0x0031, 0x8251: 0x0032, 0x8252: 0x0033, 0x8253: 0x0034,
					0x8254: 0x0035, 0x8255: 0x0036, 0x8256: 0x0037, 0x8257: 0x0038, 0x8258: 0x0039, 0x8259: 0x29BF, 0x825A: 0x25C9, 0x825B: 0x303D,
					0x825C: 0xFE46, 0x825D: 0xFE45, 0x825E: 0x25E6, 0x825F: 0x2022, 0x8260: 0x0041, 0x8261: 0x0042, 0x8262: 0x0043, 0x8263: 0x0044,
					0x8264: 0x0045, 0x8265: 0x0046, 0x8266: 0x0047, 0x8267: 0x0048, 0x8268: 0x0049, 0x8269: 0x004A, 0x826A: 0x004B, 0x826B: 0x004C,
					0x826C: 0x004D, 0x826D: 0x004E, 0x826E: 0x004F, 0x826F: 0x0050, 0x8270: 0x0051, 0x8271: 0x0052, 0x8272: 0x0053, 0x8273: 0x0054,
					0x8274: 0x0055, 0x8275: 0x0056, 0x8276: 0x0057, 0x8277: 0x0058, 0x8278: 0x0059, 0x8279: 0x005A, 0x827A: 0x2213, 0x827B: 0x2135,
					0x827C: 0x210F, 0x827D: 0x33CB, 0x827E: 0x2113, 0x8280: 0x2127, 0x8281: 0x0061, 0x8282: 0x0062, 0x8283: 0x0063, 0x8284: 0x0064,
					0x8285: 0x0065, 0x8286: 0x0066, 0x8287: 0x0067, 0x8288: 0x0068, 0x8289: 0x0069, 0x828A: 0x006A, 0x828B: 0x006B, 0x828C: 0x006C,
					0x828D: 0x006D, 0x828E: 0x006E, 0x828F: 0x006F, 0x8290: 0x0070, 0x8291: 0x0071, 0x8292: 0x0072, 0x8293: 0x0073, 0x8294: 0x0074,
					0x8295: 0x0075, 0x8296: 0x0076, 0x8297: 0x0077, 0x8298: 0x0078, 0x8299: 0x0079, 0x829A: 0x007A, 0x829B: 0x30A0, 0x829C: 0x2013,
					0x829D: 0x29FA, 0x829E: 0x29FB, 0x829F: 0x3041, 0x82A0: 0x3042, 0x82A1: 0x3043, 0x82A2: 0x3044, 0x82A3: 0x3045, 0x82A4: 0x3046,
					0x82A5: 0x3047, 0x82A6: 0x3048, 0x82A7: 0x3049, 0x82A8: 0x304A, 0x82A9: 0x304B, 0x82AA: 0x304C, 0x82AB: 0x304D, 0x82AC: 0x304E,
					0x82AD: 0x304F, 0x82AE: 0x3050, 0x82AF: 0x3051, 0x82B0: 0x3052, 0x82B1: 0x3053, 0x82B2: 0x3054, 0x82B3: 0x3055, 0x82B4: 0x3056,
					0x82B5: 0x3057, 0x82B6: 0x3058, 0x82B7: 0x3059, 0x82B8: 0x305A, 0x82B9: 0x305B, 0x82BA: 0x305C, 0x82BB: 0x305D, 0x82BC: 0x305E,
					0x82BD: 0x305F, 0x82BE: 0x3060, 0x82BF: 0x3061, 0x82C0: 0x3062, 0x82C1: 0x3063, 0x82C2: 0x3064, 0x82C3: 0x3065, 0x82C4: 0x3066,
					0x82C5: 0x3067, 0x82C6: 0x3068, 0x82C7: 0x3069, 0x82C8: 0x306A, 0x82C9: 0x306B, 0x82CA: 0x306C, 0x82CB: 0x306D, 0x82CC: 0x306E,
					0x82CD: 0x306F, 0x82CE: 0x3070, 0x82CF: 0x3071, 0x82D0: 0x3072, 0x82D1: 0x3073, 0x82D2: 0x3074, 0x82D3: 0x3075, 0x82D4: 0x3076,
					0x82D5: 0x3077, 0x82D6: 0x3078, 0x82D7: 0x3079, 0x82D8: 0x307A, 0x82D9: 0x307B, 0x82DA: 0x307C, 0x82DB: 0x307D, 0x82DC: 0x307E,
					0x82DD: 0x307F, 0x82DE: 0x3080, 0x82DF: 0x3081, 0x82E0: 0x3082, 0x82E1: 0x3083, 0x82E2: 0x3084, 0x82E3: 0x3085, 0x82E4: 0x3086,
					0x82E5: 0x3087, 0x82E6: 0x3088, 0x82E7: 0x3089, 0x82E8: 0x308A, 0x82E9: 0x308B, 0x82EA: 0x308C, 0x82EB: 0x308D, 0x82EC: 0x308E,
					0x82ED: 0x308F, 0x82EE: 0x3090, 0x82EF: 0x3091, 0x82F0: 0x3092, 0x82F1: 0x3093, 0x82F2: 0x3094, 0x82F3: 0x3095, 0x82F4: 0x3096,
					0x82F5: [0x304B, 0x309A], 0x82F6: [0x304D, 0x309A], 0x82F7: [0x304F, 0x309A], 0x82F8: [0x3051, 0x309A], 0x82F9: [0x3053, 0x309A], 0x8340: 0x30A1, 0x8341: 0x30A2, 0x8342: 0x30A3,
					0x8343: 0x30A4, 0x8344: 0x30A5, 0x8345: 0x30A6, 0x8346: 0x30A7, 0x8347: 0x30A8, 0x8348: 0x30A9, 0x8349: 0x30AA, 0x834A: 0x30AB,
					0x834B: 0x30AC, 0x834C: 0x30AD, 0x834D: 0x30AE, 0x834E: 0x30AF, 0x834F: 0x30B0, 0x8350: 0x30B1, 0x8351: 0x30B2, 0x8352: 0x30B3,
					0x8353: 0x30B4, 0x8354: 0x30B5, 0x8355: 0x30B6, 0x8356: 0x30B7, 0x8357: 0x30B8, 0x8358: 0x30B9, 0x8359: 0x30BA, 0x835A: 0x30BB,
					0x835B: 0x30BC, 0x835C: 0x30BD, 0x835D: 0x30BE, 0x835E: 0x30BF, 0x835F: 0x30C0, 0x8360: 0x30C1, 0x8361: 0x30C2, 0x8362: 0x30C3,
					0x8363: 0x30C4, 0x8364: 0x30C5, 0x8365: 0x30C6, 0x8366: 0x30C7, 0x8367: 0x30C8, 0x8368: 0x30C9, 0x8369: 0x30CA, 0x836A: 0x30CB,
					0x836B: 0x30CC, 0x836C: 0x30CD, 0x836D: 0x30CE, 0x836E: 0x30CF, 0x836F: 0x30D0, 0x8370: 0x30D1, 0x8371: 0x30D2, 0x8372: 0x30D3,
					0x8373: 0x30D4, 0x8374: 0x30D5, 0x8375: 0x30D6, 0x8376: 0x30D7, 0x8377: 0x30D8, 0x8378: 0x30D9, 0x8379: 0x30DA, 0x837A: 0x30DB,
					0x837B: 0x30DC, 0x837C: 0x30DD, 0x837D: 0x30DE, 0x837E: 0x30DF, 0x8380: 0x30E0, 0x8381: 0x30E1, 0x8382: 0x30E2, 0x8383: 0x30E3,
					0x8384: 0x30E4, 0x8385: 0x30E5, 0x8386: 0x30E6, 0x8387: 0x30E7, 0x8388: 0x30E8, 0x8389: 0x30E9, 0x838A: 0x30EA, 0x838B: 0x30EB,
					0x838C: 0x30EC, 0x838D: 0x30ED, 0x838E: 0x30EE, 0x838F: 0x30EF, 0x8390: 0x30F0, 0x8391: 0x30F1, 0x8392: 0x30F2, 0x8393: 0x30F3,
					0x8394: 0x30F4, 0x8395: 0x30F5, 0x8396: 0x30F6, 0x8397: [0x30AB, 0x309A], 0x8398: [0x30AD, 0x309A], 0x8399: [0x30AF, 0x309A], 0x839A: [0x30B1, 0x309A], 0x839B: [0x30B3, 0x309A],
					0x839C: [0x30BB, 0x309A], 0x839D: [0x30C4, 0x309A], 0x839E: [0x30C8, 0x309A], 0x839F: 0x0391, 0x83A0: 0x0392, 0x83A1: 0x0393, 0x83A2: 0x0394, 0x83A3: 0x0395,
					0x83A4: 0x0396, 0x83A5: 0x0397, 0x83A6: 0x0398, 0x83A7: 0x0399, 0x83A8: 0x039A, 0x83A9: 0x039B, 0x83AA: 0x039C, 0x83AB: 0x039D,
					0x83AC: 0x039E, 0x83AD: 0x039F, 0x83AE: 0x03A0, 0x83AF: 0x03A1, 0x83B0: 0x03A3, 0x83B1: 0x03A4, 0x83B2: 0x03A5, 0x83B3: 0x03A6,
					0x83B4: 0x03A7, 0x83B5: 0x03A8, 0x83B6: 0x03A9, 0x83B7: 0x2664, 0x83B8: 0x2660, 0x83B9: 0x2662, 0x83BA: 0x2666, 0x83BB: 0x2661,
					0x83BC: 0x2665, 0x83BD: 0x2667, 0x83BE: 0x2663, 0x83BF: 0x03B1, 0x83C0: 0x03B2, 0x83C1: 0x03B3, 0x83C2: 0x03B4, 0x83C3: 0x03B5,
					0x83C4: 0x03B6, 0x83C5: 0x03B7, 0x83C6: 0x03B8, 0x83C7: 0x03B9, 0x83C8: 0x03BA, 0x83C9: 0x03BB, 0x83CA: 0x03BC, 0x83CB: 0x03BD,
					0x83CC: 0x03BE, 0x83CD: 0x03BF, 0x83CE: 0x03C0, 0x83CF: 0x03C1, 0x83D0: 0x03C3, 0x83D1: 0x03C4, 0x83D2: 0x03C5, 0x83D3: 0x03C6,
					0x83D4: 0x03C7, 0x83D5: 0x03C8, 0x83D6: 0x03C9, 0x83D7: 0x03C2, 0x83D8: 0x24F5, 0x83D9: 0x24F6, 0x83DA: 0x24F7, 0x83DB: 0x24F8,
					0x83DC: 0x24F9, 0x83DD: 0x24FA, 0x83DE: 0x24FB, 0x83DF: 0x24FC, 0x83E0: 0x24FD, 0x83E1: 0x24FE, 0x83E2: 0x2616, 0x83E3: 0x2617,
					0x83E4: 0x3020, 0x83E5: 0x260E, 0x83E6: 0x2600, 0x83E7: 0x2601, 0x83E8: 0x2602, 0x83E9: 0x2603, 0x83EA: 0x2668, 0x83EB: 0x25B1,
					0x83EC: 0x31F0, 0x83ED: 0x31F1, 0x83EE: 0x31F2, 0x83EF: 0x31F3, 0x83F0: 0x31F4, 0x83F1: 0x31F5, 0x83F2: 0x31F6, 0x83F3: 0x31F7,
					0x83F4: 0x31F8, 0x83F5: 0x31F9, 0x83F6: [0x31F7, 0x309A], 0x83F7: 0x31FA, 0x83F8: 0x31FB, 0x83F9: 0x31FC, 0x83FA: 0x31FD, 0x83FB: 0x31FE,
					0x83FC: 0x31FF, 0x8440: 0x0410, 0x8441: 0x0411, 0x8442: 0x0412, 0x8443: 0x0413, 0x8444: 0x0414, 0x8445: 0x0415, 0x8446: 0x0401,
					0x8447: 0x0416, 0x8448: 0x0417, 0x8449: 0x0418, 0x844A: 0x0419, 0x844B: 0x041A, 0x844C: 0x041B, 0x844D: 0x041C, 0x844E: 0x041D,
					0x844F: 0x041E, 0x8450: 0x041F, 0x8451: 0x0420, 0x8452: 0x0421, 0x8453: 0x0422, 0x8454: 0x0423, 0x8455: 0x0424, 0x8456: 0x0425,
					0x8457: 0x0426, 0x8458: 0x0427, 0x8459: 0x0428, 0x845A: 0x0429, 0x845B: 0x042A, 0x845C: 0x042B, 0x845D: 0x042C, 0x845E: 0x042D,
					0x845F: 0x042E, 0x8460: 0x042F, 0x8461: 0x23BE, 0x8462: 0x23BF, 0x8463: 0x23C0, 0x8464: 0x23C1, 0x8465: 0x23C2, 0x8466: 0x23C3,
					0x8467: 0x23C4, 0x8468: 0x23C5, 0x8469: 0x23C6, 0x846A: 0x23C7, 0x846B: 0x23C8, 0x846C: 0x23C9, 0x846D: 0x23CA, 0x846E: 0x23CB,
					0x846F: 0x23CC, 0x8470: 0x0430, 0x8471: 0x0431, 0x8472: 0x0432, 0x8473: 0x0433, 0x8474: 0x0434, 0x8475: 0x0435, 0x8476: 0x0451,
					0x8477: 0x0436, 0x8478: 0x0437, 0x8479: 0x0438, 0x847A: 0x0439, 0x847B: 0x043A, 0x847C: 0x043B, 0x847D: 0x043C, 0x847E: 0x043D,
					0x8480: 0x043E, 0x8481: 0x043F, 0x8482: 0x0440, 0x8483: 0x0441, 0x8484: 0x0442, 0x8485: 0x0443, 0x8486: 0x0444, 0x8487: 0x0445,
					0x8488: 0x0446, 0x8489: 0x0447, 0x848A: 0x0448, 0x848B: 0x0449, 0x848C: 0x044A, 0x848D: 0x044B, 0x848E: 0x044C, 0x848F: 0x044D,
					0x8490: 0x044E, 0x8491: 0x044F, 0x8492: 0x30F7, 0x8493: 0x30F8, 0x8494: 0x30F9, 0x8495: 0x30FA, 0x8496: 0x22DA, 0x8497: 0x22DB,
					0x8498: 0x2153, 0x8499: 0x2154, 0x849A: 0x2155, 0x849B: 0x2713, 0x849C: 0x2318, 0x849D: 0x2423, 0x849E: 0x23CE, 0x849F: 0x2500,
					0x84A0: 0x2502, 0x84A1: 0x250C, 0x84A2: 0x2510, 0x84A3: 0x2518, 0x84A4: 0x2514, 0x84A5: 0x251C, 0x84A6: 0x252C, 0x84A7: 0x2524,
					0x84A8: 0x2534, 0x84A9: 0x253C, 0x84AA: 0x2501, 0x84AB: 0x2503, 0x84AC: 0x250F, 0x84AD: 0x2513, 0x84AE: 0x251B, 0x84AF: 0x2517,
					0x84B0: 0x2523, 0x84B1: 0x2533, 0x84B2: 0x252B, 0x84B3: 0x253B, 0x84B4: 0x254B, 0x84B5: 0x2520, 0x84B6: 0x252F, 0x84B7: 0x2528,
					0x84B8: 0x2537, 0x84B9: 0x253F, 0x84BA: 0x251D, 0x84BB: 0x2530, 0x84BC: 0x2525, 0x84BD: 0x2538, 0x84BE: 0x2542, 0x84BF: 0x3251,
					0x84C0: 0x3252, 0x84C1: 0x3253, 0x84C2: 0x3254, 0x84C3: 0x3255, 0x84C4: 0x3256, 0x84C5: 0x3257, 0x84C6: 0x3258, 0x84C7: 0x3259,
					0x84C8: 0x325A, 0x84C9: 0x325B, 0x84CA: 0x325C, 0x84CB: 0x325D, 0x84CC: 0x325E, 0x84CD: 0x325F, 0x84CE: 0x32B1, 0x84CF: 0x32B2,
					0x84D0: 0x32B3, 0x84D1: 0x32B4, 0x84D2: 0x32B5, 0x84D3: 0x32B6, 0x84D4: 0x32B7, 0x84D5: 0x32B8, 0x84D6: 0x32B9, 0x84D7: 0x32BA,
					0x84D8: 0x32BB, 0x84D9: 0x32BC, 0x84DA: 0x32BD, 0x84DB: 0x32BE, 0x84DC: 0x32BF, 0x84E5: 0x25D0, 0x84E6: 0x25D1, 0x84E7: 0x25D2,
					0x84E8: 0x25D3, 0x84E9: 0x203C, 0x84EA: 0x2047, 0x84EB: 0x2048, 0x84EC: 0x2049, 0x84ED: 0x01CD, 0x84EE: 0x01CE, 0x84EF: 0x01D0,
					0x84F0: 0x1E3E, 0x84F1: 0x1E3F, 0x84F2: 0x01F8, 0x84F3: 0x01F9, 0x84F4: 0x01D1, 0x84F5: 0x01D2, 0x84F6: 0x01D4, 0x84F7: 0x01D6,
					0x84F8: 0x01D8, 0x84F9: 0x01DA, 0x84FA: 0x01DC, 0x8540: 0x20AC, 0x8541: 0x00A0, 0x8542: 0x00A1, 0x8543: 0x00A4, 0x8544: 0x00A6,
					0x8545: 0x00A9, 0x8546: 0x00AA, 0x8547: 0x00AB, 0x8548: 0x00AD, 0x8549: 0x00AE, 0x854A: 0x00AF, 0x854B: 0x00B2, 0x854C: 0x00B3,
					0x854D: 0x00B7, 0x854E: 0x00B8, 0x854F: 0x00B9, 0x8550: 0x00BA, 0x8551: 0x00BB, 0x8552: 0x00BC, 0x8553: 0x00BD, 0x8554: 0x00BE,
					0x8555: 0x00BF, 0x8556: 0x00C0, 0x8557: 0x00C1, 0x8558: 0x00C2, 0x8559: 0x00C3, 0x855A: 0x00C4, 0x855B: 0x00C5, 0x855C: 0x00C6,
					0x855D: 0x00C7, 0x855E: 0x00C8, 0x855F: 0x00C9, 0x8560: 0x00CA, 0x8561: 0x00CB, 0x8562: 0x00CC, 0x8563: 0x00CD, 0x8564: 0x00CE,
					0x8565: 0x00CF, 0x8566: 0x00D0, 0x8567: 0x00D1, 0x8568: 0x00D2, 0x8569: 0x00D3, 0x856A: 0x00D4, 0x856B: 0x00D5, 0x856C: 0x00D6,
					0x856D: 0x00D8, 0x856E: 0x00D9, 0x856F: 0x00DA, 0x8570: 0x00DB, 0x8571: 0x00DC, 0x8572: 0x00DD, 0x8573: 0x00DE, 0x8574: 0x00DF,
					0x8575: 0x00E0, 0x8576: 0x00E1, 0x8577: 0x00E2, 0x8578: 0x00E3, 0x8579: 0x00E4, 0x857A: 0x00E5, 0x857B: 0x00E6, 0x857C: 0x00E7,
					0x857D: 0x00E8, 0x857E: 0x00E9, 0x8580: 0x00EA, 0x8581: 0x00EB, 0x8582: 0x00EC, 0x8583: 0x00ED, 0x8584: 0x00EE, 0x8585: 0x00EF,
					0x8586: 0x00F0, 0x8587: 0x00F1, 0x8588: 0x00F2, 0x8589: 0x00F3, 0x858A: 0x00F4, 0x858B: 0x00F5, 0x858C: 0x00F6, 0x858D: 0x00F8,
					0x858E: 0x00F9, 0x858F: 0x00FA, 0x8590: 0x00FB, 0x8591: 0x00FC, 0x8592: 0x00FD, 0x8593: 0x00FE, 0x8594: 0x00FF, 0x8595: 0x0100,
					0x8596: 0x012A, 0x8597: 0x016A, 0x8598: 0x0112, 0x8599: 0x014C, 0x859A: 0x0101, 0x859B: 0x012B, 0x859C: 0x016B, 0x859D: 0x0113,
					0x859E: 0x014D, 0x859F: 0x0104, 0x85A0: 0x02D8, 0x85A1: 0x0141, 0x85A2: 0x013D, 0x85A3: 0x015A, 0x85A4: 0x0160, 0x85A5: 0x015E,
					0x85A6: 0x0164, 0x85A7: 0x0179, 0x85A8: 0x017D, 0x85A9: 0x017B, 0x85AA: 0x0105, 0x85AB: 0x02DB, 0x85AC: 0x0142, 0x85AD: 0x013E,
					0x85AE: 0x015B, 0x85AF: 0x02C7, 0x85B0: 0x0161, 0x85B1: 0x015F, 0x85B2: 0x0165, 0x85B3: 0x017A, 0x85B4: 0x02DD, 0x85B5: 0x017E,
					0x85B6: 0x017C, 0x85B7: 0x0154, 0x85B8: 0x0102, 0x85B9: 0x0139, 0x85BA: 0x0106, 0x85BB: 0x010C, 0x85BC: 0x0118, 0x85BD: 0x011A,
					0x85BE: 0x010E, 0x85BF: 0x0143, 0x85C0: 0x0147, 0x85C1: 0x0150, 0x85C2: 0x0158, 0x85C3: 0x016E, 0x85C4: 0x0170, 0x85C5: 0x0162,
					0x85C6: 0x0155, 0x85C7: 0x0103, 0x85C8: 0x013A, 0x85C9: 0x0107, 0x85CA: 0x010D, 0x85CB: 0x0119, 0x85CC: 0x011B, 0x85CD: 0x010F,
					0x85CE: 0x0111, 0x85CF: 0x0144, 0x85D0: 0x0148, 0x85D1: 0x0151, 0x85D2: 0x0159, 0x85D3: 0x016F, 0x85D4: 0x0171, 0x85D5: 0x0163,
					0x85D6: 0x02D9, 0x85D7: 0x0108, 0x85D8: 0x011C, 0x85D9: 0x0124, 0x85DA: 0x0134, 0x85DB: 0x015C, 0x85DC: 0x016C, 0x85DD: 0x0109,
					0x85DE: 0x011D, 0x85DF: 0x0125, 0x85E0: 0x0135, 0x85E1: 0x015D, 0x85E2: 0x016D, 0x85E3: 0x0271, 0x85E4: 0x028B, 0x85E5: 0x027E,
					0x85E6: 0x0283, 0x85E7: 0x0292, 0x85E8: 0x026C, 0x85E9: 0x026E, 0x85EA: 0x0279, 0x85EB: 0x0288, 0x85EC: 0x0256, 0x85ED: 0x0273,
					0x85EE: 0x027D, 0x85EF: 0x0282, 0x85F0: 0x0290, 0x85F1: 0x027B, 0x85F2: 0x026D, 0x85F3: 0x025F, 0x85F4: 0x0272, 0x85F5: 0x029D,
					0x85F6: 0x028E, 0x85F7: 0x0261, 0x85F8: 0x014B, 0x85F9: 0x0270, 0x85FA: 0x0281, 0x85FB: 0x0127, 0x85FC: 0x0295, 0x8640: 0x0294,
					0x8641: 0x0266, 0x8642: 0x0298, 0x8643: 0x01C2, 0x8644: 0x0253, 0x8645: 0x0257, 0x8646: 0x0284, 0x8647: 0x0260, 0x8648: 0x0193,
					0x8649: 0x0153, 0x864A: 0x0152, 0x864B: 0x0268, 0x864C: 0x0289, 0x864D: 0x0258, 0x864E: 0x0275, 0x864F: 0x0259, 0x8650: 0x025C,
					0x8651: 0x025E, 0x8652: 0x0250, 0x8653: 0x026F, 0x8654: 0x028A, 0x8655: 0x0264, 0x8656: 0x028C, 0x8657: 0x0254, 0x8658: 0x0251,
					0x8659: 0x0252, 0x865A: 0x028D, 0x865B: 0x0265, 0x865C: 0x02A2, 0x865D: 0x02A1, 0x865E: 0x0255, 0x865F: 0x0291, 0x8660: 0x027A,
					0x8661: 0x0267, 0x8662: 0x025A, 0x8663: [0x00E6, 0x0300], 0x8664: 0x01FD, 0x8665: [0x0251, 0x0300], 0x8666: [0x0251, 0x0301], 0x8667: [0x0254, 0x0300], 0x8668: [0x0254, 0x0301],
					0x8669: [0x028C, 0x0300], 0x866A: [0x028C, 0x0301], 0x866B: [0x0259, 0x0300], 0x866C: [0x0259, 0x0301], 0x866D: [0x025A, 0x0300], 0x866E: [0x025A, 0x0301], 0x866F: [0x025B, 0x0300], 0x8670: [0x025B, 0x0301],
					0x8671: 0x0361, 0x8672: 0x02C8, 0x8673: 0x02CC, 0x8674: 0x02D0, 0x8675: 0x02D1, 0x8676: 0x0306, 0x8677: 0x203F, 0x8678: 0x030B,
					0x8679: 0x0301, 0x867A: 0x0304, 0x867B: 0x0300, 0x867C: 0x030F, 0x867D: 0x030C, 0x867E: 0x0302, 0x8680: 0x02E5, 0x8681: 0x02E6,
					0x8682: 0x02E7, 0x8683: 0x02E8, 0x8684: 0x02E9, 0x8685: [0x02E9, 0x02E5], 0x8686: [0x02E5, 0x02E9], 0x8687: 0x0325, 0x8688: 0x032C, 0x8689: 0x0339,
					0x868A: 0x031C, 0x868B: 0x031F, 0x868C: 0x0320, 0x868D: 0x0308, 0x868E: 0x033D, 0x868F: 0x0329, 0x8690: 0x032F, 0x8691: 0x02DE,
					0x8692: 0x0324, 0x8693: 0x0330, 0x8694: 0x033C, 0x8695: 0x0334, 0x8696: 0x031D, 0x8697: 0x031E, 0x8698: 0x0318, 0x8699: 0x0319,
					0x869A: 0x032A, 0x869B: 0x033A, 0x869C: 0x033B, 0x869D: 0x0303, 0x869E: 0x031A, 0x869F: 0x2776, 0x86A0: 0x2777, 0x86A1: 0x2778,
					0x86A2: 0x2779, 0x86A3: 0x277A, 0x86A4: 0x277B, 0x86A5: 0x277C, 0x86A6: 0x277D, 0x86A7: 0x277E, 0x86A8: 0x277F, 0x86A9: 0x24EB,
					0x86AA: 0x24EC, 0x86AB: 0x24ED, 0x86AC: 0x24EE, 0x86AD: 0x24EF, 0x86AE: 0x24F0, 0x86AF: 0x24F1, 0x86B0: 0x24F2, 0x86B1: 0x24F3,
					0x86B2: 0x24F4, 0x86B3: 0x2170, 0x86B4: 0x2171, 0x86B5: 0x2172, 0x86B6: 0x2173, 0x86B7: 0x2174, 0x86B8: 0x2175, 0x86B9: 0x2176,
					0x86BA: 0x2177, 0x86BB: 0x2178, 0x86BC: 0x2179, 0x86BD: 0x217A, 0x86BE: 0x217B, 0x86BF: 0x24D0, 0x86C0: 0x24D1, 0x86C1: 0x24D2,
					0x86C2: 0x24D3, 0x86C3: 0x24D4, 0x86C4: 0x24D5, 0x86C5: 0x24D6, 0x86C6: 0x24D7, 0x86C7: 0x24D8, 0x86C8: 0x24D9, 0x86C9: 0x24DA,
					0x86CA: 0x24DB, 0x86CB: 0x24DC, 0x86CC: 0x24DD, 0x86CD: 0x24DE, 0x86CE: 0x24DF, 0x86CF: 0x24E0, 0x86D0: 0x24E1, 0x86D1: 0x24E2,
					0x86D2: 0x24E3, 0x86D3: 0x24E4, 0x86D4: 0x24E5, 0x86D5: 0x24E6, 0x86D6: 0x24E7, 0x86D7: 0x24E8, 0x86D8: 0x24E9, 0x86D9: 0x32D0,
					0x86DA: 0x32D1, 0x86DB: 0x32D2, 0x86DC: 0x32D3, 0x86DD: 0x32D4, 0x86DE: 0x32D5, 0x86DF: 0x32D6, 0x86E0: 0x32D7, 0x86E1: 0x32D8,
					0x86E2: 0x32D9, 0x86E3: 0x32DA, 0x86E4: 0x32DB, 0x86E5: 0x32DC, 0x86E6: 0x32DD, 0x86E7: 0x32DE, 0x86E8: 0x32DF, 0x86E9: 0x32E0,
					0x86EA: 0x32E1, 0x86EB: 0x32E2, 0x86EC: 0x32E3, 0x86ED: 0x32FA, 0x86EE: 0x32E9, 0x86EF: 0x32E5, 0x86F0: 0x32ED, 0x86F1: 0x32EC,
					0x86FB: 0x2051, 0x86FC: 0x2042, 0x8740: 0x2460, 0x8741: 0x2461, 0x8742: 0x2462, 0x8743: 0x2463, 0x8744: 0x2464, 0x8745: 0x2465,
					0x8746: 0x2466, 0x8747: 0x2467, 0x8748: 0x2468, 0x8749: 0x2469, 0x874A: 0x246A, 0x874B: 0x246B, 0x874C: 0x246C, 0x874D: 0x246D,
					0x874E: 0x246E, 0x874F: 0x246F, 0x8750: 0x2470, 0x8751: 0x2471, 0x8752: 0x2472, 0x8753: 0x2473, 0x8754: 0x2160, 0x8755: 0x2161,
					0x8756: 0x2162, 0x8757: 0x2163, 0x8758: 0x2164, 0x8759: 0x2165, 0x875A: 0x2166, 0x875B: 0x2167, 0x875C: 0x2168, 0x875D: 0x2169,
					0x875E: 0x216A, 0x875F: 0x3349, 0x8760: 0x3314, 0x8761: 0x3322, 0x8762: 0x334D, 0x8763: 0x3318, 0x8764: 0x3327, 0x8765: 0x3303,
					0x8766: 0x3336, 0x8767: 0x3351, 0x8768: 0x3357, 0x8769: 0x330D, 0x876A: 0x3326, 0x876B: 0x3323, 0x876C: 0x332B, 0x876D: 0x334A,
					0x876E: 0x333B, 0x876F: 0x339C, 0x8770: 0x339D, 0x8771: 0x339E, 0x8772: 0x338E, 0x8773: 0x338F, 0x8774: 0x33C4, 0x8775: 0x33A1,
					0x8776: 0x216B, 0x877E: 0x337B, 0x8780: 0x301D, 0x8781: 0x301F, 0x8782: 0x2116, 0x8783: 0x33CD, 0x8784: 0x2121, 0x8785: 0x32A4,
					0x8786: 0x32A5, 0x8787: 0x32A6, 0x8788: 0x32A7, 0x8789: 0x32A8, 0x878A: 0x3231, 0x878B: 0x3232, 0x878C: 0x3239, 0x878D: 0x337E,
					0x878E: 0x337D, 0x878F: 0x337C, 0x8793: 0x222E, 0x8798: 0x221F, 0x8799: 0x22BF, 0x879D: 0x2756, 0x879E: 0x261E
				};

				/**
				 * 漢字の2バイト文字（0x879f-0xffff）の変換マップ作成用の文字列
				 *
				 * @type {string}
				 */
				// prettier-ignore
				const map = [
					"俱𠀋㐂丨丯丰亍仡份仿伃伋你佈佉佖佟佪佬佾侊侔侗侮俉俠倁倂倎倘倧倮偀倻偁傔僌僲僐僦僧儆儃儋儞儵兊免兕兗㒵冝凃凊凞凢凮刁㓛刓刕剉剗剡劓勈勉勌勐勖勛勤勰勻匀匇匜卑卡卣卽厓厝厲吒吧呍咜呫呴呿咈咖咡67",
					"咩哆哿唎唫唵啐啞喁喆喎喝喭嗎嘆嘈嘎嘻噉噶噦器噯噱噲嚙嚞嚩嚬嚳囉囊圊𡈽圡圯圳圴坰坷坼垜﨏𡌛垸埇埈埏埤埭埵埶埿堉塚塡塤塀塼墉增墨墩1𡑮壒壎壔壚壠壩夌虁奝奭妋妒妤姃姒姝娓娣婧婭婷婾媄媞媧嫄𡢽嬙嬥剝亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭67",
					"院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円1園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改67",
					"魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫1橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄67",
					"機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救1朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈67",
					"掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨1劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向67",
					"后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降1項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷67",
					"察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止1死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周67",
					"宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳1準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾67",
					"拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨1逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線67",
					"繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻1操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只67",
					"叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄1逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓67",
					"邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬1凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入67",
					"如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅1楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美67",
					"鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷1斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋67",
					"法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆1摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒67",
					"諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲1沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯67",
					"蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕𠮟孁孖孽宓寘寬尒尞尣尫㞍1屢層屮𡚴屺岏岟岣岪岺峋峐峒峴𡸴㟢崍崧﨑嵆嵇嵓嵊嵭嶁嶠嶤嶧嶸巋吞弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲67",
					"僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭1凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨67",
					"咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸1噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩67",
					"奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀1它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏67",
					"廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠1怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛67",
					"戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫1捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼67",
					"曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎1梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣67",
					"檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯1麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌16451",
					"漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝1烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱67",
					"瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿1痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬67",
					"磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰1窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆67",
					"紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷1縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋67",
					"隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤1艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈67",
					"蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬1蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞67",
					"襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧1諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊67",
					"蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜1轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮67",
					"錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙1閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰67",
					"顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃1騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈67",
					"鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯1黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙噓巢帔帘幘幞庾廊廋廹开异弇弝弣弴弶弽彀彅彔彘彤彧彽徉徜徧徯徵德忉忞忡忩怍怔怘怳怵恇悔悝悞惋惔惕惝惸愜愫愰愷慨憍憎憼憹懲戢戾扃扖扚扯抅拄拖拼挊挘挹捃捥捼揥揭揵搐搔搢摹摑摠摭擎撾撿67",
					"擄擊擐擷擻攢攩敏敧斝既昀昉昕昞昺昢昤昫昰昱昳曻晈晌𣇄晙晚晡晥晳晷晸暍暑暠暲暻曆曈㬢曛曨曺朓朗朳杦杇杈杻极枓枘枛枻柹柀柗柼栁桒栝1栬栱桛桲桵梅梣梥梲棈棐棨棭棰棱棼椊楉𣗄椵楂楗楣楤楨榀﨔榥榭槏㮶㯃槢槩槪槵槶樏樕𣜿樻樾橅橐橖橛橫橳𣝣檉檔檝檞檥櫤櫧㰏欄欛欞欬欵歆歖歠步歧歷殂殩殭殺每毖毗毿氅氐氳汙汜沪汴汶沅沆沘沜泻泆泔泠泫泮𣳾洄洎洮洱洹洿浘浥海涂涇涉涔涪涬涿淄淖淚淛淝淼渚渴湄湜湞溫溱滁67",
					"滇滎漐漚漢漪漯漳潑潙潞潡潢潾澈澌澍澔澠澧澶澼濇濊濹濰濵瀅瀆瀨灊灝灞灎灤灵炅炤炫炷烔烘烤焏焫焞焠焮焰煆煇煑煮煒煜煠煨凞熅熇熒燁熺1燄燾爀爕牕牖㸿犍犛犾狀狻𤟱猧猨猪獐獦獼玕玟玠玢玦玫珉珏珖珙珣珩琇琊琚琛琢琦琨琪琫琬琮琯琰瑄瑆瑇瑋瑗瑢瑫瑭璆璇璉璘璜璟璣璐璦璨璩璵璿瓈瓉瓚瓿甁甗甯畯畹疒㽲痎痤瘀瘂瘈瘕瘖瘙瘞瘭瘵癃癋癤癥癭癯癱皁皛皝皞皦皪皶盅盌盎盔盦盱盼眊眙眴眶睆睍睎睜睟睢睺瞀瞔瞪矠砭𥒎67",
					"硃硎硏硑硨确碑碰𥔎碭磤磲礀磷礜礮礱礴社祉祅祆祈祐祖祜祝神祥祹禍禎福禘禱禸秈秊𥝱秔秞秫秭稃穀稹穝穭突窅窠𥧄窳窻竎竫竽笒笭笻筇筎筠1筭筯筲箞節篗篙簁簱簞簠簳簶䉤𥶡籙籭籹粏粔粠粼糕糙糝紇紈紓紝紣紱絁絈絓絜絺綃綋綠綦緂緌緖緣練縨縈縑縕繁繇繒繡纊纍罇署羑羗羿翎翛翟翬翮翺者耔耦耵耷耼胊胗胠胳脘腊腠腧腨腭膻臊臏臗臭䑓䑛艠艴𦫿芎芡芣芤芩芮芷芾芿苆苕苽苾茀茁荢茢茭茺荃荇荑荕荽莆莒莘莧莩莿菀菇菏67",
					"菑菡菪萁萆萊著葈葟葰葳蒅蒞蒯蒴蒺蓀蓂𦹀蔲蔞蔣蔯蕙蕤﨟薭蕺薌薏薢薰藋藎藭蘒藿蘄蘅蘐𧃴蘘蘩蘸虗虛虜虢䖝虬虵蚘蚸蛺蛼蛽蜋蝱螇螈螬螭螵1䗪蟖蟬蠆蠊蠐蠔蠟袘袪裊裎𧚄裵褜褐褘褙褚褧褰褲褹襀覔視觔觥觶訒訕訢訷詇詎詝詡詵詹誧諐諟諴諶諸謁謹譆譔譙譩讝豉豨賓賡賴賸賾贈贒贛趯跎跑跗踠踣踽蹰蹻𨉷軀䡄軺輞輭輶轔𨏍辦辵迤迨迮逈逭逸邈邕邗邙邛邢邳邾郄郅郇郗郝郞郯郴都鄔鄕鄖鄢鄣鄧鄯鄱鄴鄽酈酛醃醞醬醱醼釗釻釤67",
					"釥釭釱鈇鈐鈸鈹鈺鈼鉀鉃鉏鉸銈鋂鋋鋌鋓鋠鋿錄錟錡錥鍈鍉鍊鍤鍥鍪鍰鎛鎣鎺鏆鏞鏟鐄鏽鐳鑊鑣鑫鑱鑲閎閟閦閩閬閶閽闋闐闓䦰闚闞陘隄隆隝隤1隥雒雞難雩雯霳霻靍靎靏靚靮靳鞕鞮鞺韁韉韞韛韴響頊頞頫頰頻顒顓顖顗顙顚類顥顬颺飈飧饘馞騂騃騤騭騮騸驊驎驒骶髁髃髎髖髹鬂鬈鬠䰗鬭魞魹魦魲魵鮄鮊鮏鮞鮧鯁鯎鯥鯸鯽鰀鰣鱁鱏鱐鱓鱣鱥鱷鴝鴞鵃鵇鵒鵣鵰鵼鶊鶖鷀鶬鶼鷗𪆐鷧鸇鸕鹼麞麤麬麯麴麵黃黑鼐鼹齗龐龔龗龢姸屛幷瘦繫67",
					"𠂉丂丏丒丩丫丮乀乇么𠂢乑㐆𠂤乚乩亝㐬㐮亹亻𠆢亼仃仈仐仫仚仱仵伀伖佤伷伾佔佘𠈓佷佸佺佽侂侅侒侚俦侲侾俅俋俏俒㑪俲倀倐倓倜倞倢㑨偂1偆偎偓偗偣偦偪偰傣傈傒傓傕傖傜傪𠌫傱傺傻僄僇僳𠎁僎𠍱僔僙僡僩㒒宖宬㝡寀㝢寎寖㝬㝫寱寽㝵尃尩尰𡱖屟屣屧屨屩屰𡴭𡵅屼𡵸𡵢岈岊㟁𡶡𡶜岠岢岦岧𡶒岭岵𡶷峉𡷠𡸳崆崐崫崝崠崤崦崱崹嵂㟨嵡嵪㟴嵰𡼞㟽嶈㠀嶒嶔嶗嶙嶰嶲嶴𡽶嶹巑巗巘巠𡿺巤巩㠯帀㠶帒帕㡀帟帮帾幉㡜幖㡡幫幬幭67",
					"儈𠏹儗儛𠑊兠𠔉关冃冋㒼冘冣冭㓇冼𠗖𠘨凳凴刂划刖𠝏剕剜剬剷劄劂𠠇劘𠠺劤劦劯劺劻勊㔟勑𠢹勷匊匋匤匵匾卂𠥼𠦝卧卬卺厤厴𠫓厷叀𠬝㕝㕞叕1叚㕣叴叵呕吤吨㕮呃呢呦呬咊咍咕咠咦咭咮咷咺咿哃𠵅哬哯哱哳唀唁唉唼啁㖦啇啊㖨啠啡啤𠷡啽喂喈喑㗅嗒𠺕𠹭喿嗉嗌嗑嗝㗚嗢𠹤嗩嘨𠽟嘇嘐嘰嘷㗴嘽嘿噀噇噞噠噭㘅嚈嚌嚕嚚嚝嚨嚭嚲囅囍囟囨囶囷𡈁圕圣𡉕圩𡉻坅坆坌坍𡉴坨坯坳坴坵坻𡋤𡋗垬垚垝垞垨埗𡋽埌𡌶𡍄埞埦埰㙊埸埻埽堄堞67",
					"堠堧堲堹𡏄塉塌塧墊墋墍墏墐墔墝墪墱𡑭壃壍壢壳壴夅夆夋复夔夤𡗗㚑夽㚙奆㚖𦰩奛奟𡙇奵奶奼妟妮妼姈姍姞姣姤姧姮𡜆𡝂㛏娌娍娗娧娭婕婥婺1媋媜媟媠媢媱媳媵媺媿嫚嫜嫠嫥嫰嫮嫵嬀嬈嬗嬴嬭孌孒孨孯孼孿宁宄𡧃幮𢅻庥庪庬庹庿廆廒廙𢌞廽弈弎弜𢎭弞彇彣彲彾徏徢徤徸忄㣺忇忋忒忓忔忢忮忯忳忼㤗怗怢怤㤚恌恿悊悕您𢛳悰悱悾惈惙惛惮惲惵愐愒愓愙愞愺㥯慁慆慠慼𢡛憒憓憗憘憥憨憭𢢫懕懝懟懵𢦏戕戣戩扆扌扑扒扡扤扻扭扳67",
					"抙抦拕𢪸拽挃挍挐𢭏𢭐挲挵挻挼捁捄捎𢭆捙𢰝𢮦捬掄掙𢰤掔掽揷揔揕揜揠揫揬揲搉搞搥搩搯摚摛摝摳摽撇撑撝撟擋擌擕擗𢷡擤擥擿攄㩮攏攔攖㩳1攞攲敄敔敫敺斁斄斅斊斲斵斸斿旂旉旔㫖旲旹旼昄昈昡昪晅晑晎㫪𣇃晗晛晣𣇵𣆶晪晫晬晭晻暀暐暒暙㬎暭暱暵㬚暿㬜曬㫗朁朅朒𣍲朙𣏓𣏒杌杍杔杝𣏐𣏤𣏕杴杶𣏚枒𣏟荣栐枰枲柃柈柒柙柛柰柷𣑊𣑑𣑋栘栟栭𣑥栳栻栾桄桅桉桌桕桗㭷桫桮桺桼梂梐梖㭭梘梙梚梜梪梫梴梻棻𣓤𣕚﨓棃棅棌棏棖67",
					"棙棤棥棬棷椃椇㮇㮈𣖔椻㮍楆楩楬楲楺楿榒㮤榖榘榦榰榷榺榼槀槑槖𣘹𣙇樰𣘸𣘺槣槮槯槳㯍槴槾樑樚樝𣜜樲樳樴樿橆橉橺橎橒橤𣜌橾檃檋㯰檑檟1檡𣝤檫檽櫆櫔櫐櫜櫝𣟿𣟧櫬櫱櫲櫳櫽𣠤欋欏欐欑𣠽欗㰦欯歊歘歬歵歺殁殛殮𣪘殽殾毇毈毉毚毦毧毮毱氂氊氎氵氶氺𣱿氿汍汛汭沄沉㳃沔沕沗沭泂泐㳒泖泚泜泩泬泭𣴀洀洊洤洦洧汧洯洼浛浞浠浰涀涁涊涍涑涘𣵀渗𣷺𣷹𣷓涫涮涴淂洴淈淎淏淐淟淩淶渶渞渢渧㴑渲渼湈湉湋湌湏湑湓湔湗湣㴞67",
					"溓溧溴溿滃滊滙漵滫滹滻漊漌漘漥漶漼𣽾潒潗潚潠潨澘潽澐澖澾澟澥澯㵤澵濈濉濚濞濩𤂖濼瀀瀇瀊瀣𤄃瀹瀺瀼灃灇灋㶚灔灥灩灬灮灶灾炁炆炕炗1炻𤇆炟炱𤇾烬烊烑烓烜焃焄焆焇焈焌㷀焯焱煐煊煓煞㷔熖熀熛熠熢熮熯熳𤎼燋燓燙燜爇㸅爫爫爴爸爹丬牂牓牗牣𤘩牮牯牸牿犎𤚥犭犮犰犱狁㹠狌㹦㹨狳狺猇猒猘猙㺃猹猬猱猳猽獒㺔獫獬𤢖獮獯獱獷玁玅玊玔玘玜玞玥玨玵玷玹玼玿珅珋珡珧珹琓珺琁琤琱琹瑓瑀瑃瑍瑒瑝瑱璁璅璈𤩍璒璗璙67",
					"璠璡璥璪璫璹璻璺瓖瓘瓞瓯瓫𤭖瓺𤭯甠甤甪㽗𤰖甽甾畀畈畎畐畒畬畲畱畺畽畾疁𤴔疌㽵疢㽷疰疷疿痀痆痏痓痝痟痠痧痬痮痱痹瘃瘘瘇瘏㾮𤸎瘓瘛1瘜𤸷瘥瘨瘼瘳𤹪㿉癁𤺋癉癕㿗癮皕皜皡皠皧皨皯𥁊盉𥁕盨盬𥄢眗眚眭眵𥆩䀹𥇥𥇍睘睠睪𥈞睲睼睽𥉌䁘瞚瞟瞢瞤瞩矞矟矤矦矪矬䂓矰矴矻𥐮砅砆砉砍砙砡砬硇硤硪𥓙碊碔碤碝碞碟碻磈磌磎磕磠磡磦磹磺磻磾𥖧礐礛礰礥礻祊祘祛䄅祧祲禔禕禖禛禡禩禴离秂秇秌种秖䅈𥞩𥞴䅏稊稑稕稛稞䅣稭67",
					"稸穇穌穖穙穜穟穠穧穪穵穸窂窊窐窣窬𥧔䆴窹窼窾䆿竌竑竧竨竴𥫤𥫣笇𥫱笽笧笪笮笯笱䇦䇳筿筁䇮筕筹筤筦筩筳𥮲䈇箐箑箛䈎箯箵箼篅篊𥱋𥱤篔1篖篚篪篰簃簋簎簏簦籅籊籑籗籞籡籩籮籯籰𥸮𥹖𥹥粦𥹢粶粷粿𥻘糄𥻂糈糍𥻨糗𥼣糦糫𥽜糵紃紉䋆紒紞𥿠𥿔紽紾絀絇𦀌𥿻䋖絙絚絪絰䋝絿𦀗綆綈綌綗𦁠綝綧綪綶綷緀緗緙緦緱緹䌂𦃭縉縐縗縝縠縧縬繅繳繵繾纆纇䌫纑纘纚䍃缼缻缾罃罄罏㓁𦉰罒𦊆罡罣罤罭罽罾𦍌羐养𣴎羖羜羭𦐂翃翏翣翥翯67",
					"翲耂耊耈耎耑耖耤耬耰聃聦聱聵聻肙肜肤肧肸𦙾胅胕胘胦𦚰脍胵胻䏮脵脖脞䏰脤脧脬𦜝脽䐈腩䐗膁䐜膄膅䐢膘膲臁臃臖臛𦣝臤𦣪臬𦥑臽臿𦥯舄𦧝1舙舡舢𦨞舲舴舼艆艉艅𦩘艋䑶艏䑺艗𦪌艜艣𦪷艹艹艹䒑艽艿芃芊芓芧芨芲芴芺芼苢苨苷茇茈茌荔茛茝茰茼荄荗䒾荿䓔䒳莍莔莕莛莝菉菐菔菝菥菹萏萑萕𦱳萗萹葊葏葑葒葙葚葜𦳝葥葶葸葼蒁䔍蓜蒗蒦蒾䔈蓎蓏蓓𦹥蓧蓪蓯蓰蓱蓺蓽蔌蔛蔤蔥蔫蔴蕏蕯䔥䕃蔾蕑蕓蕞蕡蕢𦾔蕻蕽蕿薁薆薓薝薟𦿸67",
					"𦿶𦿷薷薼藇藊藘藙藟藡藦藶蘀蘑蘞蘡蘤蘧𧄍蘹蘼𧄹虀蘒虓虖虯虷虺蚇蚉蚍蚑蚜蚝蚨﨡蚱蚳蛁蛃蛑蛕蛗蛣蛦䖸蜅蜇蜎蜐蜓蜙蜟蜡蜣蜱蜺蜾蝀蝃蝑蝘1蝤蝥蝲蝼𧏛𧏚螧螉螋螓螠𧏾䗥螾𧐐蟁蟎蟵蟟𧑉蟣蟥蟦蟪蟫蟭蠁蠃蠋蠓蠨蠮蠲蠼䘏衊衘衟衤𧘕𧘔衩𧘱衯袠袼袽袾裀裒𧚓裑裓裛裰裱䙁褁𧜎褷𧜣襂襅襉𧝒䙥襢覀覉覐覟覰覷觖觘觫䚡觱觳觽觿䚯訑訔𧦅訡訵訾詅詍詘誮誐誷誾諗諼𧪄謊謅謍謜謟謭譃䜌譑譞譶譿讁讋讔讕讜讞谹𧮳谽𧮾𧯇豅豇豏豔67",
					"豗豩豭豳𧲸貓貒貙䝤貛貤賖賕賙𧶠賰賱𧸐贉贎赬趄趕趦𧾷跆跈跙跬踌䟽跽踆𨂊踔踖踡踢踧𨂻䠖踶踹蹋蹔蹢蹬蹭蹯躘躞躮躳躵躶躻𨊂軑軔䡎軹𨋳輀1輈輗輫轀轊轘𨐌辤辴辶辶𨑕迁迆﨤迊迍迓迕迠迱迵迻适逌逷𨕫遃遄遝𨗈𨗉邅邌邐阝邡䢵邰邶郃郈𨛗郜郟𨛺郶郲鄀郫郾郿鄄鄆鄘鄜鄞鄷鄹鄺酆酇酗酙酡酤酴酹醅醎醨醮醳醶釃釄釚𨥉𨥆釬釮鈁鈊鈖鈗𨥫鈳鉂鉇鉊鉎鉑鉖鉙鉠鉡鉥鉧鉨𨦇𨦈鉼鉽鉿銉銍銗銙銟銧銫𨦺𨦻銲銿鋀鋆鋎鋐鋗鋙鋥鋧錑𨨞67",
					"𨨩鋷鋹鋻錂錍錕錝錞錧錩𨩱𨩃鍇鍑鍗鍚鍫鍱鍳鎡𨪙𨫍鎈鎋鎏鎞鏵𨫤𨫝鏱鏁鏇鏜鏢鏧鐉鐏鐖鐗鏻鐲鐴鐻鑅𨯁𨯯鑭鑯镸镹閆閌閍𨴐閫閴𨵱闈𨷻𨸟阬阳1阴𨸶阼陁陡𨺉隂𨻫隚𨼲䧧隩隯隳隺隽䧺𨿸雘雚雝䨄霔霣䨩霶靁靇靕靗靛靪𩊠𩊱鞖鞚鞞鞢鞱鞲鞾韌韑韔韘韙韡韱頄頍頎頔頖䪼𩒐頣頲頳頥顇顦颫颭颰𩗏颷颸颻颼颿飂飇飋飠𩙿飡飣飥飪飰飱飳餈䬻𩛰餖餗𩜙餚餛餜𩝐餱餲餳餺餻餼饀饁饆饍饎饜饟饠馣馦馹馽馿駃駉駔駙駞𩣆駰駹駼騊騑騖騚騠67",
					"騱騶驄驌驘䯂骯䯊骷䯒骹𩩲髆髐髒髕䯨髜髠髥髩鬃鬌鬐鬒鬖鬜鬫鬳鬽䰠魋魣魥魫魬魳魶魷鮦鮬鮱𩷛𩸽鮲鮸鮾鯇鯳鯘鯝鯧鯪鯫鯯鯮𩸕鯺𩺊鯷𩹉鰖鰘1鰙鰚鰝鰢鰧鰩鰪𩻄鰱鰶鰷鱅鱜𩻩鱉鱊𩻛鱔鱘鱛鱝鱟鱩鱪鱫鱭鱮鱰鱲鱵鱺鳦鳲鴋鴂𩿎鴑鴗鴘𪀯䳄𪀚鴲䳑鵂鵊鵟鵢𪃹鵩鵫𪂂鵳鵶鵷鵾鶄鶍鶙鶡鶿鶵鶹鶽鷃鷇鷉鷖鷚鷟鷠鷣鷴䴇鸊鸂鸍鸙鸜鸝鹻𢈘麀麅麛麨𪎌麽𪐷黟黧黮黿鼂䵷鼃鼗鼙鼯鼷鼺鼽齁齅齆齓齕齘𪗱齝𪘂齩𪘚齭齰齵𪚲"
				].join("");

				/*
				上の変換マップ作成用の文字列は数値が入った変換マップのコードから作成している
				let output = "";
				let nul_count = 0;
				for(i = 0x879f; i <= 0xffff; i++) {
					if(map[i]) {
						if(nul_count !== 0){
							output += nul_count;
							nul_count = 0;
						}
						output += MojiJS.fromCodePoint(map[i]);
					}
					else {
						nul_count++;
					}
				}
				*/

				/**
				 * UTF16へ変換
				 */
				const utf32_array = Unicode.toUTF32Array(map);

				// マップ展開
				let is_num = false;
				let num_array = [];
				let key = 0x879F;
				for (let i = 0; i < utf32_array.length; i++) {
					const x = utf32_array[i];
					if (0x30 <= x && x <= 0x39) {
						if (!is_num) {
							is_num = true;
							num_array = [];
						}
						num_array.push(x);
					} else {
						if (is_num) {
							key += parseFloat(Unicode.fromUTF16Array(num_array));
							is_num = false;
						}
						sjis2004_to_unicode_map[key] = x;
						key++;
					}
				}

				return sjis2004_to_unicode_map;
			};

			/**
			 * 変換マップ
			 * - 2文字に変換される場合もあるので注意
			 *
			 * @returns {Object<number, number|number[]>}
			 */
			const sjis2004_to_unicode_map = getSJIS2004ToUnicodeMap();

			/**
			 * 全角用の文字がある場合は、全角へ変換できるようにする。
			 * 以下のリストは、上記のマッピングデータのUnicodeのコードポイントが0x100未満のデータを抜き出して、
			 * 全角になっていない部分をCP932を参考に直したものです。
			 *
			 * メモ：今回は使っていませんが、以下の文献も参考になるかもしれません。
			 * ftp://www.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/JIS/JIS0208.TXT
			 * @type {Record<number, number>}
			 */
			// prettier-ignore
			const sjis2004_to_unicode_map_2 = {
				0x8143: 0xFF0C, 0x8144: 0xFF0E, 0x8146: 0xFF1A, 0x8147: 0xFF1B, 0x8148: 0xFF1F, 0x8149: 0xFF01, 0x814C: 0x00B4, 0x814D: 0xFF40, 
				0x814E: 0x00A8, 0x814F: 0xFF3E, 0x8151: 0xFF3F, 0x815E: 0xFF0F, 0x815F: 0xFF3C, 0x8162: 0xFF5C, 0x8169: 0xFF08, 0x816A: 0xFF09, 
				0x816D: 0xFF3B, 0x816E: 0xFF3D, 0x816F: 0xFF5B, 0x8170: 0xFF5D, 0x817B: 0xFF0B, 0x817D: 0x00B1, 0x817E: 0x00D7, 0x8180: 0x00F7, 
				0x8181: 0xFF1D, 0x8183: 0xFF1C, 0x8184: 0xFF1E, 0x818B: 0x00B0, 0x818F: 0xFFE5, 0x8190: 0xFF04, 0x8191: 0xFFE0, 0x8192: 0xFFE1, 
				0x8193: 0xFF05, 0x8194: 0xFF03, 0x8195: 0xFF06, 0x8196: 0xFF0A, 0x8197: 0xFF20, 0x8198: 0x00A7, 0x81AD: 0xFF07, 0x81AE: 0xFF02, 
				0x81AF: 0xFF0D, 0x81B0: 0xFF5E, 0x81CA: 0xFFE2, 0x81F7: 0x00B6, 0x824F: 0xFF10, 0x8250: 0xFF11, 0x8251: 0xFF12, 0x8252: 0xFF13, 
				0x8253: 0xFF14, 0x8254: 0xFF15, 0x8255: 0xFF16, 0x8256: 0xFF17, 0x8257: 0xFF18, 0x8258: 0xFF19, 0x8260: 0xFF21, 0x8261: 0xFF22, 
				0x8262: 0xFF23, 0x8263: 0xFF24, 0x8264: 0xFF25, 0x8265: 0xFF26, 0x8266: 0xFF27, 0x8267: 0xFF28, 0x8268: 0xFF29, 0x8269: 0xFF2A, 
				0x826A: 0xFF2B, 0x826B: 0xFF2C, 0x826C: 0xFF2D, 0x826D: 0xFF2E, 0x826E: 0xFF2F, 0x826F: 0xFF30, 0x8270: 0xFF31, 0x8271: 0xFF32, 
				0x8272: 0xFF33, 0x8273: 0xFF34, 0x8274: 0xFF35, 0x8275: 0xFF36, 0x8276: 0xFF37, 0x8277: 0xFF38, 0x8278: 0xFF39, 0x8279: 0xFF3A, 
				0x8281: 0xFF41, 0x8282: 0xFF42, 0x8283: 0xFF43, 0x8284: 0xFF44, 0x8285: 0xFF45, 0x8286: 0xFF46, 0x8287: 0xFF47, 0x8288: 0xFF48, 
				0x8289: 0xFF49, 0x828A: 0xFF4A, 0x828B: 0xFF4B, 0x828C: 0xFF4C, 0x828D: 0xFF4D, 0x828E: 0xFF4E, 0x828F: 0xFF4F, 0x8290: 0xFF50, 
				0x8291: 0xFF51, 0x8292: 0xFF52, 0x8293: 0xFF53, 0x8294: 0xFF54, 0x8295: 0xFF55, 0x8296: 0xFF56, 0x8297: 0xFF57, 0x8298: 0xFF58, 
				0x8299: 0xFF59, 0x829A: 0xFF5A
			};

			// 「sjis2004_to_unicode_map_2」の中の特殊な文字について
			// 一部CP932とShift_JIS-2004とでコードが一致していない文字がある
			// 全角,CP932,Shift_JIS-2004,半角Unicode,全角Unicode
			// ＇,0xfa56,0x81ad,0x0027,0xff07 (CP932は、IBM拡張文字での定義)
			// ＂,0xfa57,0x81ae,0x0022,0xff02 (CP932は、IBM拡張文字での定義)
			// －,0x817c,0x81af,0x002d,0xff0d
			// ～,0x8160,0x81b0,0x007e,0xff5e

			// マップデータを上書きする
			for (const key in sjis2004_to_unicode_map_2) {
				sjis2004_to_unicode_map[key] = sjis2004_to_unicode_map_2[key];
			}

			/**
			 * 逆引きマップ作成。重複がある場合は、小さい数値を優先させる。
			 * @type {Record<number, number>}
			 */
			const unicode_to_sjis2004_map = {};
			for (const key in sjis2004_to_unicode_map) {
				const x = sjis2004_to_unicode_map[key];
				const key_num = parseInt(key, 10);
				if (!(x instanceof Array)) {
					if (unicode_to_sjis2004_map[x]) {
						if (x > key_num) {
							unicode_to_sjis2004_map[x] = key_num;
						}
					} else {
						unicode_to_sjis2004_map[x] = key_num;
					}
				}
			}

			// 逆引きの注意点についてはCP932のソースコードのコメントに記載
			unicode_to_sjis2004_map[0xA5] = 0x5C;

			SJIS2004MAP.sjis2004_to_unicode_map = sjis2004_to_unicode_map;
			SJIS2004MAP.unicode_to_sjis2004_map = unicode_to_sjis2004_map;
		}

		/**
		 * @returns {Record<number, number|number[]>}
		 */
		static SJIS2004_TO_UNICODE() {
			SJIS2004MAP.init();
			return SJIS2004MAP.sjis2004_to_unicode_map;
		}

		/**
		 * @returns {Record<number, number>}
		 */
		static UNICODE_TO_SJIS2004() {
			SJIS2004MAP.init();
			return SJIS2004MAP.unicode_to_sjis2004_map;
		}
	}

	/**
	 * 変換マップを初期化したかどうか
	 * @type {boolean}
	 */
	SJIS2004MAP.is_initmap = false;

	/**
	 * 変換用マップ
	 * @type {Record<number, number|number[]>}
	 */
	SJIS2004MAP.sjis2004_to_unicode_map = null;

	/**
	 * 変換用マップ
	 * @type {Record<number, number>}
	 */
	SJIS2004MAP.unicode_to_sjis2004_map = null;

	/**
	 * Shift_JIS-2004 を扱うクラス
	 * @ignore
	 */
	class SJIS2004 {
		/**
		 * Unicode のコードから Shift_JIS-2004 のコードに変換
		 * @param {number} unicode_codepoint - Unicode のコードポイント
		 * @returns {number} Shift_JIS-2004 のコードポイント (存在しない場合は undefined)
		 */
		static toSJIS2004FromUnicode(unicode_codepoint) {
			return SJIS2004MAP.UNICODE_TO_SJIS2004()[unicode_codepoint];
		}

		/**
		 * Shift_JIS-2004 のコードから Unicode のコードに変換
		 * @param {number} sjis2004_codepoint - Shift_JIS-2004 のコードポイント
		 * @returns {number|number[]} Unicode のコードポイント (存在しない場合は undefined)
		 */
		static toUnicodeFromSJIS2004(sjis2004_codepoint) {
			return SJIS2004MAP.SJIS2004_TO_UNICODE()[sjis2004_codepoint];
		}

		/**
		 * 文字列を Shift_JIS-2004 の配列に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} Shift_JIS-2004 のデータが入った配列
		 */
		static toSJIS2004Array(text) {
			return SJIS.toSJISArray(text, SJIS2004MAP.UNICODE_TO_SJIS2004());
		}

		/**
		 * 文字列を Shift_JIS-2004 のバイナリ配列に変換
		 * - 日本語文字は2バイトとして、配列も2つ分、使用します。
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} Shift_JIS-2004 のデータが入ったバイナリ配列
		 */
		static toSJIS2004Binary(text) {
			return SJIS.toSJISBinary(text, SJIS2004MAP.UNICODE_TO_SJIS2004());
		}

		/**
		 * Shift_JIS-2004 の配列から文字列に変換
		 * @param {number[]} sjis2004 - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromSJIS2004Array(sjis2004) {
			return SJIS.fromSJISArray(sjis2004, SJIS2004MAP.SJIS2004_TO_UNICODE());
		}

		/**
		 * 指定した文字から Shift_JIS-2004 上の面区点番号に変換
		 * - 2文字以上を指定した場合は、1文字目のみを変換する
		 * @param {string} text - 変換したいテキスト
		 * @returns {MenKuTen} 面区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
		 */
		static toMenKuTen(text) {
			if (text.length === 0) {
				return null;
			}
			const sjis2004_code = SJIS2004.toSJIS2004FromUnicode(Unicode.toUTF32Array(text)[0]);
			return sjis2004_code ? SJIS.toMenKuTenFromSJIS2004Code(sjis2004_code) : null;
		}

		/**
		 * Shift_JIS-2004 上の面区点番号から文字列に変換
		 * @param {MenKuTen|string} menkuten - 面区点番号
		 * @returns {string} 変換後のテキスト
		 */
		static fromMenKuTen(menkuten) {
			const code = SJIS.toUnicodeCodeFromKuTen(menkuten, SJIS2004MAP.SJIS2004_TO_UNICODE());
			return code ? Unicode.fromUTF32Array(code) : "";
		}
	}

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


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
			 * @type {Record<number, number>}
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
			 * @type {Record<number, number>}
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
		 * @returns {Record<number, number>}
		 */
		static CP932_TO_EUCJPMS() {
			EUCJPMSMAP.init();
			return EUCJPMSMAP.cp932_to_eucjpms_map;
		}

		/**
		 * @returns {Record<number, number>}
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
	 * @type {Record<number, number>}
	 */
	EUCJPMSMAP.cp932_to_eucjpms_map = null;

	/**
	 * 変換用マップ
	 * @type {Record<number, number>}
	 */
	EUCJPMSMAP.eucjpms_to_cp932_map = null;

	/**
	 * eucJP-ms を扱うクラス
	 * @ignore
	 */
	class EUCJPMS {
		/**
		 * 文字列を eucJP-ms のバイナリ配列に変換。変換できない文字は "?" に変換される。
		 * - 日本語文字は2バイトとして、配列も2つ分、使用します。
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} eucJP-ms のデータが入ったバイナリ配列
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
		 * @param {number[]} eucjp - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
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

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * EUC-JIS-2004 を扱うクラス
	 * @ignore
	 */
	class EUCJIS2004 {
		/**
		 * 文字列を EUC-JIS-2004 のバイナリ配列に変換。変換できない文字は "?" に変換される。
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} EUC-JIS-2004 のデータが入ったバイナリ配列
		 */
		static toEUCJIS2004Binary(text) {
			const sjis_array = SJIS2004.toSJIS2004Array(text);
			const bin = [];
			const ng = "?".charCodeAt(0);
			// prettier-ignore
			const SS2 = 0x8E; // C1制御文字 シングルシフト2
			// prettier-ignore
			const SS3 = 0x8F; // C1制御文字 シングルシフト3
			for (let i = 0; i < sjis_array.length; i++) {
				const code = sjis_array[i];
				const kuten = SJIS.toMenKuTenFromSJIS2004Code(code);
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
					// G1 と G3 を切り替える
					if (kuten.men === 2) {
						// シングルシフト SS3 で G3 を呼び出す。
						// G3 は JIS X 0213:2004 の2面を表す
						bin.push(SS3);
					}
					if (kuten.ku <= 94) {
						// 区点は94まで利用できる。
						// つまり、最大でも 94 + 0xA0 = 0xFE となり 0xFF 以上にならない
						// prettier-ignore
						bin.push(kuten.ku + 0xA0);
						// prettier-ignore
						bin.push(kuten.ten + 0xA0);
					} else {
						bin.push(ng);
					}
				}
			}
			return bin;
		}

		/**
		 * EUC-JIS-2004 の配列から文字列に変換
		 * @param {number[]} eucjp - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromEUCJIS2004Binary(eucjp) {
			const sjis_array = [];
			const ng = "?".charCodeAt(0);
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
				let men = 1;
				{
					// 3バイト読み込み(G3)
					if (x1 === SS3) {
						// 文字が足りない
						if (i >= eucjp.length - 2) {
							break;
						}
						// シングルシフト SS3 で G3 を呼び出す。
						// G3 は、EUC-JIS-2000 の場合 JIS X 0213:2004 の2面を表す
						men = 2;
						x1 = eucjp[i + 1];
						x2 = eucjp[i + 2];
						i += 2;
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

				// prettier-ignore
				if (0xA1 <= x1 && x1 <= 0xFE && 0xA1 <= x2 && x2 <= 0xFE) {
					// EUC-JIS-2000 JIS X 0213:2004 の2面に対応
					// 日本語
					// prettier-ignore
					const kuten = {
						men: men,
						ku: x1 - 0xA0,
						ten: x2 - 0xA0
					};
					sjis_array.push(SJIS.toSJIS2004CodeFromMenKuTen(kuten));
				} else {
					sjis_array.push(ng);
				}
			}
			return SJIS2004.fromSJIS2004Array(sjis_array);
		}
	}

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * Encode用のツールクラス
	 * @ignore
	 */
	class EncodeTools {
		/**
		 * キャラセット名の正規化
		 * @param {string} charset
		 * @returns {string}
		 */
		static normalizeCharSetName(charset) {
			let x1, x2;
			let is_with_bom = false;
			// BOM の文字がある場合は BOM 付きとする
			if (/^bom\s+|\s+bom\s+|\s+bom$/i.test(x1)) {
				is_with_bom = true;
				x1 = charset.replace(/^bom\s+|(\s+with)?\s+bom\s+|(\s+with\s*)?\s+bom$/, "");
			} else {
				x1 = charset;
			}
			if (/^(unicode-1-1-utf-8|UTF[-_]?8)$/i.test(x1)) {
				x2 = "UTF-8";
			} else if (/^(csunicode|iso-10646-ucs-2|ucs-2|Unicode|UnicodeFEFF|UTF[-_]?16([-_]?LE)?)$/i.test(x1)) {
				x2 = "UTF-16LE";
			} else if (/^(UnicodeFFFE|UTF[-_]?16[-_]?BE)$/i.test(x1)) {
				x2 = "UTF-16BE";
			} else if (/^(utf32_littleendian|UTF[-_]?32([-_]?LE)?)$/i.test(x1)) {
				x2 = "UTF-32LE";
			} else if (/^(utf32_bigendian|UTF[-_]?32[-_]?BE)$/i.test(x1)) {
				x2 = "UTF-32BE";
			} else if (/^(csshiftjis|ms_kanji|(cp|ms)932|shift[-_]?jis|sjis|Windows[-_]?31J|x-sjis)$/i.test(x1)) {
				x2 = "Shift_JIS";
			} else if (/^(sjis[-_]?2004|shift[-_]?jis[-_]?2004)$/i.test(x1)) {
				x2 = "Shift_JIS-2004";
			} else if (/^(euc[-_]?JP[-_]?ms)$/i.test(x1)) {
				x2 = "eucJP-ms";
			} else if (/^(euc[-_]?jp|cseucpkdfmtjapanese|x-euc-jp)$/i.test(x1)) {
				x2 = "EUC-JP";
			} else if (/^(euc[-_]?jis[-_]?200|euc[-_]?jp[-_]?2004)$/i.test(x1)) {
				x2 = "EUC-JIS-2004";
			} else {
				x2 = x1;
			}
			if (is_with_bom) {
				x2 += " with BOM";
			}
			return x2;
		}

		/**
		 * 同一の種別の文字列の重なりをカウントする
		 * @param {number[]} utf32_array
		 * @returns {number}
		 */
		static countWord(utf32_array) {
			let count = 0;
			let type = 0;
			let old_type = -1;
			for (let i = 0; i < utf32_array.length; i++) {
				const ch = utf32_array[i];
				// a-zA-Z
				// prettier-ignore
				if ((0x41 <= ch && ch <= 0x5A) || (0x61 <= ch && ch <= 0x6A)) {
					type = 1;
				}
				// 0-9
				// prettier-ignore
				else if (0x30 <= ch && ch <= 0x39) {
					type = 2;
				}
				// ぁ-ん
				// prettier-ignore
				else if (0x3041 <= ch && ch <= 0x3093) {
					type = 3;
				}
				// ァ-ン
				// prettier-ignore
				else if (0x30A1 <= ch && ch <= 0x30F3) {
					type = 4;
				}
				// 全角英字
				// prettier-ignore
				else if ((0xFF21 <= ch && ch <= 0xFF3A) || (0xFF41 <= ch && ch <= 0xFF5A)) {
					type = 5;
				}
				// 全角数値
				// prettier-ignore
				else if (0xFF10 <= ch && ch <= 0xFF19) {
					type = 6;
				}
				// 半角カタカナ
				// prettier-ignore
				else if (0xFF61 <= ch && ch < 0xFFA0) {
					type = 7;
				}
				// CJK統合漢字拡張A - CJK統合漢字, 追加漢字面
				// prettier-ignore
				else if ((0x3400 <= ch && ch < 0xA000) || (0x20000 <= ch && ch < 0x2FA20)) {
					type = 8;
				} else {
					old_type = -1;
					continue;
				}
				if (type === old_type) {
					count++;
				}
				old_type = type;
			}
			return count;
		}
	}

	/**
	 * 文字データのバイナリへのエンコード、文字列へのデコードを扱うクラス
	 * @ignore
	 */
	class Encode {
		/**
		 * 文字列からバイナリ配列にエンコードする
		 * @param {string} text - 変換したいテキスト
		 * @param {string} charset - キャラセット(UTF-8/16/32,Shift_JIS,Windows-31J,Shift_JIS-2004,EUC-JP,EUC-JP-2004)
		 * @param {boolean} [is_with_bom=true] - BOMをつけるかどうか
		 * @returns {number[]} バイナリ配列(失敗時はnull)
		 */
		static encode(text, charset, is_with_bom) {
			const ncharset = charset ? EncodeTools.normalizeCharSetName(charset) : "autodetect";
			if (/^UTF-(8|16|32)/i.test(ncharset)) {
				const utf32_array = Unicode.toUTF32Array(text);
				return Unicode.toUTFBinaryFromCodePoint(utf32_array, ncharset, is_with_bom);
			} else if (/^Shift_JIS$/i.test(ncharset)) {
				return CP932.toCP932Binary(text);
			} else if (/^Shift_JIS-2004$/i.test(ncharset)) {
				return SJIS2004.toSJIS2004Binary(text);
			} else if (/^eucJP-ms$/i.test(ncharset)) {
				return EUCJPMS.toEUCJPMSBinary(text);
			} else if (/^(EUC-JP|EUC-JIS-2004)$/i.test(ncharset)) {
				return EUCJIS2004.toEUCJIS2004Binary(text);
			}
			return null;
		}

		/**
		 * バイナリ配列から文字列にデコードする
		 * @param {number[]} binary - 変換したいバイナリ配列
		 * @param {string} [charset="autodetect"] - キャラセット(UTF-8/16/32,Shift_JIS,Windows-31J,Shift_JIS-2004,EUC-JP,EUC-JP-2004)
		 * @returns {string} 変換した文字列（失敗したらnull）
		 */
		static decode(binary, charset) {
			const ncharset = charset ? EncodeTools.normalizeCharSetName(charset) : "autodetect";
			if (/^UTF-(8|16|32)/i.test(ncharset)) {
				const ret = Unicode.toCodePointFromUTFBinary(binary, charset);
				if (ret) {
					return Unicode.fromUTF32Array(ret);
				}
			} else if (/^Shift_JIS$/i.test(ncharset)) {
				return CP932.fromCP932Array(binary);
			} else if (/^Shift_JIS-2004$/i.test(ncharset)) {
				return SJIS2004.fromSJIS2004Array(binary);
			} else if (/^eucJP-ms$/i.test(ncharset)) {
				return EUCJPMS.fromEUCJPMSBinary(binary);
			} else if (/^(EUC-JP|EUC-JIS-2004)$/i.test(ncharset)) {
				return EUCJIS2004.fromEUCJIS2004Binary(binary);
			} else if (/autodetect/i.test(ncharset)) {
				// BOMが付いているか調べる
				const withbom = Unicode.getCharsetFromBOM(binary);
				if (withbom) {
					// BOM が付いている場合はUnicodeで変換する
					const ret = Unicode.toCodePointFromUTFBinary(binary, charset);
					if (ret) {
						return Unicode.fromUTF32Array(ret);
					}
				}
				// 有名な文字コードで試す
				let max_data = "";
				let max_count = -1;
				// Shift_JIS
				{
					const text = CP932.fromCP932Array(binary);
					const count = EncodeTools.countWord(Unicode.toUTF32Array(text));
					if (max_count < count) {
						max_data = text;
						max_count = count;
					}
				}
				// eucJP-ms
				{
					const text = EUCJPMS.fromEUCJPMSBinary(binary);
					const count = EncodeTools.countWord(Unicode.toUTF32Array(text));
					if (max_count < count) {
						max_data = text;
						max_count = count;
					}
				}
				// EUC-JP, EUC-JP-2004
				{
					const text = EUCJIS2004.fromEUCJIS2004Binary(binary);
					const count = EncodeTools.countWord(Unicode.toUTF32Array(text));
					if (max_count < count) {
						max_data = text;
						max_count = count;
					}
				}
				// UTF-8
				{
					const utf32 = Unicode.toCodePointFromUTFBinary(binary, "utf-8");
					const count = EncodeTools.countWord(utf32);
					if (max_count < count) {
						max_data = Unicode.fromUTF32Array(utf32);
						max_count = count;
					}
				}
				// UTF-16LE
				{
					const utf32 = Unicode.toCodePointFromUTFBinary(binary, "utf-16");
					const count = EncodeTools.countWord(utf32);
					if (max_count < count) {
						max_data = Unicode.fromUTF32Array(utf32);
						max_count = count;
					}
				}
				return max_data;
			}
			return null;
		}
	}

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * 日本語を扱うクラス
	 * @ignore
	 */
	class Japanese {
		/**
		 * カタカナをひらがなに変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHiragana(text) {
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				// prettier-ignore
				return String.fromCharCode(ch.charCodeAt(0) - 0x0060);
			};
			return text.replace(/[\u30A1-\u30F6]/g, func);
		}

		/**
		 * ひらがなをカタカナに変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toKatakana(text) {
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				// prettier-ignore
				return String.fromCharCode(ch.charCodeAt(0) + 0x0060);
			};
			return text.replace(/[\u3041-\u3096]/g, func);
		}

		/**
		 * スペースを半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthSpace(text) {
			// prettier-ignore
			return text.replace(/\u3000/g, String.fromCharCode(0x0020));
		}

		/**
		 * スペースを全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthSpace(text) {
			// prettier-ignore
			return text.replace(/\u0020/g, String.fromCharCode(0x3000));
		}

		/**
		 * 英数記号を半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthAsciiCode(text) {
			let out = text;
			out = out.replace(/\u3000/g, "\u0020"); //全角スペース
			out = out.replace(/[\u2018-\u201B]/g, "\u0027"); //シングルクォーテーション
			out = out.replace(/[\u201C-\u201F]/g, "\u0022"); //ダブルクォーテーション
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				const code = ch.charCodeAt(0);
				// prettier-ignore
				return String.fromCharCode(code - 0xFEE0);
			};
			return out.replace(/[\uFF01-\uFF5E]/g, func);
		}

		/**
		 * 英数記号を全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthAsciiCode(text) {
			let out = text;
			out = out.replace(/\u0020/g, "\u3000"); //全角スペース
			out = out.replace(/\u0022/g, "\u201D"); //ダブルクォーテーション
			out = out.replace(/\u0027/g, "\u2019"); //アポストロフィー
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				const code = ch.charCodeAt(0);
				// prettier-ignore
				return String.fromCharCode(code + 0xFEE0);
			};
			return out.replace(/[\u0020-\u007E]/g, func);
		}

		/**
		 * アルファベットを半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthAlphabet(text) {
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				// prettier-ignore
				return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
			};
			return text.replace(/[\uFF21-\uFF3A\uFF41-\uFF5A]/g, func);
		}

		/**
		 * アルファベットを全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthAlphabet(text) {
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				// prettier-ignore
				return String.fromCharCode(ch.charCodeAt(0) + 0xFEE0);
			};
			return text.replace(/[A-Za-z]/g, func);
		}

		/**
		 * 数値を半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthNumber(text) {
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				// prettier-ignore
				return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
			};
			return text.replace(/[\uFF10-\uFF19]/g, func);
		}

		/**
		 * 数値を全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthNumber(text) {
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				// prettier-ignore
				return String.fromCharCode(ch.charCodeAt(0) + 0xFEE0);
			};
			return text.replace(/[0-9]/g, func);
		}

		/**
		 * カタカナを半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthKana(text) {
			/**
			 * @type {Object<number, string>}
			 */
			// prettier-ignore
			const map = {
				0x3001:	"\uFF64",	//	､
				0x3002:	"\uFF61",	//	。	｡
				0x300C:	"\uFF62",	//	「	｢
				0x300D:	"\uFF63",	//	」	｣
				0x309B:	"\uFF9E",	//	゛	ﾞ
				0x309C:	"\uFF9F",	//	゜	ﾟ
				0x30A1:	"\uFF67",	//	ァ	ｧ
				0x30A2:	"\uFF71",	//	ア	ｱ
				0x30A3:	"\uFF68",	//	ィ	ｨ
				0x30A4:	"\uFF72",	//	イ	ｲ
				0x30A5:	"\uFF69",	//	ゥ	ｩ
				0x30A6:	"\uFF73",	//	ウ	ｳ
				0x30A7:	"\uFF6A",	//	ェ	ｪ
				0x30A8:	"\uFF74",	//	エ	ｴ
				0x30A9:	"\uFF6B",	//	ォ	ｫ
				0x30AA:	"\uFF75",	//	オ	ｵ
				0x30AB:	"\uFF76",	//	カ	ｶ
				0x30AC:	"\uFF76\uFF9E",	//	ガ	ｶﾞ
				0x30AD:	"\uFF77",	//	キ	ｷ
				0x30AE:	"\uFF77\uFF9E",	//	ギ	ｷﾞ
				0x30AF:	"\uFF78",	//	ク	ｸ
				0x30B0:	"\uFF78\uFF9E",	//	グ	ｸﾞ
				0x30B1:	"\uFF79",	//	ケ	ｹ
				0x30B2:	"\uFF79\uFF9E",	//	ゲ	ｹﾞ
				0x30B3:	"\uFF7A",	//	コ	ｺ
				0x30B4:	"\uFF7A\uFF9E",	//	ゴ	ｺﾞ
				0x30B5:	"\uFF7B",	//	サ	ｻ
				0x30B6:	"\uFF7B\uFF9E",	//	ザ	ｻﾞ
				0x30B7:	"\uFF7C",	//	シ	ｼ
				0x30B8:	"\uFF7C\uFF9E",	//	ジ	ｼﾞ
				0x30B9:	"\uFF7D",	//	ス	ｽ
				0x30BA:	"\uFF7D\uFF9E",	//	ズ	ｽﾞ
				0x30BB:	"\uFF7E",	//	セ	ｾ
				0x30BC:	"\uFF7E\uFF9E",	//	ゼ	ｾﾞ
				0x30BD:	"\uFF7F",	//	ソ	ｿ
				0x30BE:	"\uFF7F\uFF9E",	//	ゾ	ｿﾞ
				0x30BF:	"\uFF80",	//	タ	ﾀ
				0x30C0:	"\uFF80\uFF9E",	//	ダ	ﾀﾞ
				0x30C1:	"\uFF81",	//	チ	ﾁ
				0x30C2:	"\uFF81\uFF9E",	//	ヂ	ﾁﾞ
				0x30C3:	"\uFF6F",	//	ッ	ｯ
				0x30C4:	"\uFF82",	//	ツ	ﾂ
				0x30C5:	"\uFF82\uFF9E",	//	ヅ	ﾂﾞ
				0x30C6:	"\uFF83",	//	テ	ﾃ
				0x30C7:	"\uFF83\uFF9E",	//	デ	ﾃﾞ
				0x30C8:	"\uFF84",	//	ト	ﾄ
				0x30C9:	"\uFF84\uFF9E",	//	ド	ﾄﾞ
				0x30CA:	"\uFF85",	//	ナ	ﾅ
				0x30CB:	"\uFF86",	//	ニ	ﾆ
				0x30CC:	"\uFF87",	//	ヌ	ﾇ
				0x30CD:	"\uFF88",	//	ネ	ﾈ
				0x30CE:	"\uFF89",	//	ノ	ﾉ
				0x30CF:	"\uFF8A",	//	ハ	ﾊ
				0x30D0:	"\uFF8A\uFF9E",	//	バ	ﾊﾞ
				0x30D1:	"\uFF8A\uFF9F",	//	パ	ﾊﾟ
				0x30D2:	"\uFF8B",	//	ヒ	ﾋ
				0x30D3:	"\uFF8B\uFF9E",	//	ビ	ﾋﾞ
				0x30D4:	"\uFF8B\uFF9F",	//	ピ	ﾋﾟ
				0x30D5:	"\uFF8C",	//	フ	ﾌ
				0x30D6:	"\uFF8C\uFF9E",	//	ブ	ﾌﾞ
				0x30D7:	"\uFF8C\uFF9F",	//	プ	ﾌﾟ
				0x30D8:	"\uFF8D",	//	ヘ	ﾍ
				0x30D9:	"\uFF8D\uFF9E",	//	ベ	ﾍﾞ
				0x30DA:	"\uFF8D\uFF9F",	//	ペ	ﾍﾟ
				0x30DB:	"\uFF8E",	//	ホ	ﾎ
				0x30DC:	"\uFF8E\uFF9E",	//	ボ	ﾎﾞ
				0x30DD:	"\uFF8E\uFF9F",	//	ポ	ﾎﾟ
				0x30DE:	"\uFF8F",	//	マ	ﾏ
				0x30DF:	"\uFF90",	//	ミ	ﾐ
				0x30E0:	"\uFF91",	//	ム	ﾑ
				0x30E1:	"\uFF92",	//	メ	ﾒ
				0x30E2:	"\uFF93",	//	モ	ﾓ
				0x30E3:	"\uFF6C",	//	ャ	ｬ
				0x30E4:	"\uFF94",	//	ヤ	ﾔ
				0x30E5:	"\uFF6D",	//	ュ	ｭ
				0x30E6:	"\uFF95",	//	ユ	ﾕ
				0x30E7:	"\uFF6E",	//	ョ	ｮ
				0x30E8:	"\uFF96",	//	ヨ	ﾖ
				0x30E9:	"\uFF97",	//	ラ	ﾗ
				0x30EA:	"\uFF98",	//	リ	ﾘ
				0x30EB:	"\uFF99",	//	ル	ﾙ
				0x30EC:	"\uFF9A",	//	レ	ﾚ
				0x30ED:	"\uFF9B",	//	ロ	ﾛ
				0x30EE:	"\uFF9C",	//	ヮ	ﾜ
				0x30EF:	"\uFF9C",	//	ワ	ﾜ
				0x30F0:	"\uFF72",	//	ヰ	ｲ
				0x30F1:	"\uFF74",	//	ヱ	ｴ
				0x30F2:	"\uFF66",	//	ヲ	ｦ
				0x30F3:	"\uFF9D",	//	ン	ﾝ
				0x30F4:	"\uFF73\uFF9E",	//	ヴ	ｳﾞ
				0x30F5:	"\uFF76",	//	ヵ	ｶ
				0x30F6:	"\uFF79",	//	ヶ	ｹ
				0x30F7:	"\uFF9C\uFF9E",	//	ヷ	ﾜﾞ
				0x30F8:	"\uFF72\uFF9E",	//	ヸ	ｲﾞ
				0x30F9:	"\uFF74\uFF9E",	//	ヹ	ｴﾞ
				0x30FA:	"\uFF66\uFF9E",	//	ヺ	ｦﾞ
				0x30FB:	"\uFF65",	//	・	･
				0x30FC:	"\uFF70"		//	ー	ｰ
			};
			/**
			 * @param {string} ch
			 */
			const func = function (ch) {
				if (ch.length === 1) {
					return map[ch.charCodeAt(0)];
				} else {
					return map[ch.charCodeAt(0)] + map[ch.charCodeAt(1)];
				}
			};
			return text.replace(/[\u3001\u3002\u300C\u300D\u309B\u309C\u30A1-\u30FC][\u309B\u309C]?/g, func);
		}

		/**
		 * カタカナを全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthKana(text) {
			/**
			 * @type {Record<number, number>}
			 */
			// prettier-ignore
			const map = {
				0xFF61:	0x3002,	//	。	｡
				0xFF62:	0x300C,	//	「	｢
				0xFF63:	0x300D,	//	」	｣
				0xFF64:	0x3001,	//	､
				0xFF65:	0x30FB,	//	・	･
				0xFF66:	0x30F2,	//	ヲ	ｦ
				0xFF67:	0x30A1,	//	ァ	ｧ
				0xFF68:	0x30A3,	//	ィ	ｨ
				0xFF69:	0x30A5,	//	ゥ	ｩ
				0xFF6A:	0x30A7,	//	ェ	ｪ
				0xFF6B:	0x30A9,	//	ォ	ｫ
				0xFF6C:	0x30E3,	//	ャ	ｬ
				0xFF6D:	0x30E5,	//	ュ	ｭ
				0xFF6E:	0x30E7,	//	ョ	ｮ
				0xFF6F:	0x30C3,	//	ッ	ｯ
				0xFF70:	0x30FC,	//	ー	ｰ
				0xFF71:	0x30A2,	//	ア	ｱ
				0xFF72:	0x30A4,	//	イ	ｲ
				0xFF73:	0x30A6,	//	ウ	ｳ
				0xFF74:	0x30A8,	//	エ	ｴ
				0xFF75:	0x30AA,	//	オ	ｵ
				0xFF76:	0x30AB,	//	カ	ｶ
				0xFF77:	0x30AD,	//	キ	ｷ
				0xFF78:	0x30AF,	//	ク	ｸ
				0xFF79:	0x30B1,	//	ケ	ｹ
				0xFF7A:	0x30B3,	//	コ	ｺ
				0xFF7B:	0x30B5,	//	サ	ｻ
				0xFF7C:	0x30B7,	//	シ	ｼ
				0xFF7D:	0x30B9,	//	ス	ｽ
				0xFF7E:	0x30BB,	//	セ	ｾ
				0xFF7F:	0x30BD,	//	ソ	ｿ
				0xFF80:	0x30BF,	//	タ	ﾀ
				0xFF81:	0x30C1,	//	チ	ﾁ
				0xFF82:	0x30C4,	//	ツ	ﾂ
				0xFF83:	0x30C6,	//	テ	ﾃ
				0xFF84:	0x30C8,	//	ト	ﾄ
				0xFF85:	0x30CA,	//	ナ	ﾅ
				0xFF86:	0x30CB,	//	ニ	ﾆ
				0xFF87:	0x30CC,	//	ヌ	ﾇ
				0xFF88:	0x30CD,	//	ネ	ﾈ
				0xFF89:	0x30CE,	//	ノ	ﾉ
				0xFF8A:	0x30CF,	//	ハ	ﾊ
				0xFF8B:	0x30D2,	//	ヒ	ﾋ
				0xFF8C:	0x30D5,	//	フ	ﾌ
				0xFF8D:	0x30D8,	//	ヘ	ﾍ
				0xFF8E:	0x30DB,	//	ホ	ﾎ
				0xFF8F:	0x30DE,	//	マ	ﾏ
				0xFF90:	0x30DF,	//	ミ	ﾐ
				0xFF91:	0x30E0,	//	ム	ﾑ
				0xFF92:	0x30E1,	//	メ	ﾒ
				0xFF93:	0x30E2,	//	モ	ﾓ
				0xFF94:	0x30E4,	//	ヤ	ﾔ
				0xFF95:	0x30E6,	//	ユ	ﾕ
				0xFF96:	0x30E8,	//	ヨ	ﾖ
				0xFF97:	0x30E9,	//	ラ	ﾗ
				0xFF98:	0x30EA,	//	リ	ﾘ
				0xFF99:	0x30EB,	//	ル	ﾙ
				0xFF9A:	0x30EC,	//	レ	ﾚ
				0xFF9B:	0x30ED,	//	ロ	ﾛ
				0xFF9C:	0x30EF,	//	ワ	ﾜ
				0xFF9D:	0x30F3,	//	ン	ﾝ
				0xFF9E:	0x309B,	//	゛	ﾞ
				0xFF9F:	0x309C		//	゜	ﾟ
			};
			/**
			 * @param {string} str
			 */
			const func = function (str) {
				if (str.length === 1) {
					return String.fromCharCode(map[str.charCodeAt(0)]);
				} else {
					const next = str.charCodeAt(1);
					const ch = str.charCodeAt(0);
					if (next === 0xFF9E) {
						// Shift-JISにない濁点（ヷ、ヸ、ヹ、ヺ）は意図的に無視
						// ヴ
						if (ch === 0xFF73) {
							return String.fromCharCode(0x3094);
						}
						// ガ-ド、バ-ボ
						else if ((0xFF76 <= ch && ch <= 0xFF84) || (0xFF8A <= ch && ch <= 0xFF8E)) {
							return String.fromCharCode(map[ch] + 1);
						}
					}
					// 半濁点
					else if (next === 0xFF9F) {
						// パ-ポ
						if (0xFF8A <= ch && ch <= 0xFF8E) {
							return String.fromCharCode(map[ch] + 2);
						}
					}
					return String.fromCharCode(map[ch]) + String.fromCharCode(map[next]);
				}
			};
			return text.replace(/[\uFF61-\uFF9F][\uFF9E\uFF9F]?/g, func);
		}

		/**
		 * 半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidth(text) {
			return Japanese.toHalfWidthKana(Japanese.toHalfWidthAsciiCode(text));
		}

		/**
		 * 全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidth(text) {
			return Japanese.toFullWidthKana(Japanese.toFullWidthAsciiCode(text));
		}

		/**
		 * ローマ字からひらがなに変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHiraganaFromRomaji(text) {
			/**
			 * ローマ字から変換マップ
			 * .y[aiuoe] は除いている
			 * @type {Object<string, string>}
			 */
			// prettier-ignore
			const map = {
				a: "あ",
				i: "い",
				u: "う",
				e: "え",
				o: "お",
				ka: "か",
				ki: "き",
				ku: "く",
				ke: "け",
				ko: "こ",
				ga: "が",
				gi: "ぎ",
				gu: "ぐ",
				ge: "げ",
				go: "ご",
				sa: "さ",
				si: "し",
				su: "す",
				se: "せ",
				so: "そ",
				za: "ざ",
				zi: "じ",
				zu: "ず",
				ze: "ぜ",
				zo: "ぞ",
				ta: "た",
				ti: "ち",
				tu: "つ",
				te: "て",
				to: "と",
				da: "だ",
				di: "ぢ",
				du: "づ",
				de: "で",
				do: "ど",
				na: "な",
				ni: "に",
				nu: "ぬ",
				ne: "ね",
				no: "の",
				ha: "は",
				hi: "ひ",
				hu: "ふ",
				he: "へ",
				ho: "ほ",
				ba: "ば",
				bi: "び",
				bu: "ぶ",
				be: "べ",
				bo: "ぼ",
				pa: "ぱ",
				pi: "ぴ",
				pu: "ぷ",
				pe: "ぺ",
				po: "ぽ",
				ma: "ま",
				mi: "み",
				mu: "む",
				me: "め",
				mo: "も",
				ya: "や",
				yi: "い",
				yu: "ゆ",
				ye: "いぇ",
				yo: "よ",
				ra: "ら",
				ri: "り",
				ru: "る",
				re: "れ",
				ro: "ろ",
				wa: "わ",
				wi: "うぃ",
				wu: "う",
				we: "うぇ",
				wo: "を",
				la: "ぁ",
				li: "ぃ",
				lu: "ぅ",
				le: "ぇ",
				lo: "ぉ",
				lya: "ゃ",
				lyi: "ぃ",
				lyu: "ゅ",
				lye: "ぇ",
				lyo: "ょ",
				ltu: "っ",
				ltsu: "っ",
				xa: "ぁ",
				xi: "ぃ",
				xu: "ぅ",
				xe: "ぇ",
				xo: "ぉ",
				xya: "ゃ",
				xyi: "ぃ",
				xyu: "ゅ",
				xye: "ぇ",
				xyo: "ょ",
				xtu: "っ",
				xtsu: "っ",
				// 環境依存をなくすために、SJISにあるカタカナにしています。
				va: "ヴぁ",
				vi: "ヴぃ",
				vu: "ヴ",
				ve: "ヴぇ",
				vo: "ヴぉ",
				qa: "くぁ",
				qi: "くぃ",
				qu: "く",
				qe: "くぇ",
				qo: "くぉ",
				qwa: "くぁ",
				qwi: "くぃ",
				qwu: "くぅ",
				qwe: "くぇ",
				qwo: "くぉ",
				gwa: "ぐぁ",
				gwi: "ぐぃ",
				gwu: "ぐぅ",
				gwe: "ぐぇ",
				gwo: "ぐぉ",
				sha: "しゃ",
				shi: "し",
				shu: "しゅ",
				she: "しぇ",
				sho: "しょ",
				swa: "すぁ",
				swi: "すぃ",
				swu: "すぅ",
				swe: "すぇ",
				swo: "すぉ",
				cha: "ちゃ",
				chi: "ち",
				chu: "ちゅ",
				che: "ちぇ",
				cho: "ちょ",
				tha: "ちゃ",
				thi: "ち",
				thu: "てゅ",
				the: "てぇ",
				tho: "てょ",
				tsa: "つぁ",
				tsi: "つぃ",
				tsu: "つ",
				tse: "つぇ",
				tso: "つぉ",
				twa: "とぁ",
				twi: "とぃ",
				twu: "とぅ",
				twe: "とぇ",
				two: "とぉ",
				fa: "ふぁ",
				fi: "ふぃ",
				fu: "ふ",
				fe: "ふぇ",
				fo: "ふぉ",
				fwa: "ふぁ",
				fwi: "ふぃ",
				fwu: "ふぅ",
				fwe: "ふぇ",
				fwo: "ふぉ",
				ja: "じゃ",
				ji: "じ",
				ju: "じゅ",
				je: "じぇ",
				jo: "じょ",
				n: "ん",
				nn: "ん",
				"-": "ー",
				"?": "？",
				"!": "！",
				",": "、",
				".": "。" 
			};
			/**
			 * ya, yi, yu, ye, yo
			 * @type {Object<string, string>}
			 */
			// prettier-ignore
			const y_komoji_map = {
				a: "ゃ",
				i: "ぃ",
				u: "ゅ",
				e: "ぇ",
				o: "ょ"
			};
			/**
			 * @param {string} str
			 */
			const func = function (str) {
				const output = [];
				let y_komoji = null;
				let romaji = str.toLowerCase();
				if (romaji.length > 2) {
					// 同じ文字の繰り返しなら「っ」に変更
					if (romaji.charCodeAt(0) === romaji.charCodeAt(1)) {
						// ただし繰り返し文字がnの場合は「ん」として扱う
						if (romaji.substring(0, 1) === "n") {
							output.push("ん");
							romaji = romaji.substring(2);
						} else {
							output.push("っ");
							romaji = romaji.substring(1);
						}
					}
				}
				if (romaji.length === 3) {
					const char_1 = romaji.substring(0, 1);
					const char_2 = romaji.substring(1, 2);
					// 2文字目がyで始まる場合（ただし、lya, xya などを除く）は
					// 小文字リストから選んで、最後に小文字をつける
					// sya -> si につけかえて辞書から探す
					if (char_2 === "y" && char_1 !== "l" && char_1 !== "x") {
						y_komoji = y_komoji_map[romaji.substring(2)];
						romaji = romaji.substring(0, 1) + "i";
					}
				}
				const data = map[romaji];
				if (!data) {
					return str;
				}
				output.push(data);
				if (y_komoji) {
					output.push(y_komoji);
				}
				return output.join("");
			};
			// 上から下への優先度で変換する。
			// ([xl]?[kgsztdnhbpmyrwlxvqfj])(\1)?y?[aiuoe] ... yが入り込む可能性がある文字。前の文字を繰り返して「tta -> った」にも対応。
			// [xl]?(gw|ch|cch|sh|ssh|ts|tts|th|tth)?[aiuoe] ... yを使用しない文字
			// nn? ... ん
			// [?!-] ... 記号
			// prettier-ignore
			return (text.replace(/([xl]?[kgsztdnhbpmyrwlxvqfj])(\1)?y?[aiuoe]|[xl]?([gqstf]w|ch|cch|sh|ssh|ts|tts|th|tth)?[aiuoe]|nn?|[?!-.,]/gi, func));
		}

		/**
		 * ローマ字からカタカナに変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toKatakanaFromRomaji(text) {
			return Japanese.toKatakana(Japanese.toHiraganaFromRomaji(text));
		}

		/**
		 * ひらがなからローマ字に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toRomajiFromHiragana(text) {
			/**
			 * ひらがなからローマ字への変換マップ
			 * @type {Object<string, string>}
			 */
			// prettier-ignore
			const map = {
				あ: "a",
				い: "i",
				う: "u",
				え: "e",
				お: "o",
				か: "ka",
				き: "ki",
				く: "ku",
				け: "ke",
				こ: "ko",
				が: "ga",
				ぎ: "gi",
				ぐ: "gu",
				げ: "ge",
				ご: "go",
				さ: "sa",
				し: "shi",
				す: "su",
				せ: "se",
				そ: "so",
				ざ: "za",
				じ: "ji",
				ず: "zu",
				ぜ: "ze",
				ぞ: "zo",
				た: "ta",
				ち: "chi",
				つ: "tsu",
				て: "te",
				と: "to",
				だ: "da",
				ぢ: "di",
				づ: "du",
				で: "de",
				ど: "do",
				な: "na",
				に: "ni",
				ぬ: "nu",
				ね: "ne",
				の: "no",
				は: "ha",
				ひ: "hi",
				ふ: "fu",
				へ: "he",
				ほ: "ho",
				ば: "ba",
				び: "bi",
				ぶ: "bu",
				べ: "be",
				ぼ: "bo",
				ぱ: "pa",
				ぴ: "pi",
				ぷ: "pu",
				ぺ: "pe",
				ぽ: "po",
				ま: "ma",
				み: "mi",
				む: "mu",
				め: "me",
				も: "mo",
				や: "ya",
				ゆ: "yu",
				いぇ: "ye",
				よ: "yo",
				ら: "ra",
				り: "ri",
				る: "ru",
				れ: "re",
				ろ: "ro",
				わ: "wa",
				うぃ: "wi",
				うぇ: "we",
				うぉ: "wo",
				を: "wo",
				ゐ: "wi",
				ゑ: "we",
				ん: "n",
				ぁ: "lya",
				ぃ: "lyi",
				ぅ: "lyu",
				ぇ: "lye",
				ぉ: "lyo",
				ゃ: "lya",
				ゅ: "lyu",
				ょ: "lyo",
				// 環境依存をなくすために、SJISにあるカタカナにしています。
				ヴぁ: "va",
				ヴぃ: "vi",
				ヴ: "vu",
				ヴぇ: "ve",
				ヴぉ: "vo",
				ゔぁ: "va",
				ゔぃ: "vi",
				ゔ: "vu",
				ゔぇ: "ve",
				ゔぉ: "vo",
				きゃ: "kya",
				きぃ: "kyi",
				きゅ: "kyu",
				きぇ: "kye",
				きょ: "kyo",
				ぎゃ: "gya",
				ぎぃ: "gyi",
				ぎゅ: "gyu",
				ぎぇ: "gye",
				ぎょ: "gyo",
				くぁ: "qa",
				くぃ: "qi",
				くぅ: "qu",
				くぇ: "qe",
				くぉ: "qo",
				ぐぁ: "gwa",
				ぐぃ: "gwi",
				ぐぅ: "gwu",
				ぐぇ: "gwe",
				ぐぉ: "gwo",
				しゃ: "sha",
				// "しぃ" : "shii" ,
				しゅ: "shu",
				しぇ: "she",
				しょ: "sho",
				じゃ: "ja",
				// "じぃ" : "jii" ,
				じゅ: "ju",
				じぇ: "je",
				じょ: "jo",
				ちゃ: "cha",
				// "ちぃ" : "chii"
				ちゅ: "chu",
				ちぇ: "che",
				ちょ: "cho",
				つぁ: "tsa",
				つぃ: "tsi",
				つぇ: "tse",
				つぉ: "tso",
				てぁ: "tha",
				てぃ: "thi",
				てゅ: "thu",
				てぇ: "the",
				てょ: "tho",
				にゃ: "nya",
				にぃ: "nyi",
				にゅ: "nyu",
				にぇ: "nye",
				にょ: "nyo",
				ひゃ: "hya",
				ひぃ: "hyi",
				ひゅ: "hyu",
				ひぇ: "hye",
				ひょ: "hyo",
				びゃ: "bya",
				びぃ: "byi",
				びゅ: "byu",
				びぇ: "bye",
				びょ: "byo",
				ぴゃ: "pya",
				ぴぃ: "pyi",
				ぴゅ: "pyu",
				ぴぇ: "pye",
				ぴょ: "pyo",
				ふぁ: "fa",
				ふぃ: "fi",
				ふぇ: "fe",
				ふぉ: "fo",
				みゃ: "mya",
				みぃ: "myi",
				みゅ: "myu",
				みぇ: "mye",
				みょ: "myo",
				りゃ: "rya",
				りぃ: "ryi",
				りゅ: "ryu",
				りぇ: "rye",
				りょ: "ryo",
				ー: "-",
				"？": "?",
				"！": "!",
				"、": ",",
				"。": "." 
			};

			/**
			 * @type {Object<string, string>}
			 */
			// prettier-ignore
			const komoji_map = {
				ぁ: "la",
				ぃ: "li",
				ぅ: "lu",
				ぇ: "le",
				ぉ: "lo",
				ゃ: "lya",
				ゅ: "lyu",
				ょ: "lyo"
			};

			/**
			 * @param {string} str
			 */
			const func = function (str) {
				let tgt = str;
				let is_xtu = false;
				// 1文字目に「っ」があるか
				if (/^っ/.test(tgt)) {
					is_xtu = true;
					tgt = tgt.replace(/^っ*/, "");
				}
				// 変換
				let trans = map[tgt];
				// 変換に失敗した場合は
				if (!trans) {
					if (trans.length === 1) {
						// 1文字なのでこれ以上変換不能
						return str;
					}
					const char_1 = trans.substring(0, 1);
					const char_2 = trans.substring(1, 2);
					// 最後の文字が小文字である
					if (!komoji_map[char_2]) {
						// これ以上変換不能
						return str;
					}
					tgt = char_1;
					const last_text = komoji_map[char_2];
					// 再度変換テスト
					trans = map[tgt];
					if (!trans) {
						// これ以上変換不能
						return str;
					}
					trans += last_text;
				}
				if (is_xtu) {
					trans = trans.substring(0, 1) + trans;
				}
				return trans;
			};
			// [っ]*[あいうえおか-ぢつ-もやゆよら-ろわゐゑをんヴ][ぁぃぅぇぉゃゅょ]? ... 促音＋子音母音
			// [ぁぃぅぇぉゃゅょゎっ] ... 小文字のみ
			// [？！－。、] ... 記号
			// prettier-ignore
			return (text.replace(/[っ]*[あいうえおか-ぢつ-もやゆよら-ろわゐゑをんヴゔ][ぁぃぅぇぉゃゅょ]?|[ぁぃぅぇぉゃゅょゎっ]|[？！－。、]/g, func));
		}

		/**
		 * カタカナからローマ字に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toRomajiFromKatakana(text) {
			return Japanese.toRomajiFromHiragana(Japanese.toHiragana(text));
		}

		/**
		 * 指定したコードポイントの横幅を取得します
		 * - 0幅 ... 結合文字, 異体字セレクタ, スキントーン修飾子, タグ文字, ゼロ幅スペース, ゼロ幅非接合子, ゼロ幅接合子, 単語結合子
		 * - 1幅 ... ASCII文字, 半角カタカナ
		 * - 2幅 ... 上記以外
		 * @param {number} cp 調査するコードポイント
		 * @returns {number} 文字の横幅
		 */
		static getWidthFromCodePoint(cp) {
			if (Unicode.isGraphemeComponentFromCodePoint(cp) || Unicode.isZeroWidthCharacterFromCodePoint(cp)) {
				return 0;
				// prettier-ignore
			} else if (cp < 0x80 || (0xFF61 <= cp && cp < 0xFFA0)) {
				return 1;
			} else {
				return 2;
			}
		}

		/**
		 * 指定したテキストの横幅を半角／全角でカウント
		 * - 0幅 ... 結合文字, 異体字セレクタ, スキントーン修飾子, タグ文字, ゼロ幅スペース, ゼロ幅非接合子, ゼロ幅接合子, 単語結合子
		 * - 1幅 ... ASCII文字, 半角カタカナ
		 * - 2幅 ... 上記以外
		 * @param {string} text - カウントしたいテキスト
		 * @returns {number} 文字の横幅
		 */
		static getWidth(text) {
			const utf32_array = Unicode.toUTF32Array(text);
			let count = 0;
			let isZWJ = false;
			for (let i = 0; i < utf32_array.length; i++) {
				if (!isZWJ) {
					count += Japanese.getWidthFromCodePoint(utf32_array[i]);
				}
				isZWJ = false;
				if (utf32_array[i] === 0x200D) {
					isZWJ = true;
				}
			}
			return count;
		}

		/**
		 * 文字幅を考慮して文字列を文字の配列に変換する
		 * @param {string} text - 変換したいテキスト
		 * @returns {Array<number[]>} UTF32(コードポイント)の配列が入った配列
		 */
		static toMojiArrayFromString(text) {
			const utf32 = Unicode.toUTF32Array(text);
			/**
			 * @type {Array<number[]>}
			 */
			const mojiarray = [];
			let moji = [];
			let isZWJ = false;
			for (let i = 0; i < utf32.length; i++) {
				const cp = utf32[i];
				if (!isZWJ && i > 0 && !Unicode.isGraphemeComponentFromCodePoint(cp)) {
					mojiarray.push(moji);
					moji = [];
				}
				moji.push(cp);
				isZWJ = false;
				if (cp === 0x200D) {
					isZWJ = true;
				}
			}
			mojiarray.push(moji);
			return mojiarray;
		}

		/**
		 * 結合した文字を考慮して文字の配列を文字列に変換する
		 * @param {Array<number[]>} mojiarray - UTF32(コードポイント)の配列が入った配列
		 * @returns {string} UTF32(コードポイント)の配列が入った配列
		 */
		static toStringFromMojiArray(mojiarray) {
			/**
			 * @type {number[]}
			 */
			const utf32 = [];
			for (let i = 0; i < mojiarray.length; i++) {
				for (let j = 0; j < mojiarray[i].length; j++) {
					utf32.push(mojiarray[i][j]);
				}
			}
			return Unicode.fromUTF32Array(utf32);
		}

		/**
		 * 指定したテキストの横幅を半角／全角で換算した場合の切り出し
		 * - 0幅 ... 結合文字, 異体字セレクタ, スキントーン修飾子, タグ文字, ゼロ幅スペース, ゼロ幅非接合子, ゼロ幅接合子, 単語結合子
		 * - 1幅 ... ASCII文字, 半角カタカナ
		 * - 2幅 ... 上記以外
		 * @param {string} text - 切り出したいテキスト
		 * @param {number} offset - 切り出し位置
		 * @param {number} size - 切り出す長さ
		 * @returns {string} 切り出したテキスト
		 * @ignore
		 */
		static cutTextForWidth(text, offset, size) {
			const moji_array = Japanese.toMojiArrayFromString(text);
			const SPACE = [0x20]; // ' '
			/**
			 * @type {Array<number[]>}
			 */
			const output = [];
			let is_target = false;
			let position = 0;
			let cut_size = size;
			if (offset < 0) {
				cut_size += offset;
				offset = 0;
			}
			if (cut_size <= 0) {
				return "";
			}
			for (let i = 0; i < moji_array.length; i++) {
				// 1文字目の横幅を取得
				const ch = moji_array[i][0];
				// prettier-ignore
				const ch_size = ch < 0x80 || (0xFF61 <= ch && ch < 0xFFA0) ? 1 : 2;
				if (position >= offset) {
					is_target = true;
					if (cut_size >= ch_size) {
						output.push(moji_array[i]);
					} else {
						output.push(SPACE);
					}
					cut_size -= ch_size;
					if (cut_size <= 0) {
						break;
					}
				}
				position += ch_size;
				// 2バイト文字の途中をoffset指定していた場合になる。
				if (position - 1 >= offset && !is_target) {
					cut_size--;
					output.push(SPACE);
				}
			}
			return Japanese.toStringFromMojiArray(output);
		}
	}

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * @typedef {import('../encode/SJIS.js').MenKuTen} MenKuTen
	 */

	/**
	 * 1981年より前に常用漢字とされているか
	 * @type {Record<number, number>}
	 * @ignore
	 */
	let joyokanji_before_1981_map = null;

	/**
	 * 1981年時点で追加された常用漢字か
	 * @type {Record<number, number>}
	 * @ignore
	 */
	let joyokanji_add_1981_map = null;

	/**
	 * 2010年時点で追加された常用漢字か
	 * @type {Record<number, number>}
	 * @ignore
	 */
	let joyokanji_add_2010_map = null;

	/**
	 * 2010年時点で削除された常用漢字か
	 * @type {Record<number, number>}
	 * @ignore
	 */
	let joyokanji_delete_2010_map = null;

	/**
	 * 2017年時点で常用漢字でかつ人名用漢字か
	 * @type {Record<number, number>}
	 * @ignore
	 */
	let jinmeiyokanji_joyokanji_isetai_2017_map = null;

	/**
	 * 2017年時点で常用漢字でないが人名用漢字か（異性体なし）
	 * @type {Record<number, number>}
	 * @ignore
	 */
	let jinmeiyokanji_notjoyokanji_2017_map = null;

	/**
	 * 2017年時点で異性体がある人名漢字
	 * @type {Record<number, number>}
	 * @ignore
	 */
	let jinmeiyokanji_notjoyokanji_isetai_2017_map = null;

	/**
	 * 調査用マップを作成するクラス
	 * @ignore
	 */
	class MOJI_CHAR_MAP {
		/**
		 * 初期化
		 */
		static init() {
			if (MOJI_CHAR_MAP.is_initmap) {
				return;
			}
			MOJI_CHAR_MAP.is_initmap = true;

			/**
			 * 文字列から、UTF32の存在マップを作成
			 * @param {string} string_data
			 * @returns {Record<number, number>}
			 */
			const createMap = function (string_data) {
				const utf32_array = Unicode.toUTF32Array(string_data);
				/**
				 * @type {Record<number, number>}
				 */
				const map = {};
				for (const key in utf32_array) {
					map[utf32_array[key]] = 1;
				}
				return map;
			};

			// 参考
			// 常用漢字一覧 - Wikipedia (2019/1/1)
			// https://ja.wikipedia.org/wiki/%E5%B8%B8%E7%94%A8%E6%BC%A2%E5%AD%97%E4%B8%80%E8%A6%A7

			{
				// prettier-ignore
				const map = [
					"亜哀愛悪握圧扱安案暗以衣位囲医依委威為胃尉異移偉意違維慰遺緯域育一壱逸芋引印因姻",
					"員院陰飲隠韻右宇羽雨畝浦運雲永泳英映栄営詠影鋭衛易疫益液駅悦越謁閲円延沿炎宴援園",
					"煙遠鉛塩演縁汚王央応往押欧殴桜翁奥横屋億憶虞乙卸音恩温穏下化火加可仮何花佳価果河",
					"科架夏家荷華菓貨過嫁暇禍寡歌箇課蚊我画芽賀雅餓介回灰会快戒改怪悔海界皆械絵開階塊",
					"解壊懐貝外劾害街慨該概各角拡革格核郭覚較隔閣確獲嚇穫学岳楽額掛括活渇割滑轄且株刈",
					"干刊甘汗完肝官冠巻看陥乾勘患貫寒喚堪換敢棺款間閑勧寛幹感漢慣管関歓監緩憾還館環簡",
					"観艦鑑丸含岸岩眼顔願企危机気岐希忌汽奇祈季紀軌既記起飢鬼帰基寄規喜幾揮期棋貴棄旗",
					"器輝機騎技宜偽欺義疑儀戯擬犠議菊吉喫詰却客脚逆虐九久及弓丘旧休吸朽求究泣急級糾宮",
					"救球給窮牛去巨居拒拠挙虚許距魚御漁凶共叫狂京享供協況峡狭恐恭胸脅強教郷境橋鏡競響",
					"驚仰暁業凝曲局極玉斤均近金菌勤琴筋禁緊謹吟銀区句苦駆具愚空偶遇屈掘繰君訓勲薫軍郡",
					"群兄刑形系径茎係型契計恵啓掲経敬景軽傾携継慶憩警鶏芸迎鯨劇撃激欠穴血決結傑潔月犬",
					"件見券肩建研県倹兼剣軒健険圏堅検献絹遣権憲賢謙繭顕験懸元幻玄言弦限原現減源厳己戸",
					"古呼固孤弧故枯個庫湖雇誇鼓顧五互午呉後娯悟碁語誤護口工公孔功巧広甲交光向后好江考",
					"行坑孝抗攻更効幸拘肯侯厚恒皇紅荒郊香候校耕航貢降高康控黄慌港硬絞項鉱構綱酵稿興衡",
					"鋼講購号合拷剛豪克告谷刻国黒穀酷獄骨込今困恨根婚混紺魂墾懇左佐査砂唆差詐鎖座才再",
					"災妻砕宰栽彩採済祭斎細菜最裁債催歳載際在材剤財罪作削昨索策酢搾錯咲冊札刷殺察撮擦",
					"雑三山参蚕惨産散算酸賛残暫士子支止氏仕史司四市矢旨死糸至伺志私使刺始姉枝祉姿思指",
					"施師紙脂視紫詞歯嗣試詩資飼誌雌賜諮示字寺次耳自似児事侍治持時滋慈辞磁璽式識軸七失",
					"室疾執湿漆質実芝写社車舎者射捨赦斜煮謝邪勺尺借釈爵若弱寂手主守朱取狩首殊珠酒種趣",
					"寿受授需儒樹収囚州舟秀周宗拾秋臭修終習週就衆集愁酬醜襲十充住柔重従渋銃獣縦叔祝宿",
					"淑粛縮熟出述術俊春瞬旬巡盾准殉純循順準潤遵処初所書庶暑署緒諸女如助序叙徐除小升少",
					"召匠床抄肖招承昇松沼昭将消症祥笑唱商渉章紹訟勝掌晶焼焦硝粧詔証象傷奨照詳彰障衝賞",
					"償礁鐘上丈冗条状乗城浄剰常情場畳蒸嬢錠譲醸色食植殖飾触嘱織職辱心申伸臣身辛侵信津",
					"神娠振浸真針深紳進森診寝慎新審震薪親人刃仁尽迅陣尋図水吹垂炊帥粋衰推酔遂睡穂錘随",
					"髄枢崇数寸瀬是井世正生成西声制姓征性青政星牲省清盛婿晴勢聖誠精製誓静請整税夕斥石",
					"赤昔析席隻惜責跡積績籍切折拙窃接設雪摂節説舌絶千川占先宣専泉浅洗染扇旋船戦践銭銑",
					"潜線遷選薦繊鮮全前善然禅漸繕阻祖租素措粗組疎訴塑礎双壮早争走奏相荘草送倉捜桑巣掃",
					"窓創喪葬装僧想層総遭操燥霜騒造像増憎蔵贈臓即束足促則息速側測俗族属賊続卒率存村孫",
					"尊損他多打妥堕惰太対体耐待怠胎退帯泰袋逮替貸隊滞態大代台第題滝宅択沢卓拓託諾濁但",
					"達脱奪丹担単炭胆探淡短嘆端誕鍛団男段断弾暖談壇地池知値恥致遅痴稚置竹畜逐蓄築秩窒",
					"茶着嫡中仲虫沖宙忠抽注昼柱衷鋳駐著貯丁弔庁兆町長帳張彫頂鳥朝脹超腸跳徴潮澄調聴懲",
					"直勅沈珍朕陳賃鎮追墜通痛坪低呈廷弟定底抵邸貞帝訂庭逓停堤提程艇締的笛摘滴適敵迭哲",
					"鉄徹撤天典店点展添転田伝殿電斗吐徒途都渡塗土奴努度怒刀冬灯当投豆東到逃倒凍唐島桃",
					"討透党悼盗陶塔湯痘登答等筒統稲踏糖頭謄闘騰同胴動堂童道働銅導峠匿特得督徳篤毒独読",
					"突届豚鈍曇内南軟難二尼弐肉日入乳尿任妊忍認寧熱年念粘燃悩納能脳農濃波派破馬婆拝杯",
					"背肺俳配排敗廃輩売倍梅培陪媒買賠白伯拍泊迫舶博薄麦縛爆箱畑八発髪伐抜罰閥反半犯帆",
					"伴判坂板版班畔般販飯搬煩頒範繁藩晩番蛮盤比皮妃否批彼肥非卑飛疲秘被悲費碑罷避尾美",
					"備微鼻匹必泌筆姫百氷表俵票評漂標苗秒病描品浜貧賓敏不夫父付布扶府怖附負赴浮婦符富",
					"普腐敷膚賦譜侮武部舞封風伏服副幅復福腹複覆払沸仏物粉紛噴墳憤奮分文聞丙平兵併並柄",
					"陛閉幣弊米壁癖別片辺返変偏遍編弁便勉歩保捕補舗母募墓慕暮簿方包芳邦奉宝抱放法胞倣",
					"峰砲崩訪報豊飽縫亡乏忙坊妨忘防房肪某冒剖紡望傍帽棒貿暴膨謀北木牧墨撲没本奔翻凡盆",
					"麻摩魔毎妹枚埋幕膜又末万満慢漫未味魅密脈妙民眠矛務無夢霧娘名命明迷盟銘鳴滅免面綿",
					"茂模毛盲耗猛網目黙門紋問匁夜野役約訳薬躍由油愉諭輸唯友有勇幽郵猶裕遊雄誘憂融優与",
					"予余誉預幼用羊洋要容庸揚揺葉陽溶腰様踊窯養擁謡曜抑浴欲翌翼裸来雷頼絡落酪乱卵覧濫",
					"欄吏利里理痢裏履離陸立律略柳流留粒隆硫旅虜慮了両良料涼猟陵量僚領寮療糧力緑林厘倫",
					"輪隣臨涙累塁類令礼冷励例鈴零霊隷齢麗暦歴列劣烈裂恋連廉練錬炉路露老労郎朗浪廊楼漏",
					"六録論和話賄惑湾腕"
				].join("");
				joyokanji_before_1981_map = createMap(map);
			}

			{
				// prettier-ignore
				const map = [
					"猿凹渦靴稼拐涯垣殻潟喝褐缶頑挟矯襟隅渓蛍嫌洪溝昆崎皿桟傘肢遮蛇酌汁塾尚宵縄壌唇甚",
					"据杉斉逝仙栓挿曹槽藻駄濯棚挑眺釣塚漬亭偵泥搭棟洞凸屯把覇漠肌鉢披扉猫頻瓶雰塀泡俸",
					"褒朴僕堀磨抹岬妄厄癒悠羅竜戻枠"
				].join("");
				joyokanji_add_1981_map = createMap(map);
			}

			{
				// prettier-ignore
				const map = [
					"通用字体挨曖宛嵐畏萎椅彙茨咽淫唄鬱怨媛艶旺岡臆俺苛牙瓦楷潰諧崖蓋骸柿顎葛釜鎌韓玩",
					"伎亀毀畿臼嗅巾僅錦惧串窟熊詣憬稽隙桁拳鍵舷股虎錮勾梗喉乞傲駒頃痕沙挫采塞埼柵刹拶",
					"斬恣摯餌鹿嫉腫呪袖羞蹴憧拭尻芯腎須裾凄醒脊戚煎羨腺詮箋膳狙遡曽爽痩踪捉遜汰唾堆戴",
					"誰旦綻緻酎貼嘲捗椎爪鶴諦溺塡妬賭藤瞳栃頓貪丼那奈梨謎鍋匂虹捻罵剝箸氾汎阪斑眉膝肘",
					"阜訃蔽餅璧蔑哺蜂貌頰睦勃昧枕蜜冥麺冶弥闇喩湧妖瘍沃拉辣藍璃慄侶瞭瑠呂賂弄籠麓脇"
				].join("");
				joyokanji_add_2010_map = createMap(map);
			}

			{
				const map = ["勺錘銑脹匁"].join("");
				joyokanji_delete_2010_map = createMap(map);
			}

			// 参考
			// 人名用漢字一覧 - Wikipedia (2019/1/1)
			// https://ja.wikipedia.org/wiki/%E4%BA%BA%E5%90%8D%E7%94%A8%E6%BC%A2%E5%AD%97%E4%B8%80%E8%A6%A7

			{
				// prettier-ignore
				const map = [
					"亞亜惡悪爲為逸逸榮栄衞衛謁謁圓円緣縁薗園應応櫻桜奧奥橫横溫温價価禍禍悔悔海海壞壊",
					"懷懐樂楽渴渇卷巻陷陥寬寛漢漢氣気祈祈器器僞偽戲戯虛虚峽峡狹狭響響曉暁勤勤謹謹駈駆",
					"勳勲薰薫惠恵揭掲鷄鶏藝芸擊撃縣県儉倹劍剣險険圈圏檢検顯顕驗験嚴厳廣広恆恒黃黄國国",
					"黑黒穀穀碎砕雜雑祉祉視視兒児濕湿實実社社者者煮煮壽寿收収臭臭從従澁渋獸獣縱縦祝祝",
					"暑暑署署緖緒諸諸敍叙將将祥祥涉渉燒焼奬奨條条狀状乘乗淨浄剩剰疊畳孃嬢讓譲釀醸神神",
					"眞真寢寝愼慎盡尽粹粋醉酔穗穂瀨瀬齊斉靜静攝摂節節專専戰戦纖繊禪禅祖祖壯壮爭争莊荘",
					"搜捜巢巣曾曽裝装僧僧層層瘦痩騷騒增増憎憎藏蔵贈贈臟臓卽即帶帯滯滞瀧滝單単嘆嘆團団",
					"彈弾晝昼鑄鋳著著廳庁徵徴聽聴懲懲鎭鎮轉転傳伝都都嶋島燈灯盜盗稻稲德徳突突難難拜拝",
					"盃杯賣売梅梅髮髪拔抜繁繁晚晩卑卑祕秘碑碑賓賓敏敏冨富侮侮福福拂払佛仏勉勉步歩峯峰",
					"墨墨飜翻每毎萬万默黙埜野彌弥藥薬與与搖揺樣様謠謡來来賴頼覽覧欄欄龍竜虜虜凉涼綠緑",
					"淚涙壘塁類類禮礼曆暦歷歴練練鍊錬郞郎朗朗廊廊錄録"
				].join("");
				jinmeiyokanji_joyokanji_isetai_2017_map = createMap(map);
			}

			{
				// prettier-ignore
				const map = [
					"丑丞乃之乎也云些亦亥亨亮仔伊伍伽佃佑伶侃侑俄俠俣俐倭俱倦倖偲傭儲允兎兜其冴凌凧凪",
					"凰凱函劉劫勁勺勿匁匡廿卜卯卿厨厩叉叡叢叶只吾吞吻哉哨啄哩喬喧喰喋嘩嘉嘗噌噂圃圭坐",
					"坦埴堰堺堵塙壕壬夷奄奎套娃姪姥娩嬉孟宏宋宕宥寅寓寵尖尤屑峨峻崚嵯嵩嶺巫已巳巴巷巽",
					"帖幌幡庄庇庚庵廟廻弘弛彗彦彪彬徠忽怜恢恰恕悌惟惚悉惇惹惺惣慧憐戊或戟托按挺挽掬捲",
					"捷捺捧掠揃摑摺撒撰撞播撫擢孜敦斐斡斧斯於旭昂昊昏昌昴晏晒晋晟晦晨智暉暢曙曝曳朋朔",
					"杏杖杜李杭杵杷枇柑柴柘柊柏柾柚栞桔桂栖桐栗梧梓梢梛梯桶梶椛梁棲椋椀楯楚楕椿楠楓椰",
					"楢楊榎樺榊榛槍槌樫槻樟樋橘樽橙檎檀櫂櫛櫓欣欽歎此殆毅毘毬汀汝汐汲沌沓沫洸洲洵洛浩",
					"浬淵淳淀淋渥渾湘湊湛溢滉溜漱漕漣澪濡瀕灘灸灼烏焰焚煌煤煉熙燕燎燦燭燿爾牒牟牡牽犀",
					"狼獅玖珂珈珊珀玲琉瑛琥琶琵琳瑚瑞瑶瑳瓜瓢甥甫畠畢疋疏皐皓眸瞥矩砦砥砧硯碓碗碩碧磐",
					"磯祇禽禾秦秤稀稔稟稜穹穿窄窪窺竣竪竺竿笈笹笙笠筈筑箕箔篇篠簞簾籾粥粟糊紘紗紐絃紬",
					"絆絢綺綜綴緋綾綸縞徽繫繡纂纏羚翔翠耀而耶耽聡肇肋肴胤胡脩腔脹膏臥舜舵芥芹芭芙芦苑",
					"茄苔苺茅茉茸茜莞荻莫莉菅菫菖萄菩萊菱葦葵萱葺萩董葡蓑蒔蒐蒼蒲蒙蓉蓮蔭蔣蔦蓬蔓蕎蕨",
					"蕉蕃蕪薙蕾蕗藁薩蘇蘭蝦蝶螺蟬蟹蠟衿袈袴裡裟裳襖訊訣註詢詫誼諏諄諒謂諺讃豹貰賑赳跨",
					"蹄蹟輔輯輿轟辰辻迂迄辿迪迦這逞逗逢遁遼邑祁郁鄭酉醇醐醍醬釉釘釧銑鋒鋸錘錐錆錫鍬鎧",
					"閃閏閤阿陀隈隼雀雁雛雫霞靖鞄鞍鞘鞠鞭頁頌頗顚颯饗馨馴馳駕駿驍魁魯鮎鯉鯛鰯鱒鱗鳩鳶",
					"鳳鴨鴻鵜鵬鷗鷲鷺鷹麒麟麿黎黛鼎"
				].join("");
				jinmeiyokanji_notjoyokanji_2017_map = createMap(map);
			}

			{
				// prettier-ignore
				const map = [
					"亙亘凛凜堯尭巖巌晄晃檜桧槇槙渚渚猪猪琢琢禰祢祐祐禱祷祿禄禎禎穰穣萠萌遙遥"
				].join("");
				jinmeiyokanji_notjoyokanji_isetai_2017_map = createMap(map);
			}
		}

		/**
		 * チェック用マップ
		 */
		static JOYOJANJI_BEFORE_1981() {
			MOJI_CHAR_MAP.init();
			return joyokanji_before_1981_map;
		}

		/**
		 * チェック用マップ
		 */
		static JOYOKANJI_ADD_1981() {
			MOJI_CHAR_MAP.init();
			return joyokanji_add_1981_map;
		}

		/**
		 * チェック用マップ
		 */
		static JOYOKANJI_ADD_2010() {
			MOJI_CHAR_MAP.init();
			return joyokanji_add_2010_map;
		}

		/**
		 * チェック用マップ
		 */
		static JOYOKANJI_DELETE_2010() {
			MOJI_CHAR_MAP.init();
			return joyokanji_delete_2010_map;
		}

		/**
		 * チェック用マップ
		 */
		static JINMEIYOKANJI_JOYOKANJI_ISETAI_2017() {
			MOJI_CHAR_MAP.init();
			return jinmeiyokanji_joyokanji_isetai_2017_map;
		}

		/**
		 * チェック用マップ
		 */
		static JINMEIYOKANJI_NOTJOYOKANJI_2017() {
			MOJI_CHAR_MAP.init();
			return jinmeiyokanji_notjoyokanji_2017_map;
		}

		/**
		 * チェック用マップ
		 */
		static JINMEIYOKANJI_NOTJOYOKANJI_ISETAI_2017() {
			MOJI_CHAR_MAP.init();
			return jinmeiyokanji_notjoyokanji_isetai_2017_map;
		}
	}

	/**
	 * マップを初期化した否か
	 */
	MOJI_CHAR_MAP.is_initmap = false;

	/**
	 * 文字の解析用クラス
	 * @ignore
	 */
	class MojiAnalizerTools {
		/**
		 * 指定したコードポイントの漢字は1981年より前に常用漢字とされているか判定する
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @returns {boolean} 判定結果
		 */
		static isJoyoKanjiBefore1981(unicode_codepoint) {
			const joyokanji_before_1981_map = MOJI_CHAR_MAP.JOYOJANJI_BEFORE_1981();
			return !!joyokanji_before_1981_map[unicode_codepoint];
		}

		/**
		 * 指定したコードポイントの漢字は1981年時点で常用漢字かを判定する
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @returns {boolean} 判定結果
		 */
		static isJoyoKanji1981(unicode_codepoint) {
			const joyokanji_before_1981_map = MOJI_CHAR_MAP.JOYOJANJI_BEFORE_1981();
			const joyokanji_add_1981_map = MOJI_CHAR_MAP.JOYOKANJI_ADD_1981();
			return !!joyokanji_before_1981_map[unicode_codepoint] || !!joyokanji_add_1981_map[unicode_codepoint];
		}

		/**
		 * 指定したコードポイントの漢字は2010年時点で常用漢字かを判定する
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @returns {boolean} 判定結果
		 */
		static isJoyoKanji2010(unicode_codepoint) {
			const joyokanji_add_2010_map = MOJI_CHAR_MAP.JOYOKANJI_ADD_2010();
			const joyokanji_delete_2010_map = MOJI_CHAR_MAP.JOYOKANJI_DELETE_2010();
			if (joyokanji_delete_2010_map[unicode_codepoint]) {
				return false;
			}
			const x = MojiAnalizerTools.isJoyoKanji1981(unicode_codepoint);
			return x || !!joyokanji_add_2010_map[unicode_codepoint];
		}

		/**
		 * 指定したコードポイントの漢字は2017年時点で人名漢字でのみ存在するかを判定する
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @returns {boolean} 判定結果
		 */
		static isOnlyJinmeiyoKanji2017(unicode_codepoint) {
			if (MojiAnalizerTools.isJoyoKanji2010(unicode_codepoint)) {
				return false;
			}
			const jinmeiyokanji_joyokanji_isetai_map = MOJI_CHAR_MAP.JINMEIYOKANJI_JOYOKANJI_ISETAI_2017();
			const jinmeiyokanji_notjoyokanji_map = MOJI_CHAR_MAP.JINMEIYOKANJI_NOTJOYOKANJI_2017();
			const jinmeiyokanji_notjoyokanji_isetai_map = MOJI_CHAR_MAP.JINMEIYOKANJI_NOTJOYOKANJI_ISETAI_2017();
			return (
				!!jinmeiyokanji_joyokanji_isetai_map[unicode_codepoint] ||
				!!jinmeiyokanji_notjoyokanji_map[unicode_codepoint] ||
				!!jinmeiyokanji_notjoyokanji_isetai_map[unicode_codepoint]
			);
		}

		/**
		 * 指定したコードポイントの漢字は2017年時点で人名漢字で許可されているかを判定する
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @returns {boolean} 判定結果
		 */
		static isJinmeiyoKanji2017(unicode_codepoint) {
			return (
				MojiAnalizerTools.isJoyoKanji2010(unicode_codepoint) ||
				MojiAnalizerTools.isOnlyJinmeiyoKanji2017(unicode_codepoint)
			);
		}

		/**
		 * 指定したコードポイントの漢字は本ソースコードの最新の時点で常用漢字かを判定する
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @returns {boolean} 判定結果
		 */
		static isJoyoKanji(unicode_codepoint) {
			return MojiAnalizerTools.isJoyoKanji2010(unicode_codepoint);
		}

		/**
		 * 指定したコードポイントの漢字は本ソースコードの最新の時点で人名漢字でのみ存在するかを判定する
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @returns {boolean} 判定結果
		 */
		static isOnlyJinmeiyoKanji(unicode_codepoint) {
			return MojiAnalizerTools.isOnlyJinmeiyoKanji2017(unicode_codepoint);
		}

		/**
		 * 指定したコードポイントの漢字は本ソースコードの最新の時点で人名漢字で許可されているかを判定する
		 * @param {number} unicode_codepoint - Unicodeのコードポイント
		 * @returns {boolean} 判定結果
		 */
		static isJinmeiyoKanji(unicode_codepoint) {
			return MojiAnalizerTools.isJinmeiyoKanji2017(unicode_codepoint);
		}
	}

	/**
	 * 文字のエンコード情報
	 * @typedef {Object} MojiEncodeData
	 * @property {MenKuTen} kuten 区点 コード
	 * @property {MenKuTen} menkuten 面区点 コード
	 * @property {number} cp932_code CP932(Windows-31J) コード
	 * @property {number} sjis2004_code Shift_JIS-2004 コード
	 * @property {number[]} utf8_array UTF-8 配列
	 * @property {number[]} utf16_array UTF-16 配列
	 * @property {number[]} utf32_array UTF-32 配列
	 * @property {number[]} cp932_array CP932(Windows-31J) バイト配列
	 * @property {number[]} sjis2004_array Shift_JIS-2004 コード バイト配列
	 * @property {number[]} shift_jis_array Shift_JIS バイト配列
	 * @property {number[]} iso2022jp_array ISO-2022-JP バイト配列
	 * @property {number[]} eucjpms_array eucJP-ms バイト配列
	 * @property {number[]} eucjis2004_array EUC-JP-2004 バイト配列
	 * 
	 * 文字の種別情報
	 * @typedef {Object} MojiTypeData
	 * @property {boolean} is_regular_sjis Shift_JIS に登録された文字
	 * @property {boolean} is_regular_sjis2004 Shift_JIS-2004 に登録された文字
	 * @property {boolean} is_joyo_kanji 常用漢字
	 * @property {boolean} is_jinmeiyo_kanji 人名用漢字
	 * @property {boolean} is_gaiji_cp932 Windows-31J(CP932) 外字
	 * @property {boolean} is_IBM_extended_character Windows-31J(CP932) IBM拡張文字
	 * @property {boolean} is_NEC_selection_IBM_extended_character Windows-31J(CP932) NEC選定IBM拡張文字
	 * @property {boolean} is_NEC_special_character Windows-31J(CP932) NEC特殊文字
	 * @property {number} kanji_suijun Shift_JIS-2004 を使用して漢字の水準調査(1未満だと水準調査失敗)
	 * @property {boolean} is_surrogate_pair 要 Unicode サロゲートペア
	 * @property {string} control_name 制御文字名（制御文字ではない場合は null）
	 * @property {boolean} is_control_charcter 制御文字
	 * @property {string} blockname Unicodeブロック名
	 * @property {boolean} is_kanji 漢字
	 * @property {boolean} is_hiragana ひらがな
	 * @property {boolean} is_katakana カタカナ
	 * @property {boolean} is_fullwidth_ascii 全角ASCII
	 * @property {boolean} is_halfwidth_katakana 半角カタカナ
	 * @property {boolean} is_emoji 絵文字
	 * @property {boolean} is_emoticons 顔文字
	 * @property {boolean} is_symbol_base 記号(VS16 が付くと絵文字化)
	 * @property {boolean} is_gaiji 外字
	 * @property {boolean} is_grapheme_component グラフェムを構成するための文字
	 * @property {boolean} is_zero_width_character ゼロ幅文字
	 * @property {boolean} is_combining_mark 結合文字
	 * @property {boolean} is_variation_selector 異体字セレクタ
	 * @property {boolean} is_skin_tone_modifier スキントーン修飾子
	 * @property {boolean} is_tag_character タグ文字
	 * 
	 * 文字の種別情報
	 * @typedef {Object} MojiData
	 * @property {MojiEncodeData} encode 文字のエンコード情報
	 * @property {MojiTypeData} type 文字の種別情報
	 * @property {string} character 解析した文字
	 * @property {number} codepoint 解析した文字のコードポイント
	 */

	/**
	 * 文字の解析用クラス
	 * @ignore
	 */
	class MojiAnalyzer {
		/**
		 * 初期化
		 * @returns {MojiData}
		 * @ignore
		 */
		static _createMojiData() {
			/**
			 * @type {MojiEncodeData}
			 */
			const encode = {
				kuten: null,
				menkuten: null,
				cp932_code: 0,
				sjis2004_code: 0,
				utf8_array: [],
				utf16_array: [],
				utf32_array: [],
				cp932_array: [],
				sjis2004_array: [],
				shift_jis_array: [],
				iso2022jp_array: [],
				eucjpms_array: [],
				eucjis2004_array: []
			};

			/**
			 * @type {MojiTypeData}
			 */
			const type = {
				is_regular_sjis: false,
				is_regular_sjis2004: false,
				is_joyo_kanji: false,
				is_jinmeiyo_kanji: false,
				is_gaiji_cp932: false,
				is_IBM_extended_character: false,
				is_NEC_selection_IBM_extended_character: false,
				is_NEC_special_character: false,
				kanji_suijun: -1,
				is_surrogate_pair: false,
				control_name: null,
				is_control_charcter: false,
				blockname: "",
				is_kanji: false,
				is_hiragana: false,
				is_katakana: false,
				is_fullwidth_ascii: false,
				is_halfwidth_katakana: false,
				is_emoji: false,
				is_emoticons: false,
				is_symbol_base: false,
				is_gaiji: false,
				is_grapheme_component: false,
				is_zero_width_character: false,
				is_combining_mark: false,
				is_variation_selector: false,
				is_skin_tone_modifier: false,
				is_tag_character: false
			};

			/**
			 * @type {MojiData}
			 */
			const data = {
				encode: encode,
				type: type,
				character: null,
				codepoint: 0
			};

			return data;
		}

		/**
		 * 指定した1つのUTF-32 コードポイントに関して、解析を行い情報を返します
		 * @param {number} unicode_codepoint - UTF-32 のコードポイント
		 * @returns {MojiData} 文字の情報がつまったオブジェクト
		 */
		static getMojiData(unicode_codepoint) {
			// 基本情報取得
			const cp932code = CP932.toCP932FromUnicode(unicode_codepoint);
			const sjis2004code = SJIS2004.toSJIS2004FromUnicode(unicode_codepoint);
			const kuten = SJIS.toKuTenFromSJISCode(cp932code);
			const menkuten = SJIS.toMenKuTenFromSJIS2004Code(sjis2004code);
			const is_regular_sjis = cp932code < 0x100 || SJIS.isRegularMenKuten(kuten);
			const is_regular_sjis2004 = sjis2004code < 0x100 || SJIS.isRegularMenKuten(menkuten);

			/**
			 * 出力データの箱を用意
			 * @type {MojiData}
			 */
			const data = MojiAnalyzer._createMojiData();
			const encode = data.encode;
			const type = data.type;
			const character = Unicode.fromCodePoint(unicode_codepoint);
			data.character = character;
			data.codepoint = unicode_codepoint;

			// 句点と面区点情報(ない場合はnullになる)
			encode.kuten = kuten;
			encode.menkuten = menkuten;
			// コードの代入
			encode.cp932_code = cp932code ? cp932code : -1;
			encode.sjis2004_code = sjis2004code ? sjis2004code : -1;

			// Shift_JIS として許容されるか
			type.is_regular_sjis = is_regular_sjis;
			type.is_regular_sjis2004 = is_regular_sjis2004;

			// 漢字が常用漢字か、人名用漢字かなど
			type.is_joyo_kanji = MojiAnalizerTools.isJoyoKanji(unicode_codepoint);
			type.is_jinmeiyo_kanji = MojiAnalizerTools.isJinmeiyoKanji(unicode_codepoint);

			// Windows-31J(CP932) に関しての調査
			// 外字, IBM拡張文字, NEC選定IBM拡張文字, NEC特殊文字
			// prettier-ignore
			type.is_gaiji_cp932 = cp932code ? 0xF040 <= cp932code && cp932code <= 0xF9FC : false;
			// prettier-ignore
			type.is_IBM_extended_character = cp932code ? 0xFA40 <= cp932code && cp932code <= 0xFC4B : false;
			// prettier-ignore
			type.is_NEC_selection_IBM_extended_character = cp932code ? 0xED40 <= cp932code && cp932code <= 0xEEFC : false;
			// prettier-ignore
			type.is_NEC_special_character = cp932code ? 0x8740 <= cp932code && cp932code <= 0x879C : false;

			// Shift_JIS-2004 を使用して漢字の水準調査(ない場合はnullになる)
			type.kanji_suijun = SJIS.toJISKanjiSuijunFromSJISCode(sjis2004code);

			// Unicodeの配列
			encode.utf8_array = Unicode.toUTF8Array(data.character);
			encode.utf16_array = Unicode.toUTF16Array(data.character);
			encode.utf32_array = [unicode_codepoint];
			type.is_surrogate_pair = encode.utf16_array.length > 1;

			// SJIS系の配列
			// prettier-ignore
			encode.cp932_array = cp932code ? (cp932code >= 0x100 ? [cp932code >> 8, cp932code & 0xFF] : [cp932code]) : [];
			encode.sjis2004_array = sjis2004code
				? sjis2004code >= 0x100
					? [sjis2004code >> 8, sjis2004code & 0xFF]
					: [sjis2004code]
				: [];

			// EUC-JP系の配列
			encode.eucjpms_array = EUCJPMS.toEUCJPMSBinary(character);
			encode.eucjis2004_array = EUCJIS2004.toEUCJIS2004Binary(character);

			/**
			 * EUC-JP変換エラー確認
			 * @param {string} character 調査する文字（1文字）
			 * @param {number[]} array 変換を終えたEUC-JPの配列
			 * @return {number[]} 修正後の配列
			 */
			const checkEUCJPError = function (character, array) {
				// 文字が "?" でないにも関わらず、エンコード後が "?"(0x3F) の場合は変換エラーとみなす
				const ng = "?".charCodeAt(0);
				if (character !== "?" && array.length === 1 && array[0] === ng) {
					return [];
				} else {
					return array;
				}
			};
			encode.eucjpms_array = checkEUCJPError(character, encode.eucjpms_array);
			encode.eucjis2004_array = checkEUCJPError(character, encode.eucjis2004_array);

			// ISO-2022-JP , EUC-JP
			// prettier-ignore
			if (cp932code < 0xE0 || is_regular_sjis) {
				// prettier-ignore
				if (cp932code < 0x80) {
					encode.shift_jis_array = [cp932code];
					encode.iso2022jp_array = [];
					// prettier-ignore
				} else if (cp932code < 0xE0) {
					// 半角カタカナの扱い
					encode.shift_jis_array = [cp932code];
					encode.iso2022jp_array = [];
				} else if (kuten.ku <= 94) {
					// 区点は94まで利用できる。
					// つまり、最大でも 94 + 0xA0 = 0xFE となり 0xFF 以上にならない
					encode.shift_jis_array = [encode.cp932_array[0], encode.cp932_array[1]];
					encode.iso2022jp_array = [kuten.ku + 0x20, kuten.ten + 0x20];
				}
			} else {
				encode.shift_jis_array = [];
				encode.iso2022jp_array = [];
			}
			// SJISとして正規でなければ強制エンコード失敗
			if (!is_regular_sjis) {
				encode.shift_jis_array = [];
				encode.iso2022jp_array = [];
			}

			// 制御文字かどうか
			type.control_name = Unicode.toControlCharcterName(unicode_codepoint);
			type.is_control_charcter = type.control_name ? true : false;

			// Unicodeのブロック名
			type.blockname = Unicode.toBlockNameFromUnicode(unicode_codepoint);
			// ブロック名から判断
			type.is_kanji = /Ideographs/.test(type.blockname);
			type.is_hiragana = /Hiragana/.test(type.blockname);
			type.is_katakana = /Katakana/.test(type.blockname);
			type.is_fullwidth_ascii = /[\u3000\uFF01-\uFF5E]/.test(data.character);
			type.is_halfwidth_katakana = /[\uFF61-\uFF9F]/.test(data.character);
			// 絵文字
			type.is_emoji = /Pictographs|Transport and Map Symbols/.test(type.blockname);
			// 顔文字
			type.is_emoticons = /Emoticons/.test(type.blockname);
			// 記号(VS16 が付くと絵文字化)
			type.is_symbol_base = /Dingbats|Miscellaneous Symbols/.test(type.blockname);
			// 外字
			type.is_gaiji = /Private Use Area/.test(type.blockname);
			// グラフェムを構成するための文字
			type.is_grapheme_component = Unicode.isGraphemeComponentFromCodePoint(unicode_codepoint);
			// 横幅が 0 の文字
			type.is_zero_width_character = Unicode.isZeroWidthCharacterFromCodePoint(unicode_codepoint);
			// 結合文字
			type.is_combining_mark = Unicode.isCombiningMarkFromCodePoint(unicode_codepoint);
			// 異体字セレクタ
			type.is_variation_selector = Unicode.isVariationSelectorFromCodePoint(unicode_codepoint);
			// スキントーン修飾子
			type.is_skin_tone_modifier = Unicode.isEmojiModifierFromCodePoint(unicode_codepoint);
			// タグ文字
			type.is_tag_character = Unicode.isTagCharacterFromCodePoint(unicode_codepoint);

			return data;
		}
	}

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * 文字列比較関数を作成用のツールクラス
	 * @ignore
	 */
	class ComparatorTool {
		/**
		 * 文字列の揺れを除去し正規化します。
		 * @param {string} string_data - 正規化したいテキスト
		 * @returns {string} 正規化後のテキスト
		 */
		static toNormalizeString(string_data) {
			let normalize_text = null;
			// NORM_IGNOREWIDTH 半角全角区別しない（半角英数記号と全角カタカナに統一）
			normalize_text = Japanese.toHalfWidthAsciiCode(Japanese.toHalfWidthAsciiCode(string_data));
			// LCMAP_LOWERCASE 半角に統一
			normalize_text = normalize_text.toLowerCase();
			// NORM_IGNOREKANATYPE ひらがなとカタカナを区別しない
			normalize_text = Japanese.toHiragana(normalize_text);
			// NORM_IGNORENONSPACE 簡単に場所をとらない記号を削除
			normalize_text = normalize_text.replace(/[゛゜]/g, "");
			// NORM_IGNORESYMBOLS 英文法の記号を無視
			normalize_text = normalize_text.replace(/["'-]/g, "");
			return normalize_text;
		}

		/**
		 * ASCIIコードが半角数値かどうかを判定する
		 * @param {number} string_number - ASCIIコード
		 * @returns {boolean} 数値ならTRUE
		 */
		static isNumberAscii(string_number) {
			const ASCII_0 = 0x30;
			const ASCII_9 = 0x39;
			return ASCII_0 <= string_number && string_number <= ASCII_9;
		}

		/**
		 * ASCIIコード配列の中で指定した位置から数値が何バイト続くか
		 * @param {number[]} string_number_array - ASCIIコードの配列
		 * @param {number} offset - どの位置から調べるか
		 * @returns {number} 数値ならTRUE
		 */
		static getNumberAsciiLength(string_number_array, offset) {
			for (let i = offset; i < string_number_array.length; i++) {
				if (!ComparatorTool.isNumberAscii(string_number_array[i])) {
					return i - offset;
				}
			}
			return string_number_array.length - offset;
		}

		/**
		 * ASCIIコード配列の中の指定した位置にある数値データ同士をCompareする
		 * @param {number[]} t1 - ASCIIコードの配列（比較元）
		 * @param {number} t1off - どの位置から調べるか
		 * @param {number} t1size - 調べるサイズ
		 * @param {number[]} t2 - ASCIIコードの配列（比較先）
		 * @param {number} t2off - どの位置から調べるか
		 * @param {number} t2size - 調べるサイズ
		 * @returns {number} Compare結果
		 */
		static compareNumber(t1, t1off, t1size, t2, t2off, t2size) {
			const ASCII_0 = 0x30;
			const t1end = t1off + t1size;
			const t2end = t2off + t2size;
			// 前方から調査
			let t1p = t1off;
			let t2p = t2off;
			// 先頭の0は飛ばして比較したい
			// 0以外の数値がどこに含まれているか調査
			for (; t1p < t1end; t1p++) {
				if (t1[t1p] !== ASCII_0) {
					break;
				}
			}
			for (; t2p < t2end; t2p++) {
				if (t2[t2p] !== ASCII_0) {
					break;
				}
			}
			// 0しかなかった場合
			if (t1p == t1end || t2p == t2end) {
				if (t1p != t1end) {
					//t2pのみはみだした == 0
					return 1;
				} else if (t2p != t2end) {
					return -1;
				} else {
					return 0;
				}
			}
			// 桁数のみでどちらが大きいか比較
			const t1keta = t1size - (t1p - t1off);
			const t2keta = t2size - (t2p - t2off);
			if (t1keta > t2keta) {
				return 1;
			} else if (t1keta < t2keta) {
				return -1;
			}
			// 同じ桁同士の比較
			for (; t1p < t1end;) {
				if (t1[t1p] > t2[t2p]) {
					return 1;
				} else if (t1[t1p] < t2[t2p]) {
					return -1;
				}
				t1p++;
				t2p++;
			}
			return 0;
		}

		/**
		 * ASCIIコード配列の同士をCompareする
		 * @param {number[]} t1 - ASCIIコードの配列（比較元）
		 * @param {number[]} t2 - ASCIIコードの配列（比較先）
		 * @returns {number} Compare結果
		 */
		static compareText(t1, t2) {
			const l1 = t1.length;
			const l2 = t2.length;
			if (l1 === 0 && l2 === 0) {
				return 0;
			}
			if (l1 === 0) {
				return -1;
			}
			if (l2 === 0) {
				return 1;
			}
			//この地点で両方とも長さが1より大きい
			let t1off = 0;
			let t2off = 0;
			while (t1off <= l1 && t2off <= l2) {
				const t1isnum = ComparatorTool.isNumberAscii(t1[t1off]);
				const t2isnum = ComparatorTool.isNumberAscii(t2[t2off]);
				//文字目の種類が違う
				if (t1isnum !== t2isnum) {
					if (t1isnum) {
						return -1; //数値が前
					} else {
						return 1; //文字が後ろ
					}
				}
				//両方とも数値
				if (t1isnum) {
					const t1size = ComparatorTool.getNumberAsciiLength(t1, t1off);
					const t2size = ComparatorTool.getNumberAsciiLength(t2, t2off);
					const r = ComparatorTool.compareNumber(t1, t1off, t1size, t2, t2off, t2size);
					if (r !== 0) {
						return r;
					}
					t1off += t1size;
					t2off += t2size;
				}
				//両方とも文字列
				else {
					if (t1[t1off] > t2[t2off]) {
						return 1;
					} else if (t1[t1off] < t2[t2off]) {
						return -1;
					}
					t1off++;
					t2off++;
				}
				//両方ともオーバー
				if (t1off >= l1 && t2off >= l2) {
					//長さも等しい
					if (l1 === l2) {
						return 0;
					} else if (l1 > l2) {
						return 1;
					} else {
						return -1;
					}
				}
				//片方のほうがサイズが大きい
				else if (t2off >= l2) {
					//t2の方が短い
					return 1;
				} else if (t1off >= l1) {
					//t1の方が短い
					return -1;
				}
			}
			// ※ここには達成しない
			return 0;
		}

		/**
		 * 2つの文字列を比較する
		 *
		 * @param {any} a - 比較元
		 * @param {any} b - 比較先
		 * @returns {number} Compare結果
		 */
		static compareToForDefault(a, b) {
			if (a === b) {
				return 0;
			}
			if (typeof a === typeof b) {
				return a < b ? -1 : 1;
			}
			return typeof a < typeof b ? -1 : 1;
		}

		/**
		 * 2つの文字列を自然順に比較を行う（自然順ソート（Natural Sort）用）
		 * - 入力引数は文字列化して比較します
		 *
		 * @param {any} a - 比較元
		 * @param {any} b - 比較先
		 * @returns {number} Compare結果
		 */
		static compareToForNatural(a, b) {
			if (a.toString === undefined || b.toString === undefined) {
				return 0;
			}
			const a_str = Unicode.toUTF16Array(ComparatorTool.toNormalizeString(a.toString()));
			const b_str = Unicode.toUTF16Array(ComparatorTool.toNormalizeString(b.toString()));
			return ComparatorTool.compareText(a_str, b_str);
		}
	}

	/**
	 * 日本語の文字列比較用の関数
	 * - sortの引数で利用できます
	 * @ignore
	 */
	const stringComparator = {
		/**
		 * 2つの文字列を比較する関数
		 * @type {function(any, any): number}
		 */
		DEFAULT: ComparatorTool.compareToForDefault,

		/**
		 * 2つの文字列を自然順ソートで比較する関数
		 * - 入力引数は文字列化して比較します
		 *
		 * @type {function(any, any): number}
		 */
		NATURAL: ComparatorTool.compareToForNatural
	};

	/**
	 * The script is part of Mojix.
	 *
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 *
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */


	/**
	 * @typedef {import('./encode/SJIS.js').MenKuTen} MenKuTen
	 * @typedef {import('./tools/MojiAnalyzer.js').MojiData} MojiData
	 */

	/**
	 * 日本語を扱うための様々な機能を提供します
	 */
	class Mojix {
		// ---------------------------------
		// 文字列のエンコードとデコードを扱う関数
		// ---------------------------------

		/**
		 * 文字列からバイナリ配列にエンコードする
		 * @param {string} text - 変換したいテキスト
		 * @param {string} charset - キャラセット(UTF-8/16/32,Shift_JIS,Windows-31J,Shift_JIS-2004,EUC-JP,EUC-JP-2004)
		 * @param {boolean} [is_with_bom=false] - BOMをつけるかどうか
		 * @returns {number[]} バイナリ配列(失敗時はnull)
		 */
		static encode(text, charset, is_with_bom) {
			return Encode.encode(text, charset, is_with_bom);
		}

		/**
		 * バイナリ配列から文字列にデコードする
		 * @param {number[]} binary - 変換したいバイナリ配列
		 * @param {string} [charset="autodetect"] - キャラセット(UTF-8/16/32,Shift_JIS,Windows-31J,Shift_JIS-2004,EUC-JP,EUC-JP-2004)
		 * @returns {string} 変換した文字列（失敗したらnull）
		 */
		static decode(binary, charset) {
			return Encode.decode(binary, charset);
		}

		// ---------------------------------
		// Unicode を扱う関数群
		// ---------------------------------

		/**
		 * サロゲートペア対応のコードポイント取得
		 * @param {string} text - 対象テキスト
		 * @param {number} [index = 0] - インデックス
		 * @returns {number} コードポイント
		 */
		static codePointAt(text, index) {
			return Unicode.codePointAt(text, index);
		}

		/**
		 * コードポイントの数値データを文字列に変換
		 * @param {...(number|number[])} codepoint - 変換したいコードポイントの数値配列、又は数値を並べた可変引数
		 * @returns {string} 変換後のテキスト
		 */
		static fromCodePoint(codepoint) {
			if (codepoint instanceof Array) {
				return Unicode.fromCodePoint(codepoint);
			} else {
				const codepoint_array = [];
				for (let i = 0; i < arguments.length; i++) {
					codepoint_array[i] = arguments[i];
				}
				return Unicode.fromCodePoint(codepoint_array);
			}
		}

		/**
		 * コードポイント換算で文字列数をカウント
		 * @param {string} text - 対象テキスト
		 * @param {number} [beginIndex=0] - 最初のインデックス（省略可）
		 * @param {number} [endIndex] - 最後のインデックス（ここは含めない）（省略可）
		 * @returns {number} 文字数
		 */
		static codePointCount(text, beginIndex, endIndex) {
			return Unicode.codePointCount(text, beginIndex, endIndex);
		}

		/**
		 * 文字列をUTF32(コードポイント)の配列に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} UTF32(コードポイント)のデータが入った配列
		 */
		static toUTF32Array(text) {
			return Unicode.toUTF32Array(text);
		}

		/**
		 * UTF32の配列から文字列に変換
		 * @param {number[]} utf32 - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromUTF32Array(utf32) {
			return Unicode.fromUTF32Array(utf32);
		}

		/**
		 * 文字列をUTF16の配列に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} UTF16のデータが入った配列
		 */
		static toUTF16Array(text) {
			return Unicode.toUTF16Array(text);
		}

		/**
		 * UTF16の配列から文字列に変換
		 * @param {number[]} utf16 - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromUTF16Array(utf16) {
			return Unicode.fromUTF16Array(utf16);
		}

		/**
		 * 文字列をUTF8の配列に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {number[]} UTF8のデータが入った配列
		 */
		static toUTF8Array(text) {
			return Unicode.toUTF8Array(text);
		}

		/**
		 * UTF8の配列から文字列に変換
		 * @param {number[]} utf8 - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static fromUTF8Array(utf8) {
			return Unicode.fromUTF8Array(utf8);
		}

		// ---------------------------------
		// 文字を扱う関数群
		// ---------------------------------

		/**
		 * 結合した文字を考慮して文字列を文字の配列に変換する
		 * @param {string} text - 変換したいテキスト
		 * @returns {Array<number[]>} UTF32(コードポイント)の配列が入った配列
		 */
		static toMojiArrayFromString(text) {
			return Japanese.toMojiArrayFromString(text);
		}

		/**
		 * 結合した文字を考慮して文字の配列を文字列に変換する
		 * @param {Array<number[]>} mojiarray - UTF32(コードポイント)の配列が入った配列
		 * @returns {string} UTF32(コードポイント)の配列が入った配列
		 */
		static toStringFromMojiArray(mojiarray) {
			return Japanese.toStringFromMojiArray(mojiarray);
		}

		// ---------------------------------
		// 切り出しを扱う関数群
		// ---------------------------------

		/**
		 * 指定したテキストを切り出す
		 * - 単位はコードポイントの文字数
		 * - 結合文字, 異体字セレクタ, スキントーン修飾子, タグ文字を考慮しません
		 * @param {string} text - 切り出したいテキスト
		 * @param {number} offset - 切り出し位置
		 * @param {number} size - 切り出す長さ
		 * @returns {string} 切り出したテキスト
		 */
		static cutTextForCodePoint(text, offset, size) {
			return Unicode.cutTextForCodePoint(text, offset, size);
		}

		/**
		 * 指定したテキストの横幅を半角／全角でカウント
		 * - 0幅 ... 結合文字, 異体字セレクタ, スキントーン修飾子, タグ文字, ゼロ幅スペース, ゼロ幅非接合子, ゼロ幅接合子, 単語結合子
		 * - 1幅 ... ASCII文字, 半角カタカナ
		 * - 2幅 ... 上記以外
		 * @param {string} text - カウントしたいテキスト
		 * @returns {number} 文字の横幅
		 */
		static getWidth(text) {
			return Japanese.getWidth(text);
		}

		/**
		 * 指定したテキストを切り出す
		 * - 0幅 ... 結合文字, 異体字セレクタ, スキントーン修飾子, タグ文字, ゼロ幅スペース, ゼロ幅非接合子, ゼロ幅接合子, 単語結合子
		 * - 1幅 ... ASCII文字, 半角カタカナ
		 * - 2幅 ... 上記以外
		 * @param {string} text - 切り出したいテキスト
		 * @param {number} offset - 切り出し位置
		 * @param {number} size - 切り出す長さ
		 * @returns {string} 切り出したテキスト
		 */
		static cutTextForWidth(text, offset, size) {
			return Japanese.cutTextForWidth(text, offset, size);
		}

		// ---------------------------------
		// 面区点コードの変換用
		// ---------------------------------

		/**
		 * 指定した文字から Windows-31J 上の区点番号に変換
		 * - 2文字以上を指定した場合は、1文字目のみを変換する
		 * @param {string} text - 変換したいテキスト
		 * @returns {MenKuTen} 区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
		 */
		static toKuTen(text) {
			return CP932.toKuTen(text);
		}

		/**
		 * Windows-31J 上の区点番号から文字列に変換
		 * @param {MenKuTen|string} kuten - 区点番号
		 * @returns {string} 変換後のテキスト
		 */
		static fromKuTen(kuten) {
			return CP932.fromKuTen(kuten);
		}

		/**
		 * 指定した文字から Shift_JIS-2004 上の面区点番号に変換
		 * - 2文字以上を指定した場合は、1文字目のみを変換する
		 * @param {string} text - 変換したいテキスト
		 * @returns {MenKuTen} 面区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
		 */
		static toMenKuTen(text) {
			return SJIS2004.toMenKuTen(text);
		}

		/**
		 * Shift_JIS-2004 上の面区点番号から文字列に変換
		 * @param {MenKuTen|string} menkuten - 面区点番号
		 * @returns {string} 変換後のテキスト
		 */
		static fromMenKuTen(menkuten) {
			return SJIS2004.fromMenKuTen(menkuten);
		}

		// ---------------------------------
		// 日本語の変換用の関数群
		// ---------------------------------

		/**
		 * カタカナをひらがなに変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHiragana(text) {
			return Japanese.toHiragana(text);
		}

		/**
		 * ひらがなをカタカナに変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toKatakana(text) {
			return Japanese.toKatakana(text);
		}

		/**
		 * スペースを半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthSpace(text) {
			return Japanese.toHalfWidthSpace(text);
		}

		/**
		 * スペースを全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthSpace(text) {
			return Japanese.toFullWidthSpace(text);
		}

		/**
		 * 英数記号を半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthAsciiCode(text) {
			return Japanese.toHalfWidthAsciiCode(text);
		}

		/**
		 * 英数記号を全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthAsciiCode(text) {
			return Japanese.toFullWidthAsciiCode(text);
		}

		/**
		 * アルファベットを半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthAlphabet(text) {
			return Japanese.toHalfWidthAlphabet(text);
		}

		/**
		 * アルファベットを全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthAlphabet(text) {
			return Japanese.toFullWidthAlphabet(text);
		}

		/**
		 * 数値を半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthNumber(text) {
			return Japanese.toHalfWidthNumber(text);
		}

		/**
		 * 数値を全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthNumber(text) {
			return Japanese.toFullWidthNumber(text);
		}

		/**
		 * カタカナを半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidthKana(text) {
			return Japanese.toHalfWidthKana(text);
		}

		/**
		 * カタカナを全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidthKana(text) {
			return Japanese.toFullWidthKana(text);
		}

		/**
		 * 半角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHalfWidth(text) {
			return Japanese.toHalfWidth(text);
		}

		/**
		 * 全角に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toFullWidth(text) {
			return Japanese.toFullWidth(text);
		}

		/**
		 * ローマ字からひらがなに変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toHiraganaFromRomaji(text) {
			return Japanese.toHiraganaFromRomaji(text);
		}

		/**
		 * ローマ字からカタカナに変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toKatakanaFromRomaji(text) {
			return Japanese.toKatakanaFromRomaji(text);
		}

		/**
		 * ひらがなからローマ字に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toRomajiFromHiragana(text) {
			return Japanese.toRomajiFromHiragana(text);
		}

		/**
		 * カタカナからローマ字に変換
		 * @param {string} text - 変換したいテキスト
		 * @returns {string} 変換後のテキスト
		 */
		static toRomajiFromKatakana(text) {
			return Japanese.toRomajiFromKatakana(text);
		}

		// ---------------------------------
		// 1つの文字データに対して調査を行う
		// ---------------------------------

		/**
		 * 指定した1つのUTF-32 コードポイントに関して、解析を行い情報を返します
		 * @param {number} unicode_codepoint - UTF-32 のコードポイント
		 * @returns {MojiData} 文字の情報がつまったオブジェクト
		 */
		static getMojiData(unicode_codepoint) {
			return MojiAnalyzer.getMojiData(unicode_codepoint);
		}

		// ---------------------------------
		// 比較関数
		// ---------------------------------

		/**
		 * 2つの文字列を比較する関数
		 * - sortの引数で利用できます
		 *
		 * @param {any} a - 比較元
		 * @param {any} b - 比較先
		 * @returns {number} Compare結果
		 */
		static compareToForDefault(a, b) {
			return stringComparator.DEFAULT(a, b);
		}

		/**
		 * 2つの文字列を自然順ソートで比較する関数
		 * - sortの引数で利用できます
		 * - 入力引数は文字列化して比較します
		 *
		 * @param {any} a - 比較元
		 * @param {any} b - 比較先
		 * @returns {number} Compare結果
		 */
		static compareToForNatural(a, b) {
			return stringComparator.NATURAL(a, b);
		}
	}

	return Mojix;

}));
