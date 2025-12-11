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
    if (['docs', 'docx', 'odt'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/ms-word.png";
    if (['ppt', 'pptx', 'odp'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/ms-powerpoint.png";
    if (['xls', 'xlsx', 'ods'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/ms-excel.png";
    if (['zip', 'tar', 'gz'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/zip-folder.png";
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/image.png";
    if (['mp4', 'mkv', 'avi', 'mov'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/video.png";
    if (['mp3', 'wav', 'flac'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/audio.png";
}


export default function Main() {
    const searchParams = useSearchParams()
    const [entries, setEntries] = useState<ListEntriesResponse>()
    const newPath = searchParams.get('path')
    const temp = searchParams.get('temp')
    const {path, setPath} = usePathStore();
    const router = useRouter();
    const [activePath, setActivePath] = useState<string | null>(null);

    useEffect(() => {
        if (newPath != null) {
            setPath(newPath)
        }
    }, [newPath]);

    useEffect(() => {
        invoke('list_entries', {path})
            .then((res) => {
                const response = res as ListEntriesResponse;
                if (!response || response.code === 500) {
                    setEntries(undefined);
                    return;
                }

                if (response.code === 200 && response.data != null) {
                    const sorted = response.data.sort((a, b) => {
                        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    setEntries({...response, data: sorted});
                } else {
                    setEntries({...response, data: []});
                }
            })
            .catch(console.log);
    }, [path, temp]);


    return (
        <section className={'w-full h-full flex flex-col'}>

            <div className={'w-full grid grid-cols-12 px-4'}>
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


            <div className={'w-full h-full overflow-y-scroll scrollbar-thin py-2 relative z-0'}>
                <ContextMenu>
                    <ContextMenuTrigger className={'w-full h-full absolute z-0'}
                                        onContextMenu={(e) => e.stopPropagation()}>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>Refresh</ContextMenuItem>
                        <ContextMenuItem>New</ContextMenuItem>
                        <ContextMenuItem>Properties</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
                <div className={'w-full grid grid-cols-12'}>
                    <div className="grid grid-cols-10 col-span-10 pl-4 pr-3 text-sm gap-1.50">
                        {!entries?.data ? (
                            <div className="col-span-10 py-4 justify-center items-center flex">
                                The path doesn't exist
                            </div>
                        ) : entries.data.length === 0 ? (
                            <div className="col-span-10 py-4 justify-center items-center flex">
                                The folder is empty
                            </div>
                        ) : (
                            entries.data.map((each, index) => (
                                <ContextMenu key={index}>
                                    <ContextMenuTrigger
                                        className="col-span-10 h-fit z-10 text-xs"
                                        onContextMenu={(e) => e.stopPropagation()}>
                                        <div
                                            onClick={() => setActivePath(each.path)}
                                            onDoubleClick={() => {
                                                if (each.isDir) {
                                                    router.push(`/main?path=${encodeURIComponent(each.path)}`);
                                                }
                                            }}
                                            className={`col-span-10 grid grid-cols-10 border hover:bg-blue-100 cursor-pointer select-none ${
                                                each.isHidden ? "opacity-50" : ""
                                            } ${
                                                activePath === each.path
                                                    ? "border-zinc-300 bg-blue-50"
                                                    : "border-transparent"
                                            }`}>
                                            <p className="col-span-4 py-0.5 px-4 flex justify-start gap-1 items-center">
                                                <Image
                                                    src={get_icon(each.contentType) || "/main/empty.png"}
                                                    alt=""
                                                    width={18}
                                                    height={18}
                                                />
                                                <span className="truncate">{each.name}</span>
                                            </p>
                                            <p className="col-span-2 py-1 px-4">{each.modified}</p>
                                            <p className="col-span-2 py-1 px-4">{each.contentType}</p>
                                            <p className="col-span-2 py-1 px-4">
                                                {each.size ? formatBytes(each.size) : null}
                                            </p>
                                        </div>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                        <ContextMenuItem>Entries</ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        )}
                    </div>

                </div>
            </div>


            <div className={'w-full py-1 justify-between'}>
                <p className={'text-xs px-4'}>13 items</p>
            </div>
        </section>
    )
}


// {

// }