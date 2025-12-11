import Link from "next/link";
import {ReactNode} from "react";

type SidebarLinkProps = {
    l?: ReactNode | string | null;
    m: ReactNode | string;
    r?: ReactNode | string | null;
    href: string;
    className?: string;
};

export const SidebarLink = ({ l, m, r, href, className }: SidebarLinkProps) => {
    return (
        <Link href={href} className={`flex items-center border border-transparent gap-2 text-xs py-2 px-4 hover:bg-blue-100 transition-colors duration-200 ${className ?? ""}`}>
            {l && <div>{l}</div>}
            <div>{m}</div>
            {r && <div className="ml-auto">{r}</div>}
        </Link>
    );
};
