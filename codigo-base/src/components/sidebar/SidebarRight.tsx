import { useEffect, useRef } from 'react';
import { DatabaseNotConnected } from '../layout/DatabaseNotConnected';

const rebarba = 28;

type SidebarRightProps = {
    aberta: boolean;
    onFechar: () => void;
    /** Cor do módulo ativo. Mantida para um leve destaque na aba, sem brilho neon. */
    cor: string;
}

export function SidebarRight({ aberta, onFechar, cor }: SidebarRightProps) {
    const painelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!aberta) return;

        function cliqueFora(evento: MouseEvent) {
            const alvo = evento.target;

            if (!(alvo instanceof Element)) return;
            if (painelRef.current?.contains(alvo)) return;

            onFechar();
        }

        document.addEventListener("mousedown", cliqueFora);
        return () => {document.removeEventListener("mousedown", cliqueFora)};
    }, [aberta, onFechar]);

    return (
        // janela inteira da sidebar
        <div ref={painelRef} className="
            fixed
            top-0
            right-[24px]
            z-20
            w-[300px]
            flex
            flex-col
            items-center
            transition-transform
            duration-320ms
            ease-in-out"
        style={{transform: aberta ? "translateY(0)" : `translateY(calc(-100% + ${rebarba}px))`}}
        >
            {/* caixa da top down — fundo e borda seguem os tokens da plataforma */}
            <aside className="
                relative
                box-border
                max-h-[80vh]
                flex
                flex-col
                gap-3
                p-4
                w-full
                overflow-y-auto
                rounded-b-[20px]
                border
                border-t-0
                border-line
                bg-surface
                shadow-xl
                shadow-black/40"
            >
                <h3 className="
                    m-0
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-muted"
                >
                    Painel
                </h3>

                <DatabaseNotConnected recurso="o ranking de amigos e as quests" />
            </aside>

            {/* rebarba da janela TopDown — aba para abrir/fechar */}
            <button
              type="button"
              onClick={onFechar}
              aria-expanded={aberta}
              aria-label={aberta ? "Recolher painel" : "Abrir painel"}
              className="
                group
                w-[88px]
                flex
                flex-none
                items-center
                justify-center
                rounded-b-[12px]
                border
                border-t-0
                border-line
                bg-surface
                cursor-pointer
                transition-colors
                duration-200
                hover:bg-[#241640]"
              style={{ height: rebarba }}
            >
                <span
                  className="h-[3px] w-7 rounded-full bg-violet-mid transition-all duration-200 group-hover:w-10"
                  style={{ backgroundColor: cor }}
                />
            </button>
        </div>
    )
}
