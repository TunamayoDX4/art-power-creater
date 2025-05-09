/// Card型UIに関する構造体・処理を定義するモジュール
///

/// Card型UIのコレクション
export class CardCollection {
  collection: CardElement[];
  container: HTMLElement;

  /// # コンストラクタ
  /// - `container` : カードを並べる親要素（例: #collection-cards）
  /// - `targets`   : カード本体となるHTMLElement配列
  constructor(container: HTMLElement, targets: HTMLElement[]) {
    this.container = container;
    this.collection = targets.map((target) => new CardElement(target));
    this.enableDragAndDrop();
  }

  /// カードのドラッグ＆ドロップによる並び替えを有効化する
  enableDragAndDrop() {
    let draggingElem: HTMLElement | null = null;
    let placeholder: HTMLElement | null = null;
    let offsetX = 0;
    let offsetY = 0;

    const container = this.container;;

    container.addEventListener("mousedown", (e) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("card-ui-movetab")) return;

      draggingElem = target.closest(".cardstyle-ui-wrap") as HTMLElement;
      if (!draggingElem) return;

      // プレースホルダーを作成
      placeholder = document.createElement("div");
      placeholder.className = "cardstyle-ui-wrap placeholder";
      placeholder.style.height = `${draggingElem.offsetHeight}px`;
      placeholder.style.width = `${draggingElem.offsetWidth}px`;
      draggingElem.parentNode?.insertBefore(placeholder, draggingElem.nextSibling);

      // ドラッグ中の見た目調整
      const rect = draggingElem.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      draggingElem.style.position = "absolute";
      draggingElem.style.zIndex = "1000";
      draggingElem.style.width = `${rect.width}px`;
      draggingElem.style.height = `${rect.height}px`;
      draggingElem.style.pointerEvents = "none";
      draggingElem.style.opacity = "0.7";
      document.body.appendChild(draggingElem);

      moveAt(e.pageX, e.pageY);

      function moveAt(pageX: number, pageY: number) {
        draggingElem!.style.left = pageX - offsetX + "px";
        draggingElem!.style.top = pageY - offsetY + "px";
      }

      function onMouseMove(event: MouseEvent) {
        moveAt(event.pageX, event.pageY);
      
        // すべてのカードを取得
        const elems = Array.from(
          container.querySelectorAll(".cardstyle-ui-wrap:not(.placeholder)")
        ) as HTMLElement[];
      
        // 行ごとにグループ化
        let rows: HTMLElement[][] = [];
        let currentRow: HTMLElement[] = [];
        let lastTop: number | null = null;
        const rowThreshold = 10; // 行判定のための閾値(px)
      
        for (const elem of elems) {
          const rect = elem.getBoundingClientRect();
          if (lastTop === null || Math.abs(rect.top - lastTop) < rowThreshold) {
            currentRow.push(elem);
            lastTop = rect.top;
          } else {
            rows.push(currentRow);
            currentRow = [elem];
            lastTop = rect.top;
          }
        }
        if (currentRow.length > 0) rows.push(currentRow);
      
        let inserted = false;
      
        // どの行か判定
        for (const row of rows) {
          const rect = row[0].getBoundingClientRect();
          const rowBottom = rect.top + rect.height;
          if (event.clientY < rowBottom) {
            // この行の中でどこに入れるか判定
            for (const elem of row) {
              const r = elem.getBoundingClientRect();
              if (event.clientX < r.left) {
                container.insertBefore(placeholder!, elem);
                inserted = true;
                break;
              }
            }
            if (!inserted) {
              // 行の最後に挿入
              container.insertBefore(placeholder!, row[row.length - 1].nextSibling);
              inserted = true;
            }
            break;
          }
        }
        // どの行にも該当しなければ末尾
        if (!inserted) {
          container.appendChild(placeholder!);
        }
      }

      document.addEventListener("mousemove", onMouseMove);

      document.addEventListener("mouseup", function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        // 元のスタイルを戻す
        draggingElem!.style.position = "";
        draggingElem!.style.zIndex = "";
        draggingElem!.style.left = "";
        draggingElem!.style.top = "";
        draggingElem!.style.width = "";
        draggingElem!.style.pointerEvents = "";
        draggingElem!.style.opacity = "";

        // プレースホルダーの位置に挿入
        if (placeholder && placeholder.parentNode) {
          placeholder.parentNode.insertBefore(draggingElem!, placeholder);
          placeholder.remove();
        }
        draggingElem = null;
        placeholder = null;
      });
      e.preventDefault();
    });
  }
}

/// Card型UIの構造体
export class CardElement {
  /// カードの要素本体
  target: HTMLElement;

  /// ヘッダー要素
  header: HTMLElement | null = null;
  /// ヘッダー内の移動タブ
  moveTab: HTMLElement | null = null;
  /// メインコンテンツ要素
  main: HTMLElement | null = null;
  /// フッター要素
  footer: HTMLElement | null = null;
  /// リサイズタブ
  resizeTab: HTMLElement | null = null;

  /// # コンストラクタ
  /// - `target` : カード本体となるHTMLElement（cardstyle-uiクラス必須）
  constructor(target: HTMLElement) {
    // cardstyle-uiクラスを持つかチェック
    target = target.classList.contains("cardstyle-ui") ?
      target : (() => {
        throw new Error("Target element is not a card-ui element.");
      })();
    // 各部位の要素を取得
    const header = target.getElementsByTagName("header")[0] as HTMLElement | null;
    let moveTab: HTMLElement | null = null;
    if (header) {
      moveTab = header.getElementsByClassName("card-ui-movetab")[0] as HTMLElement | null;
    }
    const resizeTab = target.getElementsByClassName("card-ui-resizetab")[0] as HTMLElement | null;

    this.target = target;
    this.header = header;
    this.moveTab = moveTab;
    this.main = target.getElementsByTagName("main")[0] as HTMLElement | null;
    this.footer = target.getElementsByTagName("footer")[0] as HTMLElement | null;
    this.resizeTab = resizeTab;
  }

  
}

