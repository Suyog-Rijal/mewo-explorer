"use client";
import Image from "next/image";
import {SidebarLink} from "@/components/custom/SidebarLink";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {invoke} from "@tauri-apps/api/core";
import {useEffect, useRef, useState} from "react";
import {SidebarInfoResponse} from "@/types/sidebar";
import { useRouter } from "next/navigation"

export const Sidebar = () => {
    const [sidebar, setSidebar] = useState<SidebarInfoResponse>();
    const [accordionValue, setAccordionValue] = useState<string>("item-1");
    const router = useRouter();
    const clickTimer = useRef<number | null>(null);


    useEffect(() => {
        invoke('get_sidebar')
            .then((res) => {
                setSidebar(res as SidebarInfoResponse);
            })
            .catch((err) => {
                console.error("Error fetching sidebar data:", err);
            })
    }, [])

    const handleAccordionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (clickTimer.current) clearTimeout(clickTimer.current);
        clickTimer.current = window.setTimeout(() => {
            router.push("/");
        }, 250);
    };

    const handleAccordionDoubleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (clickTimer.current) clearTimeout(clickTimer.current);
        setAccordionValue((prev) => (prev === "item-1" ? "" : "item-1"));
    };

    return (
        <section className={'py-1'}>
            <section>
                <div>
                    {
                        sidebar && sidebar?.data?.default.map((each, index) => (
                            <SidebarLink key={index} l={<Image src={each.icon} alt={''} width={16} height={16}/>} m={each.name} href={`/main?path=${each.path}`} />
                        ))
                    }
                </div>
            </section>

            <div className={'border border-zinc-200/60 mx-4 my-4'}></div>

            <section>
                <Accordion type="single" defaultValue={'item-1'} collapsible value={accordionValue} onValueChange={setAccordionValue}>
                    <AccordionItem value="item-1">
                        <AccordionTrigger
                            onClick={handleAccordionClick}
                            onDoubleClick={handleAccordionDoubleClick}>
                            <div className={'text-xs'}>
                                <Image src={'/pc.png'} alt={''} width={16} height={16} className={'inline-block mr-2'}/>
                                This PC
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {
                                sidebar && sidebar?.data?.volume.map((each, index) => (
                                    <SidebarLink key={index} className={'pl-6'} l={<Image src={each.diskLetter.toLowerCase() == "c" ? '/windows-disk.png' : '/local-disk.png'} alt={''} width={20} height={20}/>} m={`${each.diskName ? each.diskName : `Local Disk`} (${each.diskLetter}:)`} href={`/main?path=${each.mountPoint}`} />
                                ))
                            }
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </section>
    );
}