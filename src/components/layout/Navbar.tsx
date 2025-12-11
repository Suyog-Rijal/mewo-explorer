"use client";
import {Button} from "@/components/ui/button";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUp, BookOpen,
    ChevronDown,
    CirclePlus,
    LaptopMinimal,
    RefreshCw,
    Search,
    X
} from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPath, setCurrentPath] = useState("");


    return (
        <section className={'w-full'}>
            <section className={'flex px-4 py-1 justify-center items-center gap-4 bg-zinc-50'}>
                <div className={' flex justify-center items-center gap-4'}>
                    <Button className={'text-zinc-500 font-normal'}><ArrowLeft size={100} /></Button>
                    <Button className={'text-zinc-500 font-normal'}><ArrowRight /></Button>
                    <Button className={'text-zinc-500 font-normal'}><ArrowUp /></Button>
                    <Button className={'text-zinc-500 font-normal'}><RefreshCw /></Button>
                </div>
                <div className={'flex-1'}>
                    <InputGroup className={'bg-white'}>
                        <InputGroupInput value={currentPath} onChange={(e) => setCurrentPath(e.target.value)} className={'truncate !text-sm'} type="text" placeholder="This PC" />
                        <InputGroupAddon>
                            <LaptopMinimal />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
                <div className={'w-40 lg:w-96'}>
                    <InputGroup className={'bg-white'}>
                        <InputGroupInput className={'truncate !text-sm'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search This PC" />
                        <InputGroupAddon align={'inline-end'}>
                            {
                                searchQuery ? <X className={'cursor-pointer'} onClick={() => setSearchQuery("")} /> : <Search />
                            }
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </section>
            <section className={'flex px-4 py-1 justify-between items-center bg-white border-t border-b border-zinc-200'}>
                <div className={'text-sm'}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className={'gap-1.5 bg-transparent hover:bg-zinc-50'}>
                                <CirclePlus size={10} className={'text-zinc-400'} />
                                <span className={'text-zinc-600'}>New</span>
                                <ChevronDown size={10} className={'text-zinc-400'} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Folder</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                    <Button className={'text-sm bg-transparent hover:bg-zinc-50'}>
                        <BookOpen size={10} className={'text-zinc-400'} />
                        <span>Detail</span>
                    </Button>
                </div>
            </section>
        </section>
    )
}


