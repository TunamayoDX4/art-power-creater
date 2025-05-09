//! 設定管理モジュール
//!
//! アプリ全体の設定（ログディレクトリやローテーション数など）を管理する。
//! 設定ファイルの読み込み・デフォルト生成もここで行う。

use std::{
  io::{Read, Write},
  sync::LazyLock,
};

use serde::{Deserialize, Serialize};

/// ログ設定の構造体
///
/// ## Member
/// - `log_dir`: `String`型
///   - ログファイルの保存ディレクトリ
/// - `log_max_rotation_count`: `usize`型
///   - ログの最大ローテーション数
#[derive(Debug, Serialize, Deserialize)]
pub struct LogConfig {
  pub log_dir: String,
  pub log_max_rotation_count: usize,
}
impl Default for LogConfig {
  /// デフォルト値を返す
  fn default() -> Self {
    Self {
      log_dir: "./log".to_string(),
      log_max_rotation_count: 14,
    }
  }
}

/// アプリ全体の設定構造体
///
/// ## Member
/// - `log_config`: `LogConfig`型
///   - ログ設定
#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
  pub log_config: LogConfig,
}
impl Default for Config {
  /// デフォルト値を返す
  fn default() -> Self {
    Self { log_config: LogConfig::default() }
  }
}

/// 設定ファイル名
pub const CONFIG_FILE: &str = "apc_conf.json";

/// グローバル設定インスタンス
///
/// - プログラム起動時に設定ファイルを読み込む
/// - ファイルがなければデフォルト設定で新規作成し、panicする
pub static CONFIG: LazyLock<Config> = LazyLock::new(|| {
  match std::fs::File::open(CONFIG_FILE) {
    // 設定ファイルが存在する場合
    Ok(file) => {
      // ファイル内容をバッファへ読み込み
      let mut reader = std::io::BufReader::new(file);
      let mut buf = String::new();

      reader
        .read_to_string(&mut buf)
        .expect("ファイルの読み込みに失敗しました");

      // JSONからConfig構造体へデシリアライズ
      serde_json::from_str::<Config>(&buf)
        .expect("設定ファイルのパースに失敗しました")
    }

    // 設定ファイルが存在しない場合
    Err(e) => match e.kind() {
      std::io::ErrorKind::NotFound => {
        // デフォルト設定で新規作成
        eprintln!(
          "設定ファイルが見つからなかったので新規作成するね"
        );

        let default_config = Config::default();

        let mut file = std::io::BufWriter::new(
          std::fs::File::create(CONFIG_FILE)
            .expect("設定ファイルの作成に失敗しました"),
        );

        file
          .write(
            serde_json::to_string_pretty(&default_config)
              .expect(
                "デフォルト設定のシリアライズに失敗しました",
              )
              .as_bytes(),
          )
          .expect("設定ファイルへの書き込みに失敗しました");

        eprintln!(
          "デフォルト設定を作成したよ: {}",
          serde_json::to_string(&default_config).expect(
            "デフォルト設定のシリアライズに失敗しました"
          )
        );

        eprintln!(
          "プログラムを再実行する前に設定ファイルを編集してね！"
        );

        // 新規作成後はpanicで終了
        panic!(
          "設定ファイルが見つからなかったので新規作成したよ"
        );
      }

      // その他のエラー
      _ => {
        panic!("設定ファイルのオープンに失敗しました: {}", e)
      }
    },
  }
});
