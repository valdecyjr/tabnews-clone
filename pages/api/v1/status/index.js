export default function status(request, response) {
  response
    .status(200)
    .json({ chave: "Alunos do curso.dev são a cima da média" });
}
