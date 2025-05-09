import { CardElement } from "./card_ui.js";

/// モーダルウィンドウの要素を定義
/// モーダルウィンドウは、Card型UIの一部として実装されている。
export class ModalCardElement {
  /// モーダル内のCardElement
  card: CardElement;
  /// モーダル全体のラッパー
  modalHandler: HTMLElement | null = null;
  /// 閉じるボタン
  closeButton: HTMLElement | null = null;

  outsideClickClose: boolean = true; // モーダル外クリックで閉じるかどうか

  modalPosSetted: boolean = false; // モーダルの位置が設定済みかどうか

  /// # コンストラクタ
  /// - `modalHandler` : モーダル全体のラッパー要素
  constructor(modalHandler: HTMLElement) {
    // cardstyle-ui-wrap > cardstyle-uiを取得
    const targetCardObj = modalHandler.getElementsByClassName("cardstyle-ui-wrap")[0]
      .getElementsByClassName("cardstyle-ui")[0] as HTMLElement ?? null;
    const card = new CardElement(targetCardObj) as CardElement | null;
    if (!card) {
      throw new Error("Target element is not a card-ui element.");
    }
    // 閉じるボタン取得
    const closeButton = card.header?.getElementsByClassName("modal-close")[0] as HTMLElement ?? null;

    this.card = card;
    this.modalHandler = modalHandler;
    this.closeButton = closeButton;
    this.initialize();
  }

  /// 初期化処理（イベントリスナ登録）
  initialize() {
    this.setOpenEventListener();
    this.setCloseEventListener();
    this.regMoveTabEventListener();
    this.regResizeTabEventListener();
    this.card.target.parentElement!.style.display = "none"; // 初期状態は非表示
  }

  /// モーダルを閉じる
  closeModal(): void {
    if (this.card.target.parentElement && this.card.target.parentElement?.style.display != "none") {
      console.log(this.modalHandler);
      if (this.modalHandler) {
        this.modalHandler.style.width = "0px";
        this.modalHandler.style.height = "0px";
      }
      this.card.target.parentElement.style.display = "none";
    }
  }

  /// モーダル外クリック・閉じるボタンのイベント登録
  setCloseEventListener(): void {
    this.modalHandler?.addEventListener("click", (event) => {
      // フラグを見て外側クリック時の挙動を切り替え
      if (this.outsideClickClose && event.target == this.modalHandler) {
        this.closeModal();
      }
    });
    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => {
        this.closeModal();
      });
    }
  }

  /// モーダルを開く
  openModal(): void {
    const modalBody = this.card.target.parentElement ?? null;
    console.log(modalBody);
    if (modalBody) {
      // modal-outside-click-closeの値を取得
      const outsideElem = modalBody.querySelector(".modal-outside-click-close");
      if (outsideElem && outsideElem.textContent?.trim().toLowerCase() === "false") {
        this.outsideClickClose = false;
      } else {
        this.outsideClickClose = true;
      }

      // モーダルを開く処理
      modalBody.style.display = "block";
      // サイズ指定要素があれば反映
      if (!this.modalPosSetted) {
        this.resetPosSize(modalBody);
      }

      if (this.modalHandler && this.outsideClickClose) {
        this.modalHandler.style.width = "100%";
        this.modalHandler.style.height = "100%";
      }
    }
  }

  resetPosSize(modalBody: HTMLElement): void {
    // サイズ指定要素があれば反映
    const sizeElem = modalBody.querySelector(".modal-size-init");
    if (sizeElem) {
      // 例: "64em, 64em"
      const sizeText = sizeElem.textContent?.trim() ?? "";
      const [w, h] = sizeText.split(",").map(s => s.trim());
      if (w && h) {
        modalBody.style.width = w;
        modalBody.style.height = h;
      }
    }
    // モーダルの中央寄せ
    modalBody.style.top = "50%";
    modalBody.style.left = "50%";
    modalBody.style.transform = "translate(-50%, -50%)";
    modalBody.style.zIndex = "1000";

    this.modalPosSetted = true; // モーダルの位置が設定済み
  }

  /// モーダル起動ボタンのイベント登録
  setOpenEventListener(): void {
    const modalWaker = this.modalHandler?.getElementsByClassName("modal-waker")[0] as HTMLElement | null;
    modalWaker?.addEventListener("click", (event) => {
      if (event.target == modalWaker) this.openModal();
    });
  }

  /// 移動タブのドラッグイベントを登録
  regMoveTabEventListener(): void {
    if (this.card.moveTab) {
      this.card.moveTab.addEventListener("mousedown", (event) => {
        event.preventDefault();
        const card = this.card.target.parentElement!;
        if (!card) return;

        // 解除前の位置を取得
        const rect = card.getBoundingClientRect();

        // transform解除
        card.style.transform = "";

        // 解除後、今の見た目の位置を維持
        card.style.left = `${rect.left + window.scrollX}px`;
        card.style.top = `${rect.top + window.scrollY}px`;
          
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        // マウス移動時の処理
        function mouseMoveHandler(event: MouseEvent): void {
          card.style.left = `${event.clientX - offsetX}px`;
          card.style.top = `${event.clientY - offsetY}px`;
          const clientW = window.innerWidth;
          const clientH = window.innerHeight;

          const rect = card.getBoundingClientRect();
          // 画面の端にカードがはみ出す場合、位置を調整する。
          if (rect.left < 0) {
            card.style.left = "0px";
          } else if (rect.right > clientW) {
            card.style.left = `${clientW - rect.width}px`;
          }
          if (rect.top < 0) {
            card.style.top = "0px";
          } else if (rect.bottom > clientH) {
            card.style.top = `${clientH - rect.height}px`;
          }

          console.log(card.style.right, clientW, clientH);
        }

        // ドラッグ終了時の処理
        function mouseUpHandler(): void {
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
        }

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      });
    }
  }

  regResizeTabEventListener(): void {
    if (this.card.resizeTab) {
      this.card.resizeTab.addEventListener("mousedown", (event) => {
        event.preventDefault();
        const modalBody = this.card.target.parentElement as HTMLElement;
        if (!modalBody) return;

        // 解除前の位置を取得
        const rect = modalBody.getBoundingClientRect();

        // transform解除
        modalBody.style.transform = "";

        // 解除後、今の見た目の位置を維持
        modalBody.style.left = `${rect.left + window.scrollX}px`;
        modalBody.style.top = `${rect.top + window.scrollY}px`;
  
        // --- 最小・最大サイズを取得 ---
        const minElem = modalBody.querySelector(".modal-size-min");
        const maxElem = modalBody.querySelector(".modal-size-max");
        let minWidth = 200, minHeight = 100, maxWidth = window.innerWidth, maxHeight = window.innerHeight;
  
        function toPx(val: string, base: HTMLElement): number[] {
          const temp = document.createElement("div");
          temp.style.position = "absolute";
          temp.style.visibility = "hidden";
          temp.style.width = val.split(",")[0].trim();
          temp.style.height = val.split(",")[1]?.trim() ?? val.split(",")[0].trim();
          base.appendChild(temp);
          const w = temp.offsetWidth;
          const h = temp.offsetHeight;
          base.removeChild(temp);
          return [w, h];
        }
  
        if (minElem && minElem.textContent) {
          const [w, h] = toPx(minElem.textContent, document.body);
          minWidth = w;
          minHeight = h;
        }
        if (maxElem && maxElem.textContent) {
          const [w, h] = toPx(maxElem.textContent, document.body);
          maxWidth = w;
          maxHeight = h;
        }
  
        // ドラッグ開始時のマウス座標とモーダルサイズを記録
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = modalBody.offsetWidth;
        const startHeight = modalBody.offsetHeight;
  
        // 右下基準でリサイズ
        function mouseMoveHandler(e: MouseEvent) {
          // モーダルの左上座標
          const left = modalBody.offsetLeft;
          const top = modalBody.offsetTop;
          // 画面右端・下端までの最大サイズ
          const screenMaxWidth = window.innerWidth - left;
          const screenMaxHeight = window.innerHeight - top;
          // ユーザ指定のmaxと比較して小さい方を使う
          const limitWidth = Math.min(maxWidth, screenMaxWidth);
          const limitHeight = Math.min(maxHeight, screenMaxHeight);
        
          let newWidth = startWidth + (e.clientX - startX);
          let newHeight = startHeight + (e.clientY - startY);
          newWidth = Math.max(minWidth, Math.min(limitWidth, newWidth));
          newHeight = Math.max(minHeight, Math.min(limitHeight, newHeight));
          modalBody.style.width = `${newWidth}px`;
          modalBody.style.height = `${newHeight}px`;
        }
  
        function mouseUpHandler() {
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
        }
  
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      });
    }
  }
}