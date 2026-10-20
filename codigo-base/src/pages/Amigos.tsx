import { PageLayout } from "../components/layout/PageLayout";
import { DatabaseNotConnected } from "../components/layout/DatabaseNotConnected";

// ---------------------------------------------------------------------------
// Página
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
        <h1 className="font-display text-3xl text-[#f4eeff] min-[1280px]:text-4xl">Amigos</h1>
        <p className="mt-2 text-sm text-[#b8aacb]">Sua lista de amigos</p>
      </header>

      <DatabaseNotConnected recurso="seus amigos" className="mt-8" />
    </PageLayout>
  );
}
