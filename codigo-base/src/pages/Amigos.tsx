import { useCallback, useEffect, useMemo, useState } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { amizadeRepository, usuarioRepository } from "../data/repositories";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";

type Amizade = Database["public"]["Tables"]["friendships"]["Row"];
type Perfil = Database["public"]["Tables"]["profiles"]["Row"];

// Amizade já resolvida com o perfil do "outro" usuário.
type AmizadeResolvida = { amizade: Amizade; outro: Perfil | null };
type ResultadoBusca = { id: string; display_name: string; username: string; avatar_url: string | null; level: number };
type Aba = "amigos" | "recebidos" | "enviados";

function Avatar({ url, nome }: { url: string | null; nome: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-line bg-[#1a0f35] text-sm font-bold text-ink">
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : nome.charAt(0).toUpperCase()}
    </span>
  );
}

const botaoPrimario = "rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-violet hover:bg-gold-light disabled:opacity-60";
const botaoSecundario = "rounded-md border border-line px-3 py-1.5 text-xs font-bold text-violet-pale hover:text-ink disabled:opacity-60";

export default function Amigos() {
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [amigos, setAmigos] = useState<AmizadeResolvida[]>([]);
  const [recebidos, setRecebidos] = useState<AmizadeResolvida[]>([]);
  const [enviados, setEnviados] = useState<AmizadeResolvida[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState<Aba>("amigos");

  // Busca de pessoas
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [buscando, setBuscando] = useState(false);

  const [acaoMsg, setAcaoMsg] = useState("");
  const [recarregarToken, setRecarregarToken] = useState(0);
  const recarregar = useCallback(() => setRecarregarToken((n) => n + 1), []);

  // Resolve, para cada amizade, o perfil do usuário que NÃO é o logado.
  const resolver = useCallback(async (lista: Amizade[], meuId: string): Promise<AmizadeResolvida[]> => {
    return Promise.all(
      lista.map(async (amizade) => {
        const outroId = amizade.requester_id === meuId ? amizade.addressee_id : amizade.requester_id;
        const outro = await usuarioRepository.obterPorId(outroId);
        return { amizade, outro };
      }),
    );
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const { data: userData } = await supabase.auth.getUser();
        const meuId = userData.user?.id ?? null;
        if (!meuId) {
          if (!cancelado) { setIdUsuario(null); setAmigos([]); setRecebidos([]); setEnviados([]); }
          return;
        }

        const [listaAmigos, listaRecebidos, listaEnviados] = await Promise.all([
          amizadeRepository.listarAmigos(meuId),
          amizadeRepository.listarPedidosRecebidos(meuId),
          amizadeRepository.listarPedidosEnviados(meuId),
        ]);

        const [rAmigos, rRecebidos, rEnviados] = await Promise.all([
          resolver(listaAmigos, meuId),
          resolver(listaRecebidos, meuId),
          resolver(listaEnviados, meuId),
        ]);

        if (cancelado) return;
        setIdUsuario(meuId);
        setAmigos(rAmigos);
        setRecebidos(rRecebidos);
        setEnviados(rEnviados);
      } catch (error) {
        if (!cancelado) setErro(error instanceof Error ? error.message : "Não foi possível carregar seus amigos.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregar();
    return () => { cancelado = true; };
  }, [recarregarToken, resolver]);

  // Busca de pessoas (debounce simples). Os setState ficam dentro do timeout
  // (assíncrono) para não disparar setState síncrono no corpo do efeito.
  useEffect(() => {
    const termo = busca.trim();
    let cancelado = false;

    const timer = window.setTimeout(async () => {
      if (termo.length < 2) {
        if (!cancelado) { setResultados([]); setBuscando(false); }
        return;
      }
      if (!cancelado) setBuscando(true);
      try {
        const achados = await usuarioRepository.buscar(termo);
        if (!cancelado) setResultados(achados as ResultadoBusca[]);
      } catch {
        if (!cancelado) setResultados([]);
      } finally {
        if (!cancelado) setBuscando(false);
      }
    }, 300);

    return () => { cancelado = true; window.clearTimeout(timer); };
  }, [busca]);

  // Ids com quem já existe relação (para a busca saber o que oferecer).
  const idsRelacionados = useMemo(() => {
    const set = new Set<string>();
    for (const grupo of [amigos, recebidos, enviados]) {
      for (const item of grupo) if (item.outro) set.add(item.outro.id);
    }
    return set;
  }, [amigos, recebidos, enviados]);

  async function executar(acao: () => Promise<unknown>, mensagem: string) {
    setAcaoMsg("");
    try {
      await acao();
      setAcaoMsg(mensagem);
      recarregar();
    } catch (error) {
      setAcaoMsg(error instanceof Error ? error.message : "Não foi possível concluir a ação.");
    }
  }

  const abas: { id: Aba; label: string; total: number }[] = [
    { id: "amigos", label: "Meus amigos", total: amigos.length },
    { id: "recebidos", label: "Pedidos recebidos", total: recebidos.length },
    { id: "enviados", label: "Pedidos enviados", total: enviados.length },
  ];

  const listaAtual = aba === "amigos" ? amigos : aba === "recebidos" ? recebidos : enviados;
  const buscaAtiva = busca.trim().length >= 2;

  return (
    <PageLayout>
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-muted">PLATAFORMA / <span className="text-gold">AMIGOS</span></p>
        <h1 className="mt-[10px] font-display text-[46px] font-normal leading-[1.05] tracking-[-0.8px] text-ink max-[760px]:text-[36px]">Amigos</h1>
        <p className="mt-[9px] text-[14px] text-muted">Encontre pessoas e acompanhe sua rede de estudos.</p>
      </header>

      {/* Busca de pessoas */}
      <label className="mt-6 flex h-[52px] items-center gap-3 rounded-[14px] border border-line bg-surface px-[18px] text-muted focus-within:border-gold">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar pessoas por nome ou usuário..."
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
        />
      </label>

      {acaoMsg && <p className="mt-3 text-[13px] text-violet-pale">{acaoMsg}</p>}

      {buscaAtiva ? (
        <section className="mt-5" aria-label="Resultados da busca">
          <p className="mb-3 text-xs text-muted">{buscando ? "Buscando..." : `${resultados.length} resultado(s)`}</p>
          <ul className="grid grid-cols-1 gap-2 min-[900px]:grid-cols-2">
            {resultados
              .filter((r) => r.id !== idUsuario)
              .map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-md border border-line bg-surface p-2.5">
                  <Avatar url={r.avatar_url} nome={r.display_name || r.username} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-ink">{r.display_name || r.username}</h3>
                    <p className="truncate text-xs text-muted">@{r.username} · Nv. {r.level}</p>
                  </div>
                  {idsRelacionados.has(r.id) ? (
                    <span className="text-xs text-muted">Já conectado</span>
                  ) : (
                    <button type="button" className={botaoPrimario} onClick={() => void executar(() => amizadeRepository.enviarPedido(r.id), "Pedido enviado.")}>
                      Adicionar
                    </button>
                  )}
                </li>
              ))}
          </ul>
          {!buscando && resultados.length === 0 && <p className="rounded-md border border-dashed border-line px-5 py-8 text-center text-sm text-muted">Nenhuma pessoa encontrada.</p>}
        </section>
      ) : (
        <>
          {/* Abas */}
          <div role="tablist" aria-label="Seções de amigos" className="mt-6 flex gap-1 rounded-md border border-line bg-surface p-1">
            {abas.map((item) => {
              const ativa = aba === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => setAba(item.id)}
                  className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-bold transition ${ativa ? "bg-violet/50 text-ink" : "text-muted hover:text-ink"}`}
                >
                  {item.label}
                  <span className={`rounded-sm px-1.5 py-0.5 text-[11px] ${ativa ? "bg-gold text-violet" : "bg-violet/30 text-violet-pale"}`}>{item.total}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            {carregando ? (
              <p className="rounded-md border border-dashed border-line px-5 py-10 text-center text-sm text-muted">Carregando...</p>
            ) : erro ? (
              <p className="rounded-md border border-red-300/40 px-5 py-10 text-center text-sm text-red-200">{erro}</p>
            ) : listaAtual.length === 0 ? (
              <p className="rounded-md border border-dashed border-line px-5 py-10 text-center text-sm text-muted">
                {aba === "amigos" ? "Você ainda não tem amigos. Busque pessoas acima." : aba === "recebidos" ? "Nenhum pedido recebido." : "Nenhum pedido enviado."}
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 min-[900px]:grid-cols-2">
                {listaAtual.map(({ amizade, outro }) => {
                  const nome = outro?.display_name || outro?.username || "Usuário";
                  return (
                    <li key={amizade.id} className="flex items-center gap-3 rounded-md border border-line bg-surface p-2.5">
                      <Avatar url={outro?.avatar_url ?? null} nome={nome} />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-ink">{nome}</h3>
                        <p className="truncate text-xs text-muted">{outro?.username ? `@${outro.username}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        {aba === "amigos" && (
                          <button type="button" className={botaoSecundario} onClick={() => void executar(() => amizadeRepository.enviarLembreteEstudo(outro!.id), "Lembrete enviado.")} disabled={!outro}>
                            Lembrar de estudar
                          </button>
                        )}
                        {aba === "recebidos" && (
                          <>
                            <button type="button" className={botaoPrimario} onClick={() => void executar(() => amizadeRepository.responder(amizade.id, "accepted"), "Pedido aceito.")}>Aceitar</button>
                            <button type="button" className={botaoSecundario} onClick={() => void executar(() => amizadeRepository.responder(amizade.id, "declined"), "Pedido recusado.")}>Recusar</button>
                          </>
                        )}
                        {aba === "enviados" && (
                          <button type="button" className={botaoSecundario} onClick={() => void executar(() => amizadeRepository.cancelar(amizade.id), "Pedido cancelado.")}>Cancelar</button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}
