import type { CSSProperties, ReactNode } from "react";
import { SidebarLeft } from "../sidebar/SidebarLeft";

/**
 * Largura da SidebarLeft (componente fixo). O conteúdo precisa compensar esse
 * espaço à esquerda. Mantido num único lugar para todas as páginas usarem o
 * mesmo valor, em vez de repetir "pl-[230px]" / "ml-[230px]" / "margin-left:
 * 230px" espalhados por cada página e cada CSS.
 */
export const SIDEBAR_LEFT_WIDTH = 230;

type PageLayoutProps = {
  /** Conteúdo da página (já estilizado pela própria página). */
  children: ReactNode;
  /**
   * Como o <main> trata o conteúdo:
   * - "contained" (padrão): aplica o container utilitário padrão (largura máxima,
   *   padding e centralização) usado pelas páginas escritas em Tailwind.
   * - "bare": não aplica padding nem largura máxima; a própria página cuida do
   *   espaçamento interno pelo seu CSS (Dashboard, Ligas, Salas, Cursos, ...).
   *
   * Em ambos os casos o layout é o único responsável pelo deslocamento da
   * SidebarLeft — as páginas não devem mais aplicar esse offset manualmente.
   */
  variant?: "contained" | "bare";
  /** Classe extra opcional para o elemento raiz. */
  className?: string;
  /** Classe extra opcional para o <main>. */
  mainClassName?: string;
  /** Estilo inline extra opcional para o <main> (ex.: fundo dinâmico). */
  mainStyle?: CSSProperties;
  /**
   * Conteúdo renderizado fora do fluxo do <main> (overlays, modais, painéis
   * laterais como a SidebarRight). Fica dentro da raiz do layout, mas não sofre
   * o padding do conteúdo principal.
   */
  overlay?: ReactNode;
};

/**
 * Casca padrão das páginas internas da plataforma.
 *
 * Centraliza a estrutura que antes cada página reimplementava de um jeito
 * diferente: a SidebarLeft fixa, o deslocamento de {@link SIDEBAR_LEFT_WIDTH}px
 * à esquerda e o <main> ocupando a altura toda da tela. Assim todas as páginas
 * compartilham o mesmo esqueleto, independentemente de usarem CSS próprio
 * ("bare") ou classes utilitárias do Tailwind ("contained") no conteúdo.
 */
export function PageLayout({
  children,
  variant = "contained",
  className,
  mainClassName,
  mainStyle,
  overlay,
}: PageLayoutProps) {
  const bare = variant === "bare";

  return (
    <div className={`relative min-h-svh bg-[#141322] font-body text-[#f4eeff] ${className ?? ""}`.trim()}>
      <SidebarLeft />

      <main
        className={`flex min-h-svh flex-col ${mainClassName ?? ""}`.trim()}
        style={{ paddingLeft: SIDEBAR_LEFT_WIDTH, ...mainStyle }}
      >
        {bare ? (
          children
        ) : (
          <div className="mx-auto w-full max-w-[1320px] px-6 pb-12 pt-8 min-[1440px]:px-10">{children}</div>
        )}
      </main>

      {overlay}
    </div>
  );
}
