const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready", handleReturn);

  function handleReturn(err, stdout, stderr) {
    if (err) {
      if (stderr == "") {
        setTimeout(checkPostgres, 5000);
        return;
      }
      console.error(`Erro ao verificar o Postgres: ${stderr}`);
      setTimeout(checkPostgres, 5000);
      return;
    }

    if (stdout.includes("accepting connections")) {
      console.log("\u{1F7E2} Postgres está aceitando conexões.\n");
      return;
    }

    console.log(
      "Postgres ainda não está aceitando conexões. Tentando novamente...",
    );
    setTimeout(checkPostgres, 5000);
  }
}

console.log("\u{1F534} Aguardando o Postgres aceitar conexões...\n");
checkPostgres();
