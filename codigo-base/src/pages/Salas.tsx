import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import {
  avisoRepository,
  cursoRepository,
  missaoRepository,
  participaRepository,
  salaRepository,
  usuarioRepository,
} from "../data/repositories";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import "./Salas.css";

type Sala = Database["public"]["Tables"]["rooms"]["Row"];
type Curso = Database["public"]["Tables"]["courses"]["Row"];
type Aviso = Database["public"]["Tables"]["announcements"]["Row"];
type Missao = Database["public"]["Tables"]["missions"]["Row"];
type Papel = Database["public"]["Enums"]["user_role"];

type SalaComContexto = { sala: Sala; curso: Curso | null; ehDono: boolean };

// ---------------------------------------------------------------------------
// Ícones
// ---------------------------------------------------------------------------
type NomeIcone = "search" | "plus" | "people" | "close" | "arrow" | "key";

const caminhos: Record<NomeIcone, ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5.3A3 3 0 0 1 16 11M17 14a5 5 0 0 1 4 4.9V20" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  key: <><circle cx="8" cy="15" r="4" /><path d="m10.5 12.5 7.5-7.5M16 4l3 3M18 6l-2 2" /></>,
};

function Icone({ nome, tamanho = 20 }: { nome: NomeIcone; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {caminhos[nome]}
    </svg>
  );
}

const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// ---------------------------------------------------------------------------
// Modal de detalhes da sala: avisos, missões e nº de membros.
// ---------------------------------------------------------------------------
function SalaModal({ item, onFechar }: { item: SalaComContexto; onFechar: () => void }) {
  const { sala, curso } = item;
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [membros, setMembros] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) { if (evento.key === "Escape") onFechar(); }
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [onFechar]);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const [listaAvisos, listaMissoes, listaMembros] = await Promise.all([
          avisoRepository.listarPorSala(sala.id),
          missaoRepository.listarPorSala(sala.id),
          participaRepository.listarPorSala(sala.id),
        ]);
        if (cancelado) return;
        setAvisos(listaAvisos);
        setMissoes(listaMissoes);
        setMembros(listaMembros.length);
      } catch (error) {
        if (!cancelado) setErro(error instanceof Error ? error.message : "Não foi possível carregar a sala.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    void carregar();
    return () => { cancelado = true; };
  }, [sala.id]);

  return (
    <div className="salas__modal-camada" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <section className="salas__modal" role="dialog" aria-modal="true" aria-labelledby="salas-modal-titulo">
        <div className="salas__modal-banner">
          <span className="salas__modal-categoria">SALA</span>
          <button className="salas__modal-fechar" type="button" onClick={onFechar} aria-label="Fechar"><Icone nome="close" tamanho={22} /></button>
        </div>

        <div className="salas__modal-corpo">
          <div className="salas__identidade">
            <div className="salas__modal-icone">👨‍🏫</div>
            <div>
              <p className="salas__rotulo">SALA DE APRENDIZAGEM</p>
              <h2 className="salas__modal-titulo" id="salas-modal-titulo">{sala.name}</h2>
              <p className="salas__modal-slug">Código: <strong>{sala.access_code}</strong>{curso ? ` · ${curso.title}` : ""}</p>
            </div>
            <span className="salas__membros"><Icone nome="people" tamanho={14} />{membros}</span>
          </div>

          {carregando ? (
            <p className="salas__estado">Carregando sala...</p>
          ) : erro ? (
            <p className="salas__estado salas__estado--erro">{erro}</p>
          ) : (
            <>
              <div className="salas__painel">
                <h3 className="salas__painel-titulo">Missões</h3>
                {missoes.length === 0 ? (
                  <p className="salas__painel-vazio">Nenhuma missão nesta sala.</p>
                ) : (
                  <ul className="salas__lista-painel">
                    {missoes.map((m) => (
                      <li key={m.id} className="salas__item-painel">
                        <strong>{m.title}</strong>
                        {m.description && <p>{m.description}</p>}
                        <small>+{m.reward_xp} XP</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="salas__painel">
                <h3 className="salas__painel-titulo">Mural de avisos</h3>
                {avisos.length === 0 ? (
                  <p className="salas__painel-vazio">Nenhum aviso ainda.</p>
                ) : (
                  <ul className="salas__lista-painel">
                    {avisos.map((a) => (
                      <li key={a.id} className="salas__item-painel">
                        <strong>{a.title}</strong>
                        {a.content && <p>{a.content}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <footer className="salas__modal-rodape">
          <button className="salas__botao-secundario" type="button" onClick={onFechar}>Fechar</button>
        </footer>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------
export default function Salas() {
  const [itens, setItens] = useState<SalaComContexto[]>([]);
  const [papel, setPapel] = useState<Papel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [salaAberta, setSalaAberta] = useState<SalaComContexto | null>(null);

  // Entrar por código
  const [codigo, setCodigo] = useState("");
  const [acaoMsg, setAcaoMsg] = useState("");
  const [acaoCarregando, setAcaoCarregando] = useState(false);

  // Criação (educadores)
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoCurso, setNovoCurso] = useState("");
  const [meusCursos, setMeusCursos] = useState<Curso[]>([]);

  // Token incrementado pelas ações para forçar a releitura das salas.
  const [recarregarToken, setRecarregarToken] = useState(0);
  const recarregar = useCallback(() => setRecarregarToken((n) => n + 1), []);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const { data: userData } = await supabase.auth.getUser();
        const idUsuario = userData.user?.id;
        if (!idUsuario) {
          if (!cancelado) setItens([]);
          return;
        }

        const [perfil, cursos, participacoes, salasDoEducador] = await Promise.all([
          usuarioRepository.obterAtual(),
          cursoRepository.listar(),
          participaRepository.listarPorUsuario(idUsuario),
          salaRepository.listarPorEducador(idUsuario),
        ]);

        const cursoPorId = new Map(cursos.map((curso) => [curso.id, curso]));

        // Salas onde é membro (resolve cada room por id).
        const salasMembro = await Promise.all(
          participacoes.map(async (p) => salaRepository.obterPorId(p.room_id)),
        );

        // Junta as salas do educador (dono) com as salas em que participa, sem duplicar.
        const mapa = new Map<string, SalaComContexto>();
        for (const sala of salasDoEducador) {
          mapa.set(sala.id, { sala, curso: sala.course_id ? cursoPorId.get(sala.course_id) ?? null : null, ehDono: true });
        }
        for (const sala of salasMembro) {
          if (sala && !mapa.has(sala.id)) {
            mapa.set(sala.id, { sala, curso: sala.course_id ? cursoPorId.get(sala.course_id) ?? null : null, ehDono: false });
          }
        }

        if (cancelado) return;
        setPapel(perfil?.role ?? null);
        setMeusCursos(cursos.filter((curso) => curso.creator_id === idUsuario));
        setItens([...mapa.values()]);
      } catch (error) {
        if (!cancelado) setErro(error instanceof Error ? error.message : "Não foi possível carregar as salas.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregar();
    return () => { cancelado = true; };
  }, [recarregarToken]);

  const ehEducador = papel === "educator" || papel === "admin";

  const termo = normalizar(busca.trim());
  const itensFiltrados = useMemo(
    () => itens.filter((item) => !termo || normalizar(item.sala.name).includes(termo) || normalizar(item.sala.access_code).includes(termo)),
    [itens, termo],
  );

  async function entrarPorCodigo(evento: FormEvent) {
    evento.preventDefault();
    const code = codigo.trim();
    if (!code) return;
    setAcaoCarregando(true);
    setAcaoMsg("");
    try {
      await salaRepository.entrarPorCodigo(code);
      setCodigo("");
      setAcaoMsg("Você entrou na sala!");
      recarregar();
    } catch (error) {
      setAcaoMsg(error instanceof Error ? error.message : "Não foi possível entrar na sala.");
    } finally {
      setAcaoCarregando(false);
    }
  }

  async function criarSala(evento: FormEvent) {
    evento.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;
    setAcaoCarregando(true);
    setAcaoMsg("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      const idUsuario = userData.user?.id;
      if (!idUsuario) throw new Error("Faça login para criar uma sala.");

      // Código de acesso simples e único o suficiente para testes.
      const codigoAcesso = `${normalizar(nome).replace(/[^a-z0-9]+/g, "").slice(0, 6).toUpperCase() || "SALA"}-${Math.floor(1000 + Math.random() * 9000)}`;

      await salaRepository.criar({
        educator_id: idUsuario,
        name: nome,
        access_code: codigoAcesso,
        course_id: novoCurso || null,
      });

      setNovoNome("");
      setNovoCurso("");
      setMostrarForm(false);
      setAcaoMsg(`Sala criada! Código: ${codigoAcesso}`);
      recarregar();
    } catch (error) {
      setAcaoMsg(error instanceof Error ? error.message : "Não foi possível criar a sala.");
    } finally {
      setAcaoCarregando(false);
    }
  }

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
            {ehEducador && (
              <button className="salas__botao-primario" type="button" onClick={() => setMostrarForm((v) => !v)}>
                <Icone nome="plus" tamanho={19} />
                Criar sala
              </button>
            )}
          </header>

          {/* Entrar por código (qualquer usuário) */}
          <form className="salas__entrar" onSubmit={(e) => void entrarPorCodigo(e)} aria-label="Entrar em uma sala por código">
            <label className="salas__busca salas__entrar-campo">
              <Icone nome="key" tamanho={19} />
              <input type="text" placeholder="Código da sala (ex.: LOGICA25)" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </label>
            <button className="salas__botao-primario" type="submit" disabled={acaoCarregando || !codigo.trim()}>Entrar</button>
          </form>

          {/* Criar sala (educadores) */}
          {ehEducador && mostrarForm && (
            <form className="salas__form-criar" onSubmit={(e) => void criarSala(e)}>
              <h2>Criar sala</h2>
              <input required placeholder="Nome da sala" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
              <select value={novoCurso} onChange={(e) => setNovoCurso(e.target.value)}>
                <option value="">Vincular a um curso (opcional)</option>
                {meusCursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.title}</option>)}
              </select>
              <div className="salas__form-acoes">
                <button className="salas__botao-primario" type="submit" disabled={acaoCarregando}>Salvar sala</button>
                <button className="salas__botao-secundario" type="button" onClick={() => setMostrarForm(false)}>Cancelar</button>
              </div>
            </form>
          )}

          {acaoMsg && <p className="salas__acao-msg">{acaoMsg}</p>}

          <section className="salas__ferramentas" aria-label="Busca">
            <label className="salas__busca">
              <Icone nome="search" tamanho={21} />
              <input type="search" placeholder="Buscar nas suas salas..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </label>
          </section>

          <p className="salas__contador">Suas salas <span>{carregando ? "..." : itensFiltrados.length}</span></p>

          {carregando ? (
            <p className="salas__estado">Carregando salas...</p>
          ) : erro ? (
            <p className="salas__estado salas__estado--erro">{erro}</p>
          ) : itens.length === 0 ? (
            <p className="salas__estado">Você ainda não participa de nenhuma sala. Entre com um código acima.</p>
          ) : itensFiltrados.length === 0 ? (
            <p className="salas__estado">Nenhuma sala encontrada para a busca.</p>
          ) : (
            <section className="salas__grade">
              {itensFiltrados.map((item) => (
                <button key={item.sala.id} type="button" className="salas__card" onClick={() => setSalaAberta(item)}>
                  <div className="salas__card-banner">
                    <span className="salas__card-icone" aria-hidden="true">👨‍🏫</span>
                    <span className="salas__card-tag">{item.ehDono ? "Você criou" : "Membro"}</span>
                  </div>
                  <div className="salas__card-corpo">
                    <h2 className="salas__card-titulo">{item.sala.name}</h2>
                    <p className="salas__card-slug">Código: {item.sala.access_code}</p>
                    {item.curso && <p className="salas__card-curso">{item.curso.title}</p>}
                    <span className="salas__card-mais">Abrir sala <Icone nome="arrow" tamanho={16} /></span>
                  </div>
                </button>
              ))}
            </section>
          )}
        </main>
      </div>

      {salaAberta && <SalaModal item={salaAberta} onFechar={() => setSalaAberta(null)} />}
    </PageLayout>
  );
}
