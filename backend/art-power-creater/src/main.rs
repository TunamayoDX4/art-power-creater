use tracing_appender::non_blocking::WorkerGuard;

mod config;
use config::CONFIG;

/// 標準エラー型
type StdError =
  Box<dyn std::error::Error + Send + Sync + 'static>;

/// tracingの初期化関数
///
/// ## Summary
/// ログ出力のためのtracingを初期化する。
///
/// ## Argument
/// - **引数はありません**
///
/// ## Return value
/// - `Result<WorkerGuard, StdError>`
///   - 成功時は`WorkerGuard`、失敗時はエラーを返す
fn initialize_tracing() -> Result<WorkerGuard, StdError> {
  // ログファイルのローテーション設定
  let appender = tracing_appender::rolling::Builder::new()
    .rotation(tracing_appender::rolling::Rotation::DAILY)
    .max_log_files(CONFIG.log_config.log_max_rotation_count)
    .filename_prefix("apc-log_")
    .filename_suffix(".log")
    .build(CONFIG.log_config.log_dir.as_str())?;

  // 非同期ロギング用のappenderとguardを取得
  let (appender, guard) =
    tracing_appender::non_blocking(appender);

  // tracingサブスクライバの初期化
  tracing_subscriber::fmt()
    .with_max_level(if cfg!(debug_assertions) {
      tracing::Level::DEBUG
    } else {
      tracing::Level::INFO
    })
    .with_target(false)
    .with_line_number(true)
    .with_writer(appender)
    .with_ansi(false)
    .init();

  Ok(guard)
}

/// エントリーポイント
///
/// ## Summary
/// プログラムのメイン関数。
///
/// ## Argument
/// - **引数はありません**
///
/// ## Return value
/// - `Result<(), StdError>`
///   - 成功時は`Ok(())`、失敗時はエラーを返す
fn main() -> Result<(), StdError> {
  // tracingの初期化
  let _tracing_guard = initialize_tracing()?;

  // 設定内容を日本語でログ出力
  tracing::info!("設定内容: {:?}", *CONFIG);

  Ok(())
}
