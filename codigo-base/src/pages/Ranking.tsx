import { useEffect, useState } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { DatabaseNotConnected } from "../components/layout/DatabaseNotConnected";
import { rankingRepository } from "../data/repositories";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import "./Ranking.css";

type RankingGlobal = Database["public"]["Views"]["global_ranking"]["Row"];

// Enquanto a integração com o banco não é finalizada, a página mostra o aviso
// padrão de "banco não conectado". Quando a conexão existir, basta trocar esta
// constante para true: a página já busca e renderiza o ranking global real.
const BANCO_CONECTADO = false;

const formatarXp = (xp: number) => `${xp.toLocaleString("pt-BR")} XP`;

export default function Ranking() {
  const [ranking, setRanking] = useState<RankingGlobal[]>([]);
  const [idUsuarioAtual, setIdUsuarioAtual] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(BANCO_CONECTADO);
  const [erro, setErro] = useState("");

  // Busca o ranking global por XP acumulado (somente quando o banco está pronto).
  useEffect(() => {
    if (!BANCO_CONECTADO) return;

    let cancelado = false;

    async function carregarRanking() {
      setCarregando(true);
      setErro("");

      try {
        const { data: userData } = await supabase.auth.getUser();
        const [lista] = await Promise.all([rankingRepository.listarGlobal(100)]);

        if (cancelado) return;
        setIdUsuarioAtual(userData.user?.id ?? null);
        setRanking(lista);
      } catch (error) {
        if (cancelado) return;
        setErro(error instanceof Error ? error.message : "Não foi possível carregar o ranking.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregarRanking();
    return () => { cancelado = true; };
  }, []);

  return (
    <PageLayout variant="bare">
      <div className="ranking">
        <main className="ranking__main">
          <div className="ranking__brilho" />

          <header className="ranking__cabecalho">
            <p className="ranking__caminho">PLATAFORMA / <span>RANKING</span></p>
            <h1 className="ranking__titulo">Ranking</h1>
            <p className="ranking__subtitulo">Veja os estudantes com mais XP acumulado na plataforma.</p>
          </header>

          {!BANCO_CONECTADO ? (
            <DatabaseNotConnected recurso="o ranking global de XP" className="mt-[24px]" />
          ) : carregando ? (
            <p className="ranking__estado">Carregando o ranking...</p>
          ) : erro ? (
            <p className="ranking__estado ranking__estado--erro">{erro}</p>
          ) : ranking.length === 0 ? (
            <p className="ranking__estado">Ainda não há estudantes no ranking.</p>
          ) : (
            <ol className="ranking__lista">
              {ranking.map((item) => {
                const ehVoce = item.user_id != null && item.user_id === idUsuarioAtual;
                const nome = item.display_name?.trim() || item.username || "Estudante";

                return (
                  <li
                    key={item.user_id ?? `${item.position}-${nome}`}
                    className={`ranking__linha${ehVoce ? " ranking__linha--voce" : ""}`}
                  >
                    <span className="ranking__posicao">{item.position ?? "-"}º</span>
                    <span className="ranking__avatar" aria-hidden="true">
                      {item.avatar_url
                        ? <img src={item.avatar_url} alt="" className="ranking__avatar-img" />
                        : nome.charAt(0).toUpperCase()}
                    </span>
                    <span className="ranking__nome">
                      {nome}
                      {ehVoce && <span className="ranking__voce">VOCÊ</span>}
                    </span>
                    <span className="ranking__nivel">Nv. {item.level ?? 1}</span>
                    <span className="ranking__xp">{formatarXp(item.xp_global ?? 0)}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </main>
      </div>
    </PageLayout>
  );
}
