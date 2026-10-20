import { PageLayout } from "../components/layout/PageLayout";
import { DatabaseNotConnected } from "../components/layout/DatabaseNotConnected";
import "./Amigos.css";

// ---------------------------------------------------------------------------
// Página Amigos
//
// O conteúdo de exemplo (diretório de usuários fictícios, catálogo de medalhas,
// pedidos de amizade e o modal de perfil) foi removido: enquanto a integração
// com o banco não é implementada, a página mostra o aviso padrão de "banco não
// conectado" em vez de perfis inventados. Quando a conexão existir, as abas de
// amigos/pedidos, a busca e o perfil voltam a ser montados com dados reais.
// ---------------------------------------------------------------------------
export default function Amigos() {
  return (
    <PageLayout variant="bare">
      <div className="amigos">
        <main className="amigos__main">
          <div className="amigos__brilho" />

          <header className="amigos__cabecalho">
            <div>
              <p className="amigos__caminho">PLATAFORMA / <span>AMIGOS</span></p>
              <h1 className="amigos__titulo">Amigos</h1>
              <p className="amigos__subtitulo">Encontre pessoas e acompanhe sua rede de estudos.</p>
            </div>
          </header>

          <DatabaseNotConnected recurso="seus amigos" className="mt-[24px]" />
        </main>
      </div>
    </PageLayout>
  );
}
