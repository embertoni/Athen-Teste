import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/layout/PageLayout";
import { aulaRepository, cursoRepository, matriculaRepository, moduloRepository } from "../data/repositories";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import "./Catalogo.css";

type Curso = Database["public"]["Tables"]["courses"]["Row"];
type Modulo = Database["public"]["Tables"]["modules"]["Row"];
type Aula = Database["public"]["Tables"]["lessons"]["Row"];
type ModuloComAulas = Modulo & { aulas: Aula[] };

// ---------------------------------------------------------------------------
// Ícones (só os que esta página usa)
// ---------------------------------------------------------------------------
type NomeIcone = "search" | "filter" | "plus" | "close" | "arrow" | "play";

const caminhos: Record<NomeIcone, ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  filter: <path d="M4 7h16M7 12h10M10 17h4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  play: <path d="m9 7 8 5-8 5Z" />,
};

function Icone({ nome, tamanho = 20 }: { nome: NomeIcone; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {caminhos[nome]}
    </svg>
  );
}

const DEFAULT_COURSE_ICON = "📚";

// Busca sem diferenciar maiúsculas e acentos.
const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// ---------------------------------------------------------------------------
// Modal de detalhes do curso: módulos, aulas e ação de matrícula.
// ---------------------------------------------------------------------------
function CursoModal({ curso, onFechar }: { curso: Curso; onFechar: () => void }) {
  const navigate = useNavigate();
  const [modulos, setModulos] = useState<ModuloComAulas[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [matriculado, setMatriculado] = useState(false);
  const [acaoCarregando, setAcaoCarregando] = useState(false);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onFechar();
    }
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
        const [listaModulos, { data: userData }] = await Promise.all([
          moduloRepository.listarPorCurso(curso.id),
          supabase.auth.getUser(),
        ]);
        const comAulas = await Promise.all(
          listaModulos.map(async (modulo) => ({ ...modulo, aulas: await aulaRepository.listarPorModulo(modulo.id) })),
        );

        const idUsuario = userData.user?.id;
        const matricula = idUsuario ? await matriculaRepository.obter(curso.id, idUsuario) : null;

        if (cancelado) return;
        setModulos(comAulas);
        setMatriculado(Boolean(matricula));
      } catch (error) {
        if (!cancelado) setErro(error instanceof Error ? error.message : "Não foi possível carregar o curso.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregar();
    return () => { cancelado = true; };
  }, [curso.id]);

  const totalAulas = modulos.reduce((soma, modulo) => soma + modulo.aulas.length, 0);

  async function matricularOuAbrir() {
    if (matriculado) {
      navigate(`/dashboard?curso=${curso.id}`);
      return;
    }
    setAcaoCarregando(true);
    setErro("");
    try {
      await matriculaRepository.matricular(curso.id);
      setMatriculado(true);
      navigate(`/dashboard?curso=${curso.id}`);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível matricular no curso.");
    } finally {
      setAcaoCarregando(false);
    }
  }

  return (
    <div className="catalogo__modal-camada" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) onFechar(); }}>
      <section className="catalogo__modal" role="dialog" aria-modal="true" aria-labelledby="catalogo-modal-titulo">
        <div className="catalogo__modal-banner">
          <span className="catalogo__modal-categoria">{(curso.category || "Geral").toUpperCase()}</span>
          <button className="catalogo__modal-fechar" type="button" onClick={onFechar} aria-label="Fechar">
            <Icone nome="close" tamanho={22} />
          </button>
        </div>

        <div className="catalogo__modal-corpo">
          <div className="catalogo__identidade">
            <div className="catalogo__modal-icone">{DEFAULT_COURSE_ICON}</div>
            <div>
              <p className="catalogo__rotulo">CURSO</p>
              <h2 className="catalogo__modal-titulo" id="catalogo-modal-titulo">{curso.title}</h2>
              <p className="catalogo__modal-slug">{curso.slug}</p>
            </div>
          </div>

          {curso.description && <p className="catalogo__sobre-texto">{curso.description}</p>}

          <div className="catalogo__painel">
            <div className="catalogo__painel-cabecalho">
              <h3 className="catalogo__painel-titulo">Conteúdo do curso</h3>
              <span className="catalogo__painel-resumo">
                {carregando ? "..." : `${modulos.length} módulos · ${totalAulas} aulas`}
              </span>
            </div>

            {carregando ? (
              <p className="catalogo__estado">Carregando conteúdo...</p>
            ) : modulos.length === 0 ? (
              <p className="catalogo__estado">Este curso ainda não tem módulos.</p>
            ) : (
              <div className="catalogo__modulos">
                {modulos.map((modulo) => (
                  <div className="catalogo__modulo" key={modulo.id}>
                    <div className="catalogo__modulo-cabecalho">
                      <span className="catalogo__modulo-icone">{modulo.icon || "📘"}</span>
                      <strong>{modulo.title}</strong>
                      <small>{modulo.aulas.length} aula(s)</small>
                    </div>
                    {modulo.aulas.length > 0 && (
                      <ul className="catalogo__aulas">
                        {modulo.aulas.map((aula) => (
                          <li className="catalogo__aula" key={aula.id}>
                            <span className="catalogo__aula-play"><Icone nome="play" tamanho={12} /></span>
                            {aula.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {erro && <p className="catalogo__estado catalogo__estado--erro">{erro}</p>}
        </div>

        <footer className="catalogo__modal-rodape">
          <button className="catalogo__botao-secundario" type="button" onClick={onFechar}>Fechar</button>
          <button className="catalogo__botao-primario" type="button" onClick={() => void matricularOuAbrir()} disabled={acaoCarregando}>
            {acaoCarregando ? "..." : matriculado ? "Continuar curso" : "Matricular-se"}
            <Icone nome="arrow" tamanho={18} />
          </button>
        </footer>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------
export default function Catalogo() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cursoAberto, setCursoAberto] = useState<Curso | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const lista = await cursoRepository.listarPublicados();
        if (!cancelado) setCursos(lista);
      } catch (error) {
        if (!cancelado) setErro(error instanceof Error ? error.message : "Não foi possível carregar os cursos.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregar();
    return () => { cancelado = true; };
  }, []);

  const categorias = useMemo(
    () => [...new Set(cursos.map((curso) => curso.category).filter((c): c is string => Boolean(c)))].sort(),
    [cursos],
  );

  const termo = normalizar(busca.trim());
  const cursosFiltrados = useMemo(
    () => cursos.filter(
      (curso) =>
        (!termo || normalizar(curso.title).includes(termo) || normalizar(curso.category ?? "").includes(termo))
        && (!categoria || curso.category === categoria),
    ),
    [cursos, termo, categoria],
  );

  return (
    <PageLayout variant="bare">
      <div className="catalogo">
        <main className="catalogo__main">
          <div className="catalogo__brilho" />

          <header className="catalogo__cabecalho">
            <div>
              <p className="catalogo__caminho">PLATAFORMA / <span>CATÁLOGO</span></p>
              <h1 className="catalogo__titulo">Catálogo</h1>
              <p className="catalogo__subtitulo">Explore os cursos da comunidade e comece a aprender.</p>
            </div>
            {/* Criação de curso ainda não implementada (tela própria pendente). */}
            <button className="catalogo__botao-primario" type="button" disabled title="Em breve">
              <Icone nome="plus" tamanho={19} />
              Criar curso
            </button>
          </header>

          <section className="catalogo__ferramentas" aria-label="Busca e filtros">
            <label className="catalogo__busca">
              <Icone nome="search" tamanho={21} />
              <input
                type="search"
                placeholder="Buscar por nome ou assunto..."
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </label>
            <label className="catalogo__filtro">
              <Icone nome="filter" />
              <span className="sr-only">Filtrar por categoria</span>
              <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)} disabled={categorias.length === 0}>
                <option value="">Todas as categorias</option>
                {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
          </section>

          <p className="catalogo__contador">
            Cursos disponíveis <span>{carregando ? "..." : cursosFiltrados.length}</span>
          </p>

          {carregando ? (
            <p className="catalogo__estado">Carregando cursos...</p>
          ) : erro ? (
            <p className="catalogo__estado catalogo__estado--erro">{erro}</p>
          ) : cursos.length === 0 ? (
            <p className="catalogo__estado">Nenhum curso publicado ainda.</p>
          ) : cursosFiltrados.length === 0 ? (
            <p className="catalogo__estado">Nenhum curso encontrado para a busca.</p>
          ) : (
            <section className="catalogo__grade">
              {cursosFiltrados.map((curso) => (
                <button
                  key={curso.id}
                  type="button"
                  className="catalogo__card"
                  onClick={() => setCursoAberto(curso)}
                >
                  <div className="catalogo__card-banner">
                    {curso.cover_url
                      ? <img src={curso.cover_url} alt="" className="catalogo__card-img" />
                      : <span className="catalogo__card-icone" aria-hidden="true">{DEFAULT_COURSE_ICON}</span>}
                    {curso.category && <span className="catalogo__card-tag">{curso.category}</span>}
                  </div>
                  <div className="catalogo__card-corpo">
                    <h2 className="catalogo__card-titulo">{curso.title}</h2>
                    {curso.description && <p className="catalogo__card-desc">{curso.description}</p>}
                    <span className="catalogo__card-mais">Ver curso <Icone nome="arrow" tamanho={16} /></span>
                  </div>
                </button>
              ))}
            </section>
          )}
        </main>
      </div>

      {cursoAberto && <CursoModal curso={cursoAberto} onFechar={() => setCursoAberto(null)} />}
    </PageLayout>
  );
}
