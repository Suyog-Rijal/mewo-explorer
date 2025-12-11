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
import {useEffect, useState} from "react";
import {SidebarInfoResponse} from "@/types/sidebar";
import { useRouter } from "next/navigation"

export const Sidebar = () => {
    const [sidebar, setSidebar] = useState<SidebarInfoResponse>();
    const router = useRouter();
    useEffect(() => {
        invoke('get_sidebar')
            .then((res) => {
                setSidebar(res as SidebarInfoResponse);
            })
            .catch((err) => {
                console.error("Error fetching sidebar data:", err);
            })
    }, [])

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
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <div>
                                <Image src={'/pc.png'} alt={''} width={16} height={16} className={'inline-block mr-2'}/>
                                This PC
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {
                                sidebar && sidebar?.data?.volume.map((each, index) => (
                                    <SidebarLink key={index} className={'pl-6'} l={<Image src={each.diskLetter.toLowerCase() == "c" ? '/windows-disk.png' : 'local-disk.png'} alt={''} width={20} height={20}/>} m={each.diskName ? each.diskName : "Local Disk"} href={`/main?path=${each.mountPoint}`} />
                                ))
                            }
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </section>
    );
}