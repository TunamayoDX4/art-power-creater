/// ART-Power-CreaterのTypeScriptコード
/// 

import { CardElement } from "./card_ui";

/// LLMのメッセージの役割・送信元の指定
type LlmMessageRole = "user" 
| "assistant" 
| "system" 
| "function" 
| "function_call";

/// LLMのメッセージの構造体
type LlmMessage = {
  role: LlmMessageRole;
  content?: string;
  name?: string;
  arguments?: string;
}

/// Socket経由のメッセージ受取の一次処理インターフェース
interface MessageReceiver {
  /// Socketからのメッセージ受信の一次処理インターフェース
  /// @param message 受信したメッセージ
  /// exmaple: recerive(message: string)... {
  ///   console.log("Received message: " + message);
  ///   return message;
  /// }
  receive(message: string): string;
}

/// Socket経由のメッセージ送信の一次処理インターフェース
interface MessageTransmitter {
  /// Socketへのメッセージ送信の一次処理インターフェース
  /// @param message 送信するメッセージ
  /// exmaple: transmit(message: string)... {
  ///   console.log("Transmitting message: " + message);
  ///   return message;
  /// }
  transmit(message: string): string;
}

/// Socketの抽象化インターフェース
/// @param receiver Socketからのメッセージ受信の一次処理インターフェース
/// @param transmitter Socketへのメッセージ送信の一次処理インターフェース
/// @param socket_helper Socketのヘルパークラス
/// @param socket_abstract Socketの抽象化インターフェース
/// @param socket_helper Socketのヘルパークラス
interface SocketAbstract {

  /// Socketの初期化
  init(): void;
  /// Socketの接続
  connect(): void;
  /// Socketの切断
  disconnect(): void;
  /// Socketのメッセージ受信
  receiveMessage(message: string): void;
  /// Socketのメッセージ送信
  sendMessage(message: string): void;
}

/// Socketのヘルパークラス
/// @param receiver Socketからのメッセージ受信の一次処理インターフェース
/// @param transmitter Socketへのメッセージ送信の一次処理インターフェース
class SocketHelper {
  receiver: MessageReceiver;
  transmitter: MessageTransmitter;
  socket: SocketAbstract;
  constructor(receiver: MessageReceiver, transmitter: MessageTransmitter, socket: SocketAbstract) {
    this.receiver = receiver;
    this.transmitter = transmitter;
    this.socket = socket;
  }
  send(message: string): void {
    // メッセージを送信する前に一次処理を行う
    const processedMessage = this.transmitter.transmit(message);
    this.socket.sendMessage(processedMessage);
  }
  recv(message: string): void {
    // メッセージを受信した後に一次処理を行う
    const processedMessage = this.receiver.receive(message);
    this.socket.receiveMessage(processedMessage);
  }
}

/// LLMとのインターフェースの抽象化
class LlmInterface {
  /// サーバとのソケット
  server: WebSocket;
  /// LLMのモデル名
  model: string;
  /// 使用可能なモデルのリスト
  usable_models: Array<string> | null;
  temperature: number;
  max_tokens: number;
  stream_mode: boolean;
  messages: Array<LlmMessage>;

  constructor(
    server: WebSocket,
    model: string, 
    temperature: number, 
    max_tokens: number, 
    stream_mode: boolean, 
    messages: Array<LlmMessage> | null = null, 
  ) {
    this.server = server;
    this.model = model;
    this.usable_models = null;
    this.messages = messages ? messages : [];
    this.temperature = temperature;
    this.max_tokens = max_tokens;
    this.stream_mode = stream_mode;
  }
}

// アシスタントAIに対するインターフェースの抽象化
class AssistantAIInterface {
  // ユーザが指定しているメッセージのインデックス
  index: number;

  constructor(index: number) {
    this.index = index;
  }
}

// 実質上のエントリーポイント
function main(): number {
  const card = document.getElementsByClassName("card-ui");

  Array.from(card).forEach((element) => {
    let card = new CardElement(element as HTMLElement);
    card.header!.innerHTML = "<h2>カカカード</h2>"
  })

  return 0;
}

// エントリーポイントのコール
let return_code = main();
if (return_code != 0) {
  console.error("Error: main() returned " + return_code);
} else {
  console.log("Success: main() executed successfully.");
}