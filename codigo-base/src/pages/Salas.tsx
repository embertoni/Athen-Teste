import { useState, type ReactNode } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { DatabaseNotConnected } from "../components/layout/DatabaseNotConnected";
import "./Salas.css";

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
// Página Salas
//
// O conteúdo de exemplo (salas, módulos, ranking, avaliações e avisos) foi
// removido: enquanto a integração com o banco não é implementada, a listagem
// mostra o aviso padrão de "banco não conectado" em vez de dados inventados.
// A busca, o filtro e o botão de adicionar continuam na interface para
// preservar o layout e serão ligados ao Supabase quando a conexão existir.
// ---------------------------------------------------------------------------
export default function Salas() {
  const [busca, setBusca] = useState("");

  return (
    <PageLayout variant="bare">
      <div className="salas">
        <main className="salas__main">
          <div className="salas__brilho" />

          <header className="salas__cabecalho">
            <div>
              <p className="salas__caminho">PLATAFORMA / <span>SALAS</span></p>
              <h1 className="salas__titulo">Salas</h1>
              <p className="salas__subtitulo">Aprenda em comunidade, compartilhe conquistas.</p>
            </div>
            <button className="salas__botao-primario" type="button" disabled>
              <Icone nome="plus" tamanho={19} />
              Adicionar sala
            </button>
          </header>

          <section className="salas__ferramentas" aria-label="Busca e filtros">
            <label className="salas__busca">
              <Icone nome="search" tamanho={21} />
              <input
                type="search"
                placeholder="Buscar por nome ou assunto..."
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </label>
            <button className="salas__filtro" type="button" aria-label="Filtrar salas" disabled>
              <Icone nome="filter" />
              <span>Filtrar</span>
            </button>
          </section>

          <p className="salas__contador">
            Suas salas <span>0</span>
          </p>

          <DatabaseNotConnected recurso="as salas" className="mt-[24px]" />
        </main>
      </div>
    </PageLayout>
  );
}
