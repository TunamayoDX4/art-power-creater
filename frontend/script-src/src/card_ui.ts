/// Card型UIに関する構造体・処理を定義するモジュール
///

/// Card型UIの構造体
export class CardElement {
  /// カードの要素を定義
  target: HTMLElement;

  header: HTMLElement | null = null;
  main: HTMLElement | null = null;
  footer: HTMLElement | null = null;

  constructor(target: HTMLElement) {
    // targetがcard-ui属性を持つ要素であることを確認
    // そうでない場合はエラーを投げる
    target = target.classList.contains("card-ui") ?
      target : (() => {
        throw new Error("Target element is not a card-ui element.");
      })();
    
    this.target = target;
    this.header = target.getElementsByTagName("header")[0] as HTMLElement | null;
    this.main = target.getElementsByTagName("main")[0] as HTMLElement | null;
    this.footer = target.getElementsByTagName("footer")[0] as HTMLElement | null;
  }
}