export { Mojix as default };
/**
 * 面区点情報
 */
export type MenKuTen = {
    /**
     * 面-区-点
     */
    text?: string;
    /**
     * 面
     */
    men?: number;
    /**
     * 区
     */
    ku: number;
    /**
     * 点
     */
    ten: number;
};
/**
 * 文字のエンコード情報
 */
export type MojiEncodeData = {
    /**
     * 区点 コード
     */
    kuten: any;
    /**
     * 面区点 コード
     */
    menkuten: any;
    /**
     * CP932(Windows-31J) コード
     */
    cp932_code: number;
    /**
     * Shift_JIS-2004 コード
     */
    sjis2004_code: number;
    /**
     * UTF-8 配列
     */
    utf8_array: number[];
    /**
     * UTF-16 配列
     */
    utf16_array: number[];
    /**
     * UTF-32 配列
     */
    utf32_array: number[];
    /**
     * CP932(Windows-31J) バイト配列
     */
    cp932_array: number[];
    /**
     * Shift_JIS-2004 コード バイト配列
     */
    sjis2004_array: number[];
    /**
     * Shift_JIS バイト配列
     */
    shift_jis_array: number[];
    /**
     * ISO-2022-JP バイト配列
     */
    iso2022jp_array: number[];
    /**
     * eucJP-ms バイト配列
     */
    eucjpms_array: number[];
    /**
     * EUC-JP-2004 バイト配列
     *
     * 文字の種別情報
     */
    eucjis2004_array: number[];
};
/**
 * 文字のエンコード情報
 */
export type MojiTypeData = {
    /**
     * Shift_JIS に登録された文字
     */
    is_regular_sjis: boolean;
    /**
     * Shift_JIS-2004 に登録された文字
     */
    is_regular_sjis2004: boolean;
    /**
     * 常用漢字
     */
    is_joyo_kanji: boolean;
    /**
     * 人名用漢字
     */
    is_jinmeiyo_kanji: boolean;
    /**
     * Windows-31J(CP932) 外字
     */
    is_gaiji_cp932: boolean;
    /**
     * Windows-31J(CP932) IBM拡張文字
     */
    is_IBM_extended_character: boolean;
    /**
     * Windows-31J(CP932) NEC選定IBM拡張文字
     */
    is_NEC_selection_IBM_extended_character: boolean;
    /**
     * Windows-31J(CP932) NEC特殊文字
     */
    is_NEC_special_character: boolean;
    /**
     * Shift_JIS-2004 を使用して漢字の水準調査(1未満だと水準調査失敗)
     */
    kanji_suijun: number;
    /**
     * 要 Unicode サロゲートペア
     */
    is_surrogate_pair: boolean;
    /**
     * 制御文字名（制御文字ではない場合は null）
     */
    control_name: string;
    /**
     * 制御文字
     */
    is_control_charcter: boolean;
    /**
     * Unicodeブロック名
     */
    blockname: string;
    /**
     * 漢字
     */
    is_kanji: boolean;
    /**
     * ひらがな
     */
    is_hiragana: boolean;
    /**
     * カタカナ
     */
    is_katakana: boolean;
    /**
     * 全角ASCII
     */
    is_fullwidth_ascii: boolean;
    /**
     * 半角カタカナ
     */
    is_halfwidth_katakana: boolean;
    /**
     * 絵文字
     */
    is_emoji: boolean;
    /**
     * 顔文字
     */
    is_emoticons: boolean;
    /**
     * 記号(VS16 が付くと絵文字化)
     */
    is_symbol_base: boolean;
    /**
     * 外字
     */
    is_gaiji: boolean;
    /**
     * グラフェムを構成するための文字
     */
    is_grapheme_component: boolean;
    /**
     * ゼロ幅文字
     */
    is_zero_width_character: boolean;
    /**
     * 結合文字
     */
    is_combining_mark: boolean;
    /**
     * 異体字セレクタ
     */
    is_variation_selector: boolean;
    /**
     * スキントーン修飾子
     */
    is_skin_tone_modifier: boolean;
    /**
     * タグ文字
     *
     * 文字の種別情報
     */
    is_tag_character: boolean;
};
/**
 * 文字のエンコード情報
 */
export type MojiData = {
    /**
     * 文字のエンコード情報
     */
    encode: MojiEncodeData;
    /**
     * 文字の種別情報
     */
    type: MojiTypeData;
    /**
     * 解析した文字
     */
    character: string;
    /**
     * 解析した文字のコードポイント
     */
    codepoint: number;
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
 * 日本語を扱うための様々な機能を提供します
 */
declare class Mojix {
    /**
     * 文字列からバイナリ配列にエンコードする
     * @param {string} text - 変換したいテキスト
     * @param {string} charset - キャラセット(UTF-8/16/32,Shift_JIS,Windows-31J,Shift_JIS-2004,EUC-JP,EUC-JP-2004)
     * @param {boolean} [is_with_bom=false] - BOMをつけるかどうか
     * @returns {number[]} バイナリ配列(失敗時はnull)
     */
    static encode(text: string, charset: string, is_with_bom?: boolean): number[];
    /**
     * バイナリ配列から文字列にデコードする
     * @param {number[]} binary - 変換したいバイナリ配列
     * @param {string} [charset="autodetect"] - キャラセット(UTF-8/16/32,Shift_JIS,Windows-31J,Shift_JIS-2004,EUC-JP,EUC-JP-2004)
     * @returns {string} 変換した文字列（失敗したらnull）
     */
    static decode(binary: number[], charset?: string): string;
    /**
     * サロゲートペア対応のコードポイント取得
     * @param {string} text - 対象テキスト
     * @param {number} [index = 0] - インデックス
     * @returns {number} コードポイント
     */
    static codePointAt(text: string, index?: number): number;
    /**
     * コードポイントの数値データを文字列に変換
     * @param {...(number|number[])} codepoint - 変換したいコードポイントの数値配列、又は数値を並べた可変引数
     * @returns {string} 変換後のテキスト
     */
    static fromCodePoint(...args: (number | number[])[]): string;
    /**
     * コードポイント換算で文字列数をカウント
     * @param {string} text - 対象テキスト
     * @param {number} [beginIndex=0] - 最初のインデックス（省略可）
     * @param {number} [endIndex] - 最後のインデックス（ここは含めない）（省略可）
     * @returns {number} 文字数
     */
    static codePointCount(text: string, beginIndex?: number, endIndex?: number): number;
    /**
     * 文字列をUTF32(コードポイント)の配列に変換
     * @param {string} text - 変換したいテキスト
     * @returns {number[]} UTF32(コードポイント)のデータが入った配列
     */
    static toUTF32Array(text: string): number[];
    /**
     * UTF32の配列から文字列に変換
     * @param {number[]} utf32 - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static fromUTF32Array(utf32: number[]): string;
    /**
     * 文字列をUTF16の配列に変換
     * @param {string} text - 変換したいテキスト
     * @returns {number[]} UTF16のデータが入った配列
     */
    static toUTF16Array(text: string): number[];
    /**
     * UTF16の配列から文字列に変換
     * @param {number[]} utf16 - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static fromUTF16Array(utf16: number[]): string;
    /**
     * 文字列をUTF8の配列に変換
     * @param {string} text - 変換したいテキスト
     * @returns {number[]} UTF8のデータが入った配列
     */
    static toUTF8Array(text: string): number[];
    /**
     * UTF8の配列から文字列に変換
     * @param {number[]} utf8 - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static fromUTF8Array(utf8: number[]): string;
    /**
     * 結合した文字を考慮して文字列を文字の配列に変換する
     * @param {string} text - 変換したいテキスト
     * @returns {Array<number[]>} UTF32(コードポイント)の配列が入った配列
     */
    static toMojiArrayFromString(text: string): Array<number[]>;
    /**
     * 結合した文字を考慮して文字の配列を文字列に変換する
     * @param {Array<number[]>} mojiarray - UTF32(コードポイント)の配列が入った配列
     * @returns {string} UTF32(コードポイント)の配列が入った配列
     */
    static toStringFromMojiArray(mojiarray: Array<number[]>): string;
    /**
     * 指定したテキストを切り出す
     * - 単位はコードポイントの文字数
     * - 結合文字, 異体字セレクタ, スキントーン修飾子, タグ文字を考慮しません
     * @param {string} text - 切り出したいテキスト
     * @param {number} offset - 切り出し位置
     * @param {number} size - 切り出す長さ
     * @returns {string} 切り出したテキスト
     */
    static cutTextForCodePoint(text: string, offset: number, size: number): string;
    /**
     * 指定したテキストの横幅を半角／全角でカウント
     * - 0幅 ... 結合文字, 異体字セレクタ, スキントーン修飾子, タグ文字, ゼロ幅スペース, ゼロ幅非接合子, ゼロ幅接合子, 単語結合子
     * - 1幅 ... ASCII文字, 半角カタカナ
     * - 2幅 ... 上記以外
     * @param {string} text - カウントしたいテキスト
     * @returns {number} 文字の横幅
     */
    static getWidth(text: string): number;
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
    static cutTextForWidth(text: string, offset: number, size: number): string;
    /**
     * 指定した文字から Windows-31J 上の区点番号に変換
     * - 2文字以上を指定した場合は、1文字目のみを変換する
     * @param {string} text - 変換したいテキスト
     * @returns {import("./encode/SJIS.js").MenKuTen} 区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
     */
    static toKuTen(text: string): any;
    /**
     * Windows-31J 上の区点番号から文字列に変換
     * @param {import("./encode/SJIS.js").MenKuTen|string} kuten - 区点番号
     * @returns {string} 変換後のテキスト
     */
    static fromKuTen(kuten: any | string): string;
    /**
     * 指定した文字から Shift_JIS-2004 上の面区点番号に変換
     * - 2文字以上を指定した場合は、1文字目のみを変換する
     * @param {string} text - 変換したいテキスト
     * @returns {import("./encode/SJIS.js").MenKuTen} 面区点番号(存在しない場合（1バイトのJISコードなど）はnullを返す)
     */
    static toMenKuTen(text: string): any;
    /**
     * Shift_JIS-2004 上の面区点番号から文字列に変換
     * @param {import("./encode/SJIS.js").MenKuTen|string} menkuten - 面区点番号
     * @returns {string} 変換後のテキスト
     */
    static fromMenKuTen(menkuten: any | string): string;
    /**
     * カタカナをひらがなに変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toHiragana(text: string): string;
    /**
     * ひらがなをカタカナに変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toKatakana(text: string): string;
    /**
     * スペースを半角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toHalfWidthSpace(text: string): string;
    /**
     * スペースを全角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toFullWidthSpace(text: string): string;
    /**
     * 英数記号を半角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toHalfWidthAsciiCode(text: string): string;
    /**
     * 英数記号を全角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toFullWidthAsciiCode(text: string): string;
    /**
     * アルファベットを半角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toHalfWidthAlphabet(text: string): string;
    /**
     * アルファベットを全角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toFullWidthAlphabet(text: string): string;
    /**
     * 数値を半角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toHalfWidthNumber(text: string): string;
    /**
     * 数値を全角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toFullWidthNumber(text: string): string;
    /**
     * カタカナを半角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toHalfWidthKana(text: string): string;
    /**
     * カタカナを全角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toFullWidthKana(text: string): string;
    /**
     * 半角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toHalfWidth(text: string): string;
    /**
     * 全角に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toFullWidth(text: string): string;
    /**
     * ローマ字からひらがなに変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toHiraganaFromRomaji(text: string): string;
    /**
     * ローマ字からカタカナに変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toKatakanaFromRomaji(text: string): string;
    /**
     * ひらがなからローマ字に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toRomajiFromHiragana(text: string): string;
    /**
     * カタカナからローマ字に変換
     * @param {string} text - 変換したいテキスト
     * @returns {string} 変換後のテキスト
     */
    static toRomajiFromKatakana(text: string): string;
    /**
     * 指定した1つのUTF-32 コードポイントに関して、解析を行い情報を返します
     * @param {number} unicode_codepoint - UTF-32 のコードポイント
     * @returns {import("./tools/MojiAnalyzer.js").MojiData} 文字の情報がつまったオブジェクト
     */
    static getMojiData(unicode_codepoint: number): any;
    /**
     * 2つの文字列を比較する関数
     * - sortの引数で利用できます
     *
     * @param {any} a - 比較元
     * @param {any} b - 比較先
     * @returns {number} Compare結果
     */
    static compareToForDefault(a: any, b: any): number;
    /**
     * 2つの文字列を自然順ソートで比較する関数
     * - sortの引数で利用できます
     * - 入力引数は文字列化して比較します
     *
     * @param {any} a - 比較元
     * @param {any} b - 比較先
     * @returns {number} Compare結果
     */
    static compareToForNatural(a: any, b: any): number;
}
