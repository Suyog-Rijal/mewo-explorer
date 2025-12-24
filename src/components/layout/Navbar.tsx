"use client";
import {Button} from "@/components/ui/button";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    BookOpen,
    ChevronDown, ChevronRight,
    CirclePlus, ClipboardPaste, Copy, FolderPen,
    LaptopMinimal,
    RefreshCw, Scissors,
    Search,
    X
} from "lucide-react";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group"
import {useState, useEffect, useRef} from "react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import usePathStore from "@/store/usePathStore";
import {useRouter} from "next/navigation";
import {ContextMenuItem} from "@/components/ui/context-menu";
import Image from "next/image";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import useSearchStore from "@/store/useSearchStore";
import { listen } from '@tauri-apps/api/event';
import {AlertMessage} from "@/types/alertMessage";


export const Navbar = () => {
    const router = useRouter();
    const {path, setPath} = usePathStore();
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(path);
    const inputRef = useRef<HTMLInputElement>(null);
    const pathList = path.split("\\").filter(Boolean);
    const {searchKeyword, setSearchKeyword} = useSearchStore();
    let searchRef = useRef<HTMLInputElement>(null);
    const [isIndexing, setIsIndexing] = useState(false);

    useEffect(() => {
        if (isFocused) {
            inputRef.current?.focus();
        }
        if (!isFocused) setInputValue(path);
    }, [path, isFocused]);

    useEffect(() => {
        console.log("Listening for indexing alerts...");
        const unlistenPromise = listen<AlertMessage>('indexAlert', (event) => {
            const { alert_type, message } = event.payload;
            if (alert_type === "info") setIsIndexing(true);
            if (alert_type === "success" || alert_type === "error") setIsIndexing(false);
        });
        return () => {
            unlistenPromise.then((f) => f());
        };
    }, []);

    useEffect(() => {
        handleIndexingAlert();
    }, [isIndexing]);

    const handleIndexingAlert = () => {
        if (isIndexing) {
            if (searchRef.current) {
                searchRef.current.disabled = true;
                setSearchKeyword("");
                searchRef.current.placeholder = "Indexing in progress.....";
            }
        }
        else {
            if (searchRef.current) {
                searchRef.current.disabled = false;
                searchRef.current.placeholder = "Search This PC";
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setPath(inputValue);
            router.push(`/main?path=${encodeURIComponent(inputValue)}`);
            setIsFocused(false);
            inputRef.current?.blur();
        }
    };

    return (
        <section className={'w-full'}>
            <section className={'flex px-4 py-1 justify-center items-center gap-4 bg-zinc-50'}>
                <div className={' flex justify-center items-center gap-4'}>
                    <Button className={'text-zinc-500 font-normal'} onClick={() => {
                        if (path == "") return;
                        router.back();
                    }}><ArrowLeft/></Button>
                    <Button className={'text-zinc-500 font-normal'} onClick={() => {
                        router.forward()
                    }}><ArrowRight/></Button>
                    <Button className={'text-zinc-500 font-normal'}><ArrowUp/></Button>
                    <Button className={'text-zinc-500 font-normal'} onClick={() => {
                        router.push(`/main?path=${encodeURIComponent(path)}&temp=${Date.now()}`);
                    }}><RefreshCw/></Button>
                </div>


                <div className={'flex-1'}>
                    <InputGroup className={'bg-white overflow-hidden'}>
                        {
                            isFocused ? (
                                <InputGroupInput
                                    type="text"
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onBlur={() => setIsFocused(false)}
                                    onKeyDown={handleKeyDown}
                                    className={`truncate text-zinc-800`}
                                />
                            ) : (
                                <div className={'w-full h-full flex justify-center items-center'}>
                                    <div className={'flex space-x-2 text-zinc-500 items-center justify-center'}>
                                        <div className={'ml-3'}><ChevronRight size={18} /></div>
                                        <Button className={'p-1 !h-auto bg-transparent text-zinc-500 hover:bg-zinc-100'} onClick={() => router.push("/")}>This PC</Button>
                                        {pathList?.map((each, index) => (
                                            <div key={index} className={'flex gap-2 items-center justify-center'}>
                                                <div><ChevronRight size={18} /></div>
                                                <Button className={'p-1 !h-auto bg-transparent text-zinc-500 hover:bg-zinc-100'} onClick={() => {
                                                    const newPath = pathList.slice(0, index + 1).join("\\");
                                                    if (newPath.includes(":")) {
                                                        router.push(`/main?path=${encodeURIComponent(newPath + "\\")}`);
                                                    }
                                                }}>{each.includes(":") ? `Drive (${each.split(":")[0]})` : each}</Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={'flex-1 flex h-full'} onClick={() => {
                                        setIsFocused(true);}}></div>
                                </div>
                            )
                        }
                        <InputGroupAddon>
                            <LaptopMinimal/>
                        </InputGroupAddon>
                    </InputGroup>



                </div>
                <div className={'w-40 lg:w-96'}>
                    <InputGroup className={'bg-white'}>
                        <InputGroupInput ref={searchRef} className={'truncate !text-sm'} value={searchKeyword}
                                         onChange={(e) => setSearchKeyword(e.target.value)} type="text"
                                         placeholder="Search This PC"/>
                        <InputGroupAddon align={'inline-end'}>
                            {
                                searchKeyword ? <X className={'cursor-pointer'} onClick={() => setSearchKeyword("")}/> :
                                    <Search/>
                            }
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </section>
            <section
                className={'flex px-4 py-1 justify-between items-center bg-white border-t border-b border-zinc-200'}>
                <div className={'text-sm py-2 flex w-fit justify-center items-center gap-2'}>
                    <DropdownMenu>
                        <Tooltip delayDuration={1000}>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger onContextMenu={(e)=>{
                                    e.preventDefault();
                                }} asChild>
                                    <Button className={'gap-1.5 opacity-50 bg-transparent'}>
                                        <CirclePlus size={10} className={'text-zinc-400'}/>
                                        <span className={'text-zinc-600'}>New</span>
                                        <ChevronDown size={10} className={'text-zinc-400'}/>
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                Still in progress...
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent className={'backdrop-blur-md bg-white/50'}>
                            <DropdownMenuItem disabled>
                                <Image src={'/main/folder.png'} alt={''} width={16} height={16}/>Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Image src={'/main/text.png'} alt={''} width={16} height={16}/>File
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Image src={'/main/ms-word.png'} alt={''} width={16} height={16}/>Word Document
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Image src={'/main/ms-excel.png'} alt={''} width={16} height={16}/>Excel Document
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Image src={'/main/ms-powerpoint.png'} alt={''} width={16} height={16}/>Powerpoint Document
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                    <Button className={'text-sm bg-transparent hover:bg-zinc-50'}>
                        <BookOpen size={10} className={'text-zinc-400'}/>
                        <span>Detail</span>
                    </Button>
                </div>
            </section>
        </section>
    )
}
