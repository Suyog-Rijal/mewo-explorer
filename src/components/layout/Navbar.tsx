"use client";
import {Button} from "@/components/ui/button";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    BookOpen,
    ChevronDown,
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

export const Navbar = () => {
    const router = useRouter();
    const {path, setPath} = usePathStore();
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(path);
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);


    const prettyPath = "   >   This PC   >   " + path.replace(/\\/g, "   >   ") + "   ";

    useEffect(() => {
        if (!isFocused) setInputValue(path);
    }, [path, isFocused]);

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
                    <InputGroup className={'bg-white'}>
                        <InputGroupInput
                            type="text"
                            ref={inputRef}
                            value={isFocused ? inputValue : prettyPath}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={handleKeyDown}
                            className={`truncate ${isFocused ? "text-zinc-800" : "text-zinc-500"}`}
                            placeholder="This PC"
                        />
                        <InputGroupAddon>
                            <LaptopMinimal/>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
                <div className={'w-40 lg:w-96'}>
                    <InputGroup className={'bg-white'}>
                        <InputGroupInput className={'truncate !text-sm'} value={searchQuery}
                                         onChange={(e) => setSearchQuery(e.target.value)} type="text"
                                         placeholder="Search This PC"/>
                        <InputGroupAddon align={'inline-end'}>
                            {
                                searchQuery ? <X className={'cursor-pointer'} onClick={() => setSearchQuery("")}/> :
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
