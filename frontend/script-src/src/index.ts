/// ART-Power-CreaterのTypeScriptコード
/// 

import { CardElement, CardCollection } from "./card_ui";
import { ModalCardElement } from "./modal_ui";

let pulldown: HTMLCollectionOf<Element> | null = null;
let card: HTMLCollectionOf<Element> | null = null;
let modalHandler: HTMLCollectionOf<Element> | null = null;
const container = document.getElementById("collection-cards") as HTMLElement | null;
const collectionCards = Array.from(container?.getElementsByClassName("cardstyle-ui-wrap") ?? []).map((element) => {
  return element.getElementsByClassName("cardstyle-ui")[0] as HTMLElement;
})
const cardCollection = new CardCollection(container as HTMLElement, collectionCards as HTMLElement[]);

// 実質上のエントリーポイント
function main(): number {
  pulldown = document.getElementsByClassName("pulldown-ui");
  card = document.getElementsByClassName("card-ui");
  modalHandler = document.getElementsByClassName("modal-handler");
  const modals = Array.from(modalHandler).map((element) => {
    return new ModalCardElement(element as HTMLElement);
  }).filter((element) => {
    return element !== null;
  });
  console.log(modals);

  // クリックイベントリスナーを追加
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const targetParent = target.parentElement;

    // クリックされたプルダウンを開く
    if (pulldown && targetParent?.classList[0] == "pulldown-ui") {
      Array.from(pulldown).forEach((element) => {
        if (element !== targetParent) {
          const pulldownBody = element.getElementsByTagName("ul")[0] ?? null;
          if (pulldownBody) {
            pulldownBody.style.display = "none";
          }
        } else {
          const pulldownBody = element.getElementsByTagName("ul")[0] ?? null;
          if (pulldownBody) {
            if (pulldownBody.style.display === "none") {
              // プルダウンを開く処理
              pulldownBody.style.display = "block";

              // プルダウンの位置を取得する。
              const rect = pulldownBody.getClientRects()[0];
              const clientW = window.innerWidth;
              if (clientW < rect.x + rect.width) {
                // 画面の右端にプルダウンがはみ出す場合、位置を調整する。
                pulldownBody.style.marginLeft = "0px";
                pulldownBody.style.right = "0px";
              }

            } else {
              pulldownBody.style.display = "none";
            }
          }  
        }
      })
    }

    if (pulldown && targetParent?.classList[0] != "pulldown-ui") {
      // プルダウン以外がクリックされた場合、全てのプルダウンを閉じる
      Array.from(pulldown).forEach((element) => {
        const pulldownBody = element.getElementsByTagName("ul")[0] ?? null;
        if (pulldownBody) {
          pulldownBody.style.display = "none";
        }
      })
    }
  })

  document.addEventListener("keydown", (event) => {
    if (modalHandler && event.key === "Escape") {
      // モーダルウィンドウを閉じる処理
      console.log("モーダルウィンドウを閉じる処理が実行されました。");
      // 全てのモーダルウィンドウを閉じる
      Array.from(modals).forEach((modal) => {
        modal.closeModal();
      })
    }
  })

  Array.from(card).forEach((element) => {
    let card = new CardElement(element as HTMLElement);
    card.header!.innerHTML = "<h2>カカカード</h2>"
  })

  document.addEventListener("DOMContentLoaded", () => {
    const editModal = modals[1] as ModalCardElement | null;
    if (!editModal) return;
  
    let currentCardTitle: HTMLElement | null = null;
    let currentCardMain: HTMLElement | null = null;
    const titlearea = document.getElementById("edit-modal-title") as HTMLInputElement;
    const textarea = document.getElementById("edit-modal-textarea") as HTMLTextAreaElement;
    const saveBtn = document.getElementById("edit-modal-save") as HTMLButtonElement;
  
    document.querySelectorAll(".modify").forEach(btn => {
      btn.addEventListener("click", () => {
        const card = btn.parentElement?.parentElement as HTMLElement | null;
        if (!card) return;
        const title = card.querySelector(".cardstyle-title") as HTMLElement | null;
        const main = card.querySelector("main")!;
        titlearea.value = title!.innerText; // 編集前のタイトルをセット
        textarea.value = main.innerText; // 編集前の内容をセット
        currentCardTitle = title;
        currentCardMain = main;
        editModal.openModal();
      });
    });

    // Enterキーで保存
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (currentCardMain) {
          currentCardTitle!.innerText = titlearea.value; // 編集内容を反映
          currentCardMain.innerText = textarea.value;
          editModal.closeModal();
        }
      }
    });
  
    saveBtn.addEventListener("click", () => {
      if (currentCardMain) {
        currentCardTitle!.innerText = titlearea.value; // 編集内容を反映
        currentCardMain.innerText = textarea.value; // 編集内容を反映
        editModal.closeModal();
      }
    });
  });

  return 0;
}

// エントリーポイントのコール
let return_code = main();
if (return_code != 0) {
  console.error("❌エラー！ main関数は以下のリターンコードで終了しました。 : " + return_code);
} else {
  console.info("✅成功！ main関数は正常に終了しました。");
}