import { useState, type ReactNode } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { DatabaseNotConnected } from "../components/layout/DatabaseNotConnected";
import "./Cursos.css";

// ---------------------------------------------------------------------------
// Ícones (só os que esta página usa)
// ---------------------------------------------------------------------------
type NomeIcone = "search" | "filter" | "plus";

const caminhos: Record<NomeIcone, ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  filter: <path d="M4 7h16M7 12h10M10 17h4" />,
  plus: <path d="M12 5v14M5 12h14" />,
};

function Icone({ nome, tamanho = 20 }: { nome: NomeIcone; tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {caminhos[nome]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Página
//
// O conteúdo de exemplo (cursos, módulos, avaliações e cards pré-prontos) foi
// removido: enquanto a integração com o banco não é implementada, a listagem
// mostra o aviso padrão de "banco não conectado" em vez de dados inventados.
// A busca, o filtro e o botão de criar continuam na interface para preservar o
// layout e serão ligados às consultas do Supabase quando a conexão existir.
// ---------------------------------------------------------------------------
export default function Cursos() {
  const [busca, setBusca] = useState("");

  return (
    <PageLayout variant="bare">
      <div className="cursos">
        <main className="cursos__main">
          <div className="cursos__brilho" />

          <header className="cursos__cabecalho">
            <div>
              <p className="cursos__caminho">PLATAFORMA / <span>CURSOS</span></p>
              <h1 className="cursos__titulo">Cursos</h1>
              <p className="cursos__subtitulo">Aprenda em comunidade, compartilhe conquistas.</p>
            </div>
            <button className="cursos__botao-primario" type="button" disabled>
              <Icone nome="plus" tamanho={19} />
              Criar curso
            </button>
          </header>

          <section className="cursos__ferramentas" aria-label="Busca e filtros">
            <label className="cursos__busca">
              <Icone nome="search" tamanho={21} />
              <input
                type="search"
                placeholder="Buscar por nome ou assunto..."
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </label>
            <label className="cursos__filtro">
              <Icone nome="filter" />
              <span className="sr-only">Filtrar por categoria</span>
              <select disabled>
                <option value="">Todas as categorias</option>
              </select>
            </label>
          </section>

          <p className="cursos__contador">
            Seus cursos <span>0</span>
          </p>

          <DatabaseNotConnected recurso="os cursos" className="mt-[24px]" />
        </main>
      </div>
    </PageLayout>
  );
}
