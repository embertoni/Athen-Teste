import { PageLayout } from "../components/layout/PageLayout";
import { DatabaseNotConnected } from "../components/layout/DatabaseNotConnected";

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
    <PageLayout>
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-muted">
          PLATAFORMA / <span className="text-gold">AMIGOS</span>
        </p>
        <h1 className="mt-[10px] font-display text-[46px] leading-[1.05] tracking-[-0.8px] text-ink max-[760px]:text-[36px]">
          Amigos
        </h1>
        <p className="mt-[9px] text-[14px] text-muted">Encontre pessoas e acompanhe sua rede de estudos.</p>
      </header>

      <DatabaseNotConnected recurso="seus amigos" className="mt-8" />
    </PageLayout>
  );
}
