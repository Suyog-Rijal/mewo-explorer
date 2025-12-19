"use client";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
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
import {
    BookOpen,
    CirclePlus,
    ClipboardPaste,
    Copy,
    FolderPen,
    Pin,
    RefreshCw,
    Scissors,
    Terminal,
    Trash2,
    Wrench
} from "lucide-react";
import {create_directory, create_file} from "@/utils/createNew";
import {open_in_terminal} from "@/utils/openInTerminal";
import {delete_entry} from "@/utils/deleteEntry";
import useSearchStore from "@/store/useSearchStore";

const get_icon = (fileType: string) => {
    if (fileType.toLowerCase().includes('directory')) return "/main/folder.png";
    if (fileType.toLowerCase().includes('py')) return "/main/python.png";
    if (fileType.toLowerCase().includes('txt')) return "/main/text.png";
    if (fileType.toLowerCase().includes('js')) return "/main/javascript.png";
    if (fileType.toLowerCase().includes('html')) return "/main/html.png";
    if (fileType.toLowerCase().includes('exe')) return "/main/exe.png";
    if (fileType.toLowerCase().includes('pdf')) return "/main/pdf.png";
    if (['docs', 'docx', 'odt'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/ms-word.png";
    if (['ppt', 'pptx', 'odp'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/ms-powerpoint.png";
    if (['xls', 'xlsx', 'ods'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/ms-excel.png";
    if (['zip', 'tar', 'gz'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/zip-folder.png";
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/image.png";
    if (['mp4', 'mkv', 'avi', 'mov'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/video.png";
    if (['mp3', 'wav', 'flac'].some(ext => fileType.toLowerCase().includes(ext))) return "/main/audio.png";
}

export const MainComponent = () => {
    const searchParams = useSearchParams()
    const [entries, setEntries] = useState<ListEntriesResponse>()
    const newPath = searchParams.get('path')
    const temp = searchParams.get('temp')
    const {path, setPath} = usePathStore();
    const router = useRouter();
    const [activePath, setActivePath] = useState<string | null>(null);
    const {searchKeyword} = useSearchStore();
    const [newItem, setNewItem] = useState<{
        type: 'dir' | 'file' | 'word' | 'excel' | 'ppt';
        dummyName: string;
        ext?: string
    } | null>(null);

    useEffect(() => {
        if (newPath != null) setPath(newPath)
    }, [newPath]);

    useEffect(() => {
        invoke('list_entries', {path})
            .then((res) => {
                const response = res as ListEntriesResponse;
                if (!response || response.code === 500) return setEntries(undefined);
                if (response.code == 204) router.back();
                if (response.code === 200 && response.data != null) {
                    const sorted = response.data.sort((a, b) => {
                        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    setEntries({...response, data: sorted});
                } else setEntries({...response, data: []});
            })
            .catch(console.log);
    }, [path, temp]);

    useEffect(() => {
        if (searchKeyword.trim() === '') {
            invoke('list_entries', {path})
                .then((res) => {
                    const response = res as ListEntriesResponse;
                    if (!response || response.code === 500) return setEntries(undefined);
                    if (response.code == 204) router.back();
                    if (response.code === 200 && response.data != null) {
                        const sorted = response.data.sort((a, b) => {
                            if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        });
                        setEntries({...response, data: sorted});
                    } else setEntries({...response, data: []});
                })
                .catch(console.log);
            return;
        }

        // invoke('search', {path: path, keyword: searchKeyword.trim()})

    }, [searchKeyword]);

    const open_file = (filePath: string) => {
        invoke('open_file', {path: filePath}).catch((err) => console.error('Error opening file:', err));
    }

    const open_with = (path: string) =>{
        invoke('open_with', {path: path})
            .catch((err) => console.error('Error opening with dialog:', err));
    }

    const copy_to_clipboard = (path: string) => {
        navigator.clipboard.writeText(path)
            .catch(err => console.error("Clipboard error:", err));
    }

    const finishCreation = (name: string) => {
        if (!name.trim()) return setNewItem(null);
        const fileName = newItem!.ext ? `${name}.${newItem!.ext}` : name;
        if (newItem!.type === 'dir') create_directory(path, name);
        else create_file(path, fileName);
        setNewItem(null);
        router.push("/main?path=" + encodeURIComponent(path) + "&temp=" + Date.now());
    }

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
                                        onContextMenu={(e) => e.stopPropagation()}></ContextMenuTrigger>
                    <ContextMenuContent className={'w-56'}>
                        <ContextMenuItem
                            onClick={() => router.push(`/main?path=${encodeURIComponent(path)}&temp=${Date.now()}`)}><RefreshCw/> Refresh</ContextMenuItem>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger className={'gap-2'}><CirclePlus/> New</ContextMenuSubTrigger>
                            <ContextMenuSubContent className={'w-56'}>
                                <ContextMenuItem onClick={() => setNewItem({type: 'dir', dummyName: ''})}><Image
                                    src={'/main/folder.png'} alt={''} width={16} height={16}/>Folder</ContextMenuItem>
                                <ContextMenuItem onClick={() => setNewItem({type: 'file', dummyName: ''})}><Image
                                    src={'/main/text.png'} alt={''} width={16} height={16}/>File</ContextMenuItem>
                                <ContextMenuItem onClick={() => setNewItem({type: 'word', dummyName: '', ext: 'docx'})}><Image
                                    src={'/main/ms-word.png'} alt={''} width={16} height={16}/>Word
                                    Document</ContextMenuItem>
                                <ContextMenuItem
                                    onClick={() => setNewItem({type: 'excel', dummyName: '', ext: 'xlsx'})}><Image
                                    src={'/main/ms-excel.png'} alt={''} width={16} height={16}/>Excel
                                    Document</ContextMenuItem>
                                <ContextMenuItem
                                    onClick={() => setNewItem({type: 'ppt', dummyName: '', ext: 'pptx'})}><Image
                                    src={'/main/ms-powerpoint.png'} alt={''} width={16} height={16}/>Powerpoint Document</ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuItem>
                            <ClipboardPaste className={'text-blue-600/70'} /> Paste
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => open_in_terminal(path)}><Terminal
                            className={'text-white bg-zinc-700'}/> Open in Terminal</ContextMenuItem>
                        <ContextMenuItem><Wrench/> Properties</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

                <div className={'w-full grid grid-cols-12'}>
                    <div className="grid grid-cols-10 col-span-10 pl-4 pr-3 text-sm gap-1.5">
                        {newItem && (
                            <div className="col-span-10 grid grid-cols-10 border border-blue-400 bg-blue-50">
                                <p className="col-span-4 py-0.5 px-4 flex justify-start gap-1 items-center">
                                    <Image
                                        src={newItem.type === 'dir' ? '/main/folder.png' : newItem.type === 'word' ? '/main/ms-word.png' : newItem.type === 'excel' ? '/main/ms-excel.png' : newItem.type === 'ppt' ? '/main/ms-powerpoint.png' : '/main/text.png'}
                                        alt="" width={18} height={18}/>
                                    <input autoFocus className="bg-transparent outline-none px-1 flex-1" defaultValue=""
                                           onBlur={(e) => finishCreation(e.target.value)} onKeyDown={(e) => {
                                        if (e.key === 'Enter') finishCreation(e.currentTarget.value);
                                        if (e.key === 'Escape') setNewItem(null);
                                    }}/>
                                </p>
                                <p className="col-span-2 py-1 px-4">—</p>
                                <p className="col-span-2 py-1 px-4">{newItem.type === 'dir' ? 'Directory' : newItem.type === 'word' ? 'Word Document' : newItem.type === 'excel' ? 'Excel Document' : newItem.type === 'ppt' ? 'Powerpoint Document' : 'File'}</p>
                                <p className="col-span-2 py-1 px-4">0 B</p>
                            </div>
                        )}
                        {!entries?.data ? (
                            <div className="col-span-10 py-4 justify-center items-center flex">The path doesn't
                                exist</div>
                        ) : entries.data.length === 0 && !newItem ? (
                            <div className="col-span-10 py-4 justify-center items-center flex">The folder is empty</div>
                        ) : (
                            entries.data.map((each, index) => (
                                <ContextMenu key={index}>
                                    <ContextMenuTrigger className="col-span-10 h-fit z-10 text-xs"
                                                        onContextMenu={(e) => e.stopPropagation()}>
                                        <div onContextMenu={() => setActivePath(each.path)}
                                             onClick={() => setActivePath(each.path)} onDoubleClick={() => {
                                            if (each.isDir) router.push(`/main?path=${encodeURIComponent(each.path)}`); else if (each.isFile) open_file(each.path);
                                        }}
                                             className={`col-span-10 grid grid-cols-10 border hover:bg-blue-100 cursor-pointer select-none ${each.isHidden ? "opacity-50" : ""} ${activePath === each.path ? "border-zinc-300 bg-blue-50" : "border-transparent"}`}>
                                            <p className="col-span-4 py-0.5 px-4 flex justify-start gap-1 items-center">
                                                <Image src={get_icon(each.contentType) || "/main/empty.png"} alt=""
                                                       width={18} height={18}/>
                                                <span className="truncate">{each.name}</span>
                                            </p>
                                            <p className="col-span-2 py-1 px-4">{each.modified}</p>
                                            <p className="col-span-2 py-1 px-4">{each.contentType}</p>
                                            <p className="col-span-2 py-1 px-4">{each.size ? formatBytes(each.size) : null}</p>
                                        </div>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className={'w-72'}>
                                        <ContextMenuItem className={'focus:bg-transparent grid gap-2 grid-cols-4'}>
                                            <Button
                                                className={'flex justify-center px-2 py-6 gap-1 items-center flex-col w-full hover:bg-zinc-100 bg-transparent'}>
                                                <Scissors className={'text-blue-800/70'}/>
                                                <span className={'text-xs'}>Cut</span>
                                            </Button>
                                            <Button
                                                className={'flex justify-center px-2 py-6 gap-1 items-center flex-col w-full hover:bg-zinc-100 bg-transparent'}>
                                                <Copy className={'text-blue-800/70'}/>
                                                <span className={'text-xs'}>Copy</span>
                                            </Button>
                                            {
                                                each.isDir ? <Button
                                                    className={'flex justify-center px-2 py-6 gap-1 items-center flex-col w-full hover:bg-zinc-100 bg-transparent'}>
                                                    <ClipboardPaste className={'text-blue-800/70'}/>
                                                    <span className={'text-xs'}>Paste</span>
                                                </Button> : null
                                            }
                                            <Button
                                                className={'flex justify-center px-2 py-6 gap-1 items-center flex-col w-full hover:bg-zinc-100 bg-transparent'}>
                                                <FolderPen className={'text-blue-800/70'}/>
                                                <span className={'text-xs'}>Rename</span>
                                            </Button>
                                        </ContextMenuItem>
                                        <ContextMenuItem onClick={() => {
                                            if (each.isDir) router.push(`/main?path=${encodeURIComponent(each.path)}`); else if (each.isFile) open_file(each.path);
                                        }}>
                                            <Image src={get_icon(each.contentType) || "/main/empty.png"} alt=""
                                                   width={18} height={18}/>
                                            Open
                                        </ContextMenuItem>
                                        {
                                            each.isFile ? <ContextMenuItem onClick={() => {open_with(each.path)}}>
                                                <BookOpen />
                                                Open with...
                                            </ContextMenuItem> : null
                                        }
                                        <ContextMenuItem onClick={() => copy_to_clipboard(each.path)}>
                                            <Copy/>
                                            Copy as path
                                        </ContextMenuItem>
                                        <ContextMenuItem>
                                            <Pin className={'text-blue-500'}/>
                                            Pin to Quick access
                                        </ContextMenuItem>
                                        <ContextMenuItem onClick={() => {
                                            delete_entry(each.path);
                                            router.push("/main?path=" + encodeURIComponent(path) + "&temp=" + Date.now());
                                        }}>
                                            <Trash2 className={'text-red-500'}/>
                                            Delete
                                        </ContextMenuItem>
                                        {
                                            each.isDir ? <ContextMenuItem onClick={() => open_in_terminal(each.path)}>
                                                <Terminal className={'bg-zinc-700 text-white'}/>
                                                Open in Terminal
                                            </ContextMenuItem> : null
                                        }
                                        <ContextMenuItem>
                                            <Wrench/>
                                            Properties
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className={'w-full py-1 justify-between'}>
                <p className={'text-xs px-4'}>{(entries?.data?.length || 0) + (newItem ? 1 : 0)} items</p>
            </div>
        </section>
    )
}