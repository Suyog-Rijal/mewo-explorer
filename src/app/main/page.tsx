"use client"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {Button} from "@/components/ui/button";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import usePathStore from "@/store/usePathStore";
import {invoke} from "@tauri-apps/api/core";
import {ListEntriesResponse} from "@/types/listEntries";
import {formatBytes} from "@/utils/formatByte";
import Image from "next/image";

const get_icon = (fileType: string) => {
    if (fileType.toLowerCase().includes('directory')) return "/main/folder.png";
    if (fileType.toLowerCase().includes('py')) return "/main/python.png";
    if (fileType.toLowerCase().includes('txt')) return "/main/text.png";
    if (fileType.toLowerCase().includes('js')) return "/main/javascript.png";
    if (fileType.toLowerCase().includes('html')) return "/main/html.png";
    if (['zip', 'tar', 'gz'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/zip-folder.png";
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/image.png";
    if (['mp4', 'mkv', 'avi', 'mov'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/video.png";
}

export default function Main() {
    const searchParams = useSearchParams()
    const [entries, setEntries] = useState<ListEntriesResponse>()
    const newPath = searchParams.get('path')
    const {path, setPath} = usePathStore();
    const router = useRouter();

    useEffect(() => {
        if (newPath != null) {
            setPath(newPath)
        }
    }, [newPath]);

    useEffect(() => {
        invoke('list_entries', {path: path})
            .then((res) => {
                const data = (res as ListEntriesResponse).data;
                if (data) {
                    const sorted = data.sort((a, b) => {
                        if (a.isDir && !b.isDir) return -1;
                        if (!a.isDir && b.isDir) return 1;
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    setEntries({ ...(res as ListEntriesResponse), data: sorted });
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }, [path]);

    return (
        <section className={'w-full h-full'}>
            <div className={'w-full grid grid-cols-12 px-4 py-1'}>
                <div className={'col-span-10 grid grid-cols-10 text-sm'}>
                    <Button
                        className={'hover:bg-transparent bg-transparent text-zinc-500 justify-start px-4 rounded-none col-span-4'}>Name</Button>
                    <Button
                        className={'hover:bg-transparent bg-transparent text-zinc-500 justify-start px-4 rounded-none col-span-2'}>Date
                        modified</Button>
                    <Button
                        className={'hover:bg-transparent bg-transparent text-zinc-500 justify-start px-4 rounded-none col-span-2'}>Type</Button>
                    <Button
                        className={'hover:bg-transparent bg-transparent text-zinc-500 justify-start px-4 rounded-none col-span-2'}>Size</Button>
                </div>
            </div>
            <div className={'h-full w-full relative z-0'}>
                <ContextMenu>
                    <ContextMenuTrigger className={'w-full h-full absolute z-0'}
                                        onContextMenu={(e) => e.stopPropagation()}>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>Parent</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
                <div className={'w-full grid grid-cols-12'}>
                    <div className={'grid grid-cols-10 col-span-10 pl-4 pr-3 text-sm gap-1.5'}>
                        {
                            entries && entries?.data?.map((each, index) => (
                                <ContextMenu key={index}>
                                    <ContextMenuTrigger className={'col-span-10 h-fit z-10'}
                                                        onContextMenu={(e) => e.stopPropagation()}>
                                        <div onClick={() => {
                                            if (each.isDir) {
                                                router.push(`/main?path=${encodeURIComponent(each.path)}`)
                                            }
                                        }}
                                             className={'col-span-10 grid grid-cols-10 hover:bg-blue-100 cursor-pointer select-none'}>
                                            <p className={'col-span-4 py-1 px-4 flex justify-start gap-1 items-center'}>
                                                <Image src={get_icon(each.contentType) || "/main/empty.png"} alt={''} width={18} height={18} />
                                                <span>{each.name}</span>
                                            </p>
                                            <p className={'col-span-2 py-1 px-4'}>{each.modified}</p>
                                            <p className={'col-span-2 py-1 px-4'}>{each.contentType}</p>
                                            <p className={'col-span-2 py-1 px-4'}>{each.size ? formatBytes(each.size) : null}</p>
                                        </div>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                        <ContextMenuItem>Entries</ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}