import useSWR from "swr";

async function fetchAPI(key) {
  const res = await fetch(key, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch status");
  }

  const responsebody = await res.json();
  return responsebody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseDescription />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAt = "Carregando...";

  if (!isLoading && data) {
    updatedAt = new Date(data.updated_at).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
  }

  return <div>Última atualização: {updatedAt}</div>;
}

function DatabaseDescription() {
  const { isLoading, data } = useSWR("api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let database = "Carregando...";
  let version = "Carregando...";
  let maxConnections = "Carregando...";
  let openConnections = "Carregando...";

  if (!isLoading && data) {
    console.log(data);
    database = "PostgreSQL";
    version = data.dependencies.database.version;
    maxConnections = data.dependencies.database.max_connection;
    openConnections = data.dependencies.database.opened_connections;
  }
  return (
    <>
      <h2>Banco de dados</h2>
      <p>Banco de dados: {database}</p>
      <p>Versão: {version}</p>
      <p>Máximo de conexões: {maxConnections}</p>
      <p>Conexões abertas: {openConnections}</p>
    </>
  );
}
