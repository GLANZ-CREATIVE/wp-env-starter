import { existsSync, unlinkSync, writeFileSync } from "node:fs";

/**
 * Vite が実際に listen したポートをファイルへ書き出す。
 * WordPress（Docker）側が読み取り、動的ポートのアセット URL に使う。
 *
 * @param {string} portFile 絶対パス
 */
export function writeDevPort(portFile) {
  const remove = () => {
    if (existsSync(portFile)) {
      unlinkSync(portFile);
    }
  };

  const write = (server) => {
    const address = server.httpServer?.address();
    if (!address || typeof address === "string") {
      return;
    }
    writeFileSync(portFile, String(address.port));
  };

  return {
    name: "write-dev-port",
    apply: "serve",
    configureServer(server) {
      // 注意: configureServer の戻り値はクリーンアップではなく
      // 「内部ミドルウェア適用後」の post hook。リスナー解除をそこでやってはいけない。
      const onListening = () => write(server);

      if (server.httpServer?.listening) {
        write(server);
      } else {
        server.httpServer?.once("listening", onListening);
      }

      server.httpServer?.once("close", remove);
      process.once("exit", remove);
    },
  };
}
