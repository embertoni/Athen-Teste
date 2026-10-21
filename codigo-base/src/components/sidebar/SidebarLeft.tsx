import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { usuarioRepository } from '../../data/repositories';
import { supabase } from '../../lib/supabase';

// Rotas usadas pela sidebar. Ajuste aqui se no seu router forem diferentes.
const PROFILE_ROUTE = '/profile';
const DASHBOARD_ROUTE = '/dashboard';
const SALAS_ROUTE = '/salas';
const RANKING_ROUTE = '/ranking';
const AMIGOS_ROUTE = '/amigos';
const NOTEBOOK_ROUTE = '/caderno';
const CONFIG_ROUTE = '/configuracoes';
const CATALOGO_ROUTE = '/catalogo';

/** Evento disparado pelo Profile depois de salvar, para a sidebar recarregar o perfil. */
export const PROFILE_UPDATED_EVENT = 'athen:profile-updated';

type SidebarItem = {
    text: string;
    to?: string; // sem "to" = ainda não tem página (mantém href="#")
}

type PerfilUser = {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    streak_count: number;
    last_study_date: string | null;
}

/** Data local no formato YYYY-MM-DD (mesmo formato de profiles.last_study_date). */
function diaLocal(offsetDias = 0) {
    const data = new Date();
    data.setDate(data.getDate() + offsetDias);
    return data.toLocaleDateString("sv-SE");
}

/** A sequência só continua viva se a última aula foi hoje ou ontem. */
function streakAtiva(lastStudyDate: string | null) {
    return lastStudyDate === diaLocal() || lastStudyDate === diaLocal(-1);
}

const itens: SidebarItem[] = [
    { text: "Início", to: DASHBOARD_ROUTE },
    { text: "Catálogo", to: CATALOGO_ROUTE },
    { text: "Salas", to: SALAS_ROUTE },
    { text: "Ranking", to: RANKING_ROUTE },
    { text: "Amigos", to: AMIGOS_ROUTE },
    { text: "Cadernos", to: NOTEBOOK_ROUTE },
    { text: "Configuração", to: CONFIG_ROUTE },
];

/**
 * Perfil do usuário logado (tabela "profiles").
 * Recarrega quando a sessão muda (login/logout) e quando o Profile salva alterações.
 */
function useUserProfile() {
    const [profile, setProfile] = useState<PerfilUser | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let cancelado = false;

        async function carregarPerfil() {
            try {
                const atual = await usuarioRepository.obterAtual();
                if (cancelado) return;

                setProfile(
                    atual
                        ? {
                              display_name: atual.display_name,
                              username: atual.username,
                              avatar_url: atual.avatar_url,
                              banner_url: atual.banner_url,
                              streak_count: atual.streak_count,
                              last_study_date: atual.last_study_date,
                          }
                        : null,
                );
            } catch (error) {
                console.error("Erro ao buscar perfil:", error);
                if (!cancelado) setProfile(null);
            } finally {
                if (!cancelado) setCarregando(false);
            }
        }

        void carregarPerfil();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            // adiado para não chamar o Supabase dentro do callback de auth
            setTimeout(() => { void carregarPerfil(); }, 0);
        });

        const aoAtualizarPerfil = () => { void carregarPerfil(); };
        window.addEventListener(PROFILE_UPDATED_EVENT, aoAtualizarPerfil);

        return () => {
            cancelado = true;
            subscription.unsubscribe();
            window.removeEventListener(PROFILE_UPDATED_EVENT, aoAtualizarPerfil);
        };
    }, []);

    return { profile, carregando };
}

export function SidebarLeft() {
    const userSrc = useUserProfile();
    const perfil = userSrc.profile;
    const picture = perfil?.avatar_url ?? null;
    const banner = perfil?.banner_url ?? null;
    const temStreakAtiva = Boolean(perfil && perfil.streak_count > 0 && streakAtiva(perfil.last_study_date));
    const streakValor = temStreakAtiva ? perfil?.streak_count ?? 0 : 0;

    return (
        // corpo inteiro da sidebar — fundo e bordas seguem os tokens da plataforma
        <aside className="
            sidebarL
            fixed
            z-10
            w-57.5
            h-screen
            shrink-0
            box-border
            flex
            flex-col
            border-r
            border-line
            bg-canvas
            font-body
            text-ink"
        >
            {/* Cabeçalho: ícone do app + nome "athen" (fonte display, minúsculo) */}
            <section className="border-b border-line px-4 py-5">
                <Link
                    to={DASHBOARD_ROUTE}
                    className="flex items-center gap-3 no-underline transition-opacity hover:opacity-90"
                    aria-label="Ir para o Dashboard"
                >
                    <img src="/Athen.png" alt="" aria-hidden="true" className="h-10 w-10 shrink-0 rounded-[10px] object-cover" />
                    <span className="font-display text-[28px] lowercase leading-none tracking-[2px] text-gold">athen</span>
                </Link>
            </section>

            {/* Navegação principal */}
            <nav className="flex flex-col gap-1 px-4 pt-4 pb-4">
                {itens.map((item) => {
                    const baseItemClass =
                        "flex items-center gap-[12px] w-full px-[12px] py-[10px] border-0 rounded-[10px] text-left text-[16px] cursor-pointer transition-colors";

                    return item.to ? (
                        <NavLink
                            to={item.to}
                            key={item.text}
                            className={({ isActive }) =>
                                `${baseItemClass} ${isActive
                                    ? 'bg-violet/40 font-bold text-ink'
                                    : 'bg-transparent text-muted hover:bg-surface hover:text-ink'
                                }`
                            }
                        >
                            <span>{item.text}</span>
                        </NavLink>
                    ) : (
                        <a
                            href="#"
                            key={item.text}
                            className={`${baseItemClass} bg-transparent text-muted hover:bg-surface hover:text-ink`}
                        >
                            <span>{item.text}</span>
                        </a>
                    );
                })}
            </nav>

            {/* Botão de perfil no rodapé: banner ao fundo da parte superior,
                avatar menor, nome/usuário e a streak com ícone de fogo. */}
            <Link
                to={PROFILE_ROUTE}
                aria-label="Ir para o perfil"
                title="Meu perfil"
                className="group mx-3 mb-4 mt-auto block overflow-hidden rounded-[16px] border border-line bg-surface outline-none transition-colors hover:border-violet-mid focus-visible:ring-2 focus-visible:ring-gold"
            >
                {/* Parte superior: banner de fundo + avatar + streak */}
                <div className="relative h-[64px]">
                    {banner
                        ? <img src={banner} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
                        : <div className="absolute inset-0 bg-gradient-to-br from-violet via-violet-mid/60 to-surface" />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />

                    {/* Streak no canto superior direito */}
                    <span
                        className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-bold ${temStreakAtiva ? "bg-[#1a0f35]/70 text-gold" : "bg-[#1a0f35]/70 text-muted"}`}
                        title={temStreakAtiva ? `Streak de ${streakValor} dia(s)` : "Sem streak ativa"}
                        aria-label={temStreakAtiva ? `Streak ativa de ${streakValor} dias` : "Sem streak ativa"}
                    >
                        <span aria-hidden="true" className={temStreakAtiva ? "" : "grayscale opacity-60"}>🔥</span>
                        {streakValor}
                    </span>

                    {/* Avatar menor, sobreposto na base do banner */}
                    <div className="absolute -bottom-5 left-3 h-12 w-12 overflow-hidden rounded-[14px] border-2 border-surface bg-[#1a0f35]">
                        {picture
                            ? <img src={picture} alt="Foto de perfil" className="h-full w-full object-cover" />
                            : <span className="flex h-full w-full items-center justify-center text-[24px]">🙈</span>
                        }
                    </div>
                </div>

                {/* Parte inferior: nome e usuário */}
                <div className="min-w-0 px-3 pb-3 pl-[72px] pt-2">
                    <span className="block truncate text-[15px] font-bold leading-tight text-ink">
                        {perfil?.display_name ?? (userSrc.carregando ? "..." : "Estudante")}
                    </span>
                    <span className="block truncate text-[12px] leading-tight text-violet-pale">
                        {perfil?.username ? `@${perfil.username}` : ""}
                    </span>
                </div>
            </Link>
        </aside>
    )
}