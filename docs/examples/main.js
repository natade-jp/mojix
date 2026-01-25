// @ts-check
"use strict";

/** @typedef {typeof import('../../dist/types/mojix').default} MojixClass */
/** @type {MojixClass} */
const Mojix = /** @type {any} */ (globalThis).Mojix;

const testJapanese = function() {

	let x;
	console.log("");
	console.log("◆◆変換のサンプル");

	console.log("◆半角、全角で変換します。");
	x = "１２３456　ＡＢＣdef ";
	console.log(x);
	console.log(Mojix.toFullWidthAsciiCode(x));
	console.log(Mojix.toHalfWidthAsciiCode(x));
	console.log(Mojix.toFullWidthAlphabet(x));
	console.log(Mojix.toHalfWidthAlphabet(x));
	console.log(Mojix.toFullWidthNumber(x));
	console.log(Mojix.toHalfWidthNumber(x));

	console.log("◆ひらがなとカタカナ、半角カタカナ、全角カタカナで変換します。");
	x = "あおカコｶﾞｺﾞﾊﾞﾎﾞﾊﾟﾎﾟバビブベボ";
	console.log(x);
	console.log(Mojix.toKatakana(x));
	console.log(Mojix.toHiragana(x));
	console.log(Mojix.toFullWidthKana(x));
	console.log(Mojix.toHalfWidthKana(x));

	console.log("◆半角と全角で変換します。");
	x = "0123abcABCｱｲｳ!!０１２３ａｂｃＡＢＣあいうアイウ！！";
	console.log(x);
	console.log(Mojix.toFullWidth(x));
	console.log(Mojix.toHalfWidth(x));

	console.log("◆ローマ字からひらがなに変換します。");
	x = "aiueo!konnnichiwa-!waha-!jaja-n!";
	console.log(x);
	console.log(Mojix.toHiraganaFromRomaji(x));
	console.log(Mojix.toKatakanaFromRomaji(x));

	x = "kyapi-nn!shi!chi!tsu!tha!xtsu!ltu!xxa!";
	console.log(x);
	console.log(Mojix.toHiraganaFromRomaji(x));
	console.log(Mojix.toKatakanaFromRomaji(x));
};

const testUnicode = function() {

	console.log("");
	console.log("◆◆Unicode対応のサンプル");

	const x = Mojix.fromCodePoint(134071, 37326, 23478 );
	console.log("サロゲートペア対応 " + x);

	console.log("「" + x + "」");
	console.log("lengthは " + x.length);
	console.log("文字数は " + Mojix.codePointCount(x));

	console.log("◆UTF8の配列");
	const utf8array = Mojix.toUTF8Array(x);
	console.log(JSON.stringify(utf8array));
	console.log(Mojix.fromUTF8Array(utf8array));

	console.log("◆UTF16の配列");
	const utf16array = Mojix.toUTF16Array(x);
	console.log(JSON.stringify(utf16array));
	console.log(Mojix.fromUTF16Array(utf16array));

	console.log("◆UTF32の配列");
	const utf32array = Mojix.toUTF32Array(x);
	console.log(JSON.stringify(utf32array));
	console.log(Mojix.fromUTF32Array(utf32array));

	const text = "1圡土2圡土3圡土";
	console.log("◆サロゲートペアを一部含んだ文字列をカットします。");
	console.log(Mojix.cutTextForCodePoint(text, 3, 3));

};

const testCP932 = function() {

	console.log("");
	console.log("◆◆日本語文字コード対応のサンプル");

	const x = "ABCあいう高髙①";

	console.log("「" + x + "」");
	console.log("lengthは " + x.length);
	console.log("文字の横幅は " + Mojix.getWidth(x));

	console.log("◆Windows-31J の符号化コードで1バイトごと表示します。");
	const cp932arraybin = Mojix.encode(x, "Windows-31J");
	console.log(JSON.stringify(cp932arraybin));
	console.log(Mojix.decode(cp932arraybin));
	
	console.log("◆文字の横幅換算で文字列をカットします。");
	
	console.log("\"" + Mojix.cutTextForWidth(x, 0, 5) + "\"");
	console.log("\"" + Mojix.cutTextForWidth(x, 1, 5) + "\"");
	console.log("\"" + Mojix.cutTextForWidth(x, 2, 5) + "\"");
	console.log("\"" + Mojix.cutTextForWidth(x, 3, 5) + "\"");
	console.log("\"" + Mojix.cutTextForWidth(x, 4, 5) + "\"");
	console.log("\"" + Mojix.cutTextForWidth(x, 5, 5) + "\"");
	console.log("\"" + Mojix.cutTextForWidth(x, 6, 5) + "\"");
};

const testCharacterAnalyser = function() {

	console.log("");
	console.log("◆◆文字解析のサンプル");

	/**
	 * @param {string} moji 
	 * @returns 
	 */
	const analysis = function(moji) {
		return Mojix.getMojiData(Mojix.codePointAt(moji));
	};

	console.log("◆漢字のチェック1");
	console.log("高は常用漢字か？" + analysis("高").type.is_joyo_kanji );
	console.log("髙は常用漢字か？" + analysis("髙").type.is_joyo_kanji );
	console.log("渾は人名用漢字か？" + analysis("渾").type.is_jinmeiyo_kanji );

	console.log("◆区点番号のチェック");

	/**
	 * @param {string} text 
	 * @returns 
	 */
	const kuten = function(text) {
		const kuten = analysis(text).encode.kuten;
		if(!kuten) {
			console.log(`「${text}」の変換に失敗しました`);
			return;
		}
		console.log(`「${text}」の区点番号は ${kuten.text}`);
	};
	kuten("A");
	kuten("あ");
	kuten("鉱");
	kuten("砿");
	kuten("鋼");
	kuten("閤");
	kuten("降");
	kuten("項");
	kuten("①");
	kuten("㈱");
	kuten("髙");
	console.log("");

	console.log("◆漢字のチェック2");
	console.log("高はIBM拡張漢字か？" + analysis("高").type.is_IBM_extended_character);
	console.log("髙はIBM拡張漢字か？" + analysis("髙").type.is_IBM_extended_character);
	console.log("①はNEC特殊文字か？" + analysis("①").type.is_NEC_selection_IBM_extended_character);

	console.log("◆面区点番号のチェック");

	/**
	 * @param {string} text 
	 * @returns 
	 */
	const menkuten = function(text) {
		const menkuten = analysis(text).encode.menkuten;
		const suijun = analysis(text).type.kanji_suijun;
		if(!menkuten) {
			console.log(`「${text}」の変換に失敗しました`);
			return;
		}
		if(suijun) {
			console.log(`「${text}」の面区点番号は ${menkuten.text} で、第%d水準漢字 $suijun} `);
		}
		else {
			console.log(`「${text}」の面区点番号は ${menkuten.text}`);
		}
	};
	menkuten("A");
	menkuten("あ");
	menkuten("鉱");
	menkuten("砿");
	menkuten("鋼");
	menkuten("閤");
	menkuten("降");
	menkuten("項");
	menkuten("①");
	menkuten("㈱");
	menkuten("髙");
	menkuten("圡");
	menkuten("唁");
	menkuten("㖨");
	menkuten("埦");
	menkuten("宖");
	menkuten("殁");
	menkuten("殛");
	menkuten("蜅");
	menkuten("𪚲");

	console.log("");
};

const testStringComparator = function() {
	const a = ["3", "2", "10", "4", "2-4", "0-1", "テスト", "てすと２", "てスと01"];
	console.log("");
	console.log("◆◆文字列比較のサンプル");

	console.log("標準ソート");
	a.sort();
	console.log(a.join(", "));
	console.log("通常文字列ソート");
	a.sort(Mojix.compareToForDefault);
	console.log(a.join(", "));
	console.log("自然順ソート (Natural Sort)");
	a.sort(Mojix.compareToForNatural);
	console.log(a.join(", "));

};

const main = function() {
	
	console.log("Mojix クラスのサンプル");

	testJapanese();
	testUnicode();
	testCP932();
	testCharacterAnalyser();
	testStringComparator();

};

main();
