import { PageLayout } from "../components/layout/PageLayout";
import { DatabaseNotConnected } from "../components/layout/DatabaseNotConnected";
import "./Ligas.css";

// ---------------------------------------------------------------------------
// Página
//
// O conteúdo de exemplo (ligas simuladas, jogadores fictícios, pódio e resumo
// da "sua jornada") foi removido: enquanto a integração com o banco não é
// implementada, a página mostra o aviso padrão de "banco não conectado" em vez
// de um ranking inventado. Quando a conexão existir, o seletor de ligas, o
// pódio e a classificação voltam a ser montados a partir dos dados reais.
// ---------------------------------------------------------------------------
export default function Ligas() {
  return (
    <PageLayout variant="bare">
      <div className="ligas">
        <main className="ligas__main">
          <div className="ligas__brilho" />

          <header className="ligas__cabecalho">
            <div>
              <p className="ligas__caminho">PLATAFORMA / <span>LIGAS</span></p>
              <h1 className="ligas__titulo">Ligas</h1>
              <p className="ligas__subtitulo">Conquiste pontos e suba de liga.</p>
            </div>
          </header>

          <DatabaseNotConnected recurso="as ligas e o ranking" className="mt-[24px]" />
        </main>
      </div>
    </PageLayout>
  );
}
