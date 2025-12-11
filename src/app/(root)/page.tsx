"use client";
import Image from "next/image";
import {Progress} from "@/components/ui/progress";
import {useEffect, useState} from "react";
import {DiskInfoResponse} from "@/types/diskInfo";
import {invoke} from "@tauri-apps/api/core";
import Link from "next/link";
import {formatBytes} from "@/utils/formatByte";
import {useRouter} from "next/navigation";
import usePathStore from "@/store/usePathStore";

export default function Home() {
    const [diskInfo, setDiskInfo] = useState<DiskInfoResponse | null>(null);
    const router = useRouter();
    const { setPath } = usePathStore();

    const calculateUsagePercentage = (total: number, available: number) => {
        if (total === 0) return 0;
        const used = total - available;
        return (used / total) * 100;
    };

    useEffect(() => {
        setPath('');
        invoke('list_disk')
            .then((res) => setDiskInfo(res as DiskInfoResponse))
            .catch((err) => console.error(err));
    }, []);

    return (
        <section className={'w-full h-full p-4'}>
            <div className={'w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}>
                {
                    diskInfo && diskInfo?.data?.map((each, index) => (
                        <div onDoubleClick={() => {
                            router.push(`/main?path=${each.mountPoint}`)
                        }} key={index} className={'shadow hover:bg-blue-100 hover:shadow-none transition-all duration-200 select-none pl-1 py-2 pr-2 gap-2 rounded-xs flex justify-center items-center'}>
                            <div>
                                <Image src={each.diskLetter.toLowerCase() == "c" ? "/windows-disk.png" : "/local-disk.png"} alt={''}  height={50} width={50}/>
                            </div>
                            <div className={'flex-1 text-xs space-y-1'}>
                                <p>{each.diskName ? each.diskName : "Local Disk"} ({each.diskLetter}:)</p>
                                <Progress value={calculateUsagePercentage(each.totalSpace, each.availableSpace,)} />
                                <p className={'text-zinc-500'}>{formatBytes(each.availableSpace)} free of {formatBytes(each.totalSpace)}</p>
                            </div>
                        </div>
                    ))
                }
            </div>

        </section>
    );
}
