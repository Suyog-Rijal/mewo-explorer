"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FileData {
    id: string
    name: string
    dateModified: string
    type: string
    size: string
}

const sampleData: FileData[] = [
    {
        id: "1",
        name: "Project Proposal.pdf",
        dateModified: "Dec 10, 2024",
        type: "PDF",
        size: "2.4 MB",
    },
    {
        id: "2",
        name: "Quarterly Report.xlsx",
        dateModified: "Dec 8, 2024",
        type: "Spreadsheet",
        size: "1.2 MB",
    },
    {
        id: "3",
        name: "Design System.figma",
        dateModified: "Dec 5, 2024",
        type: "Design",
        size: "8.7 MB",
    },
    {
        id: "4",
        name: "Meeting Notes.docx",
        dateModified: "Dec 3, 2024",
        type: "Document",
        size: "456 KB",
    },
    {
        id: "5",
        name: "Budget 2025.xlsx",
        dateModified: "Nov 28, 2024",
        type: "Spreadsheet",
        size: "892 KB",
    },
    {
        id: "6",
        name: "Brand Guidelines.pdf",
        dateModified: "Nov 15, 2024",
        type: "PDF",
        size: "5.1 MB",
    },
]

export function DataTable() {
    const [columnWidths, setColumnWidths] = useState({
        name: 200,
        dateModified: 150,
        type: 120,
        size: 100,
    })

    const [resizing, setResizing] = useState<string | null>(null)
    const [startX, setStartX] = useState(0)

    const handleMouseDown = (e: React.MouseEvent, column: string) => {
        setResizing(column)
        setStartX(e.clientX)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!resizing) return

        const delta = e.clientX - startX
        setColumnWidths((prev) => ({
            ...prev,
            [resizing]: Math.max(80, prev[resizing as keyof typeof prev] + delta),
        }))
        setStartX(e.clientX)
    }

    const handleMouseUp = () => {
        setResizing(null)
    }

    return (
        <div
            className="rounded-xs overflow-x-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}>
            <Table>
                <TableHeader className={'hover:bg-none'}>
                    <TableRow>
                        <TableHead
                            className="relative text-foreground font-normal group select-none"
                            style={{ width: `${columnWidths.name}px`, minWidth: `${columnWidths.name}px` }}>
                            <div className="flex text-zinc-400 items-center text-sm justify-between pr-2">
                                <span>Name</span>
                                <div
                                    className="w-1 h-5 bg-border hover:bg-zinc-300 cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => handleMouseDown(e, "name")}
                                />
                            </div>
                        </TableHead>
                        <TableHead
                            className="relative font-normal text-foreground group select-none"
                            style={{ width: `${columnWidths.dateModified}px`, minWidth: `${columnWidths.dateModified}px` }}
                        >
                            <div className="flex text-zinc-400 items-center justify-between text-sm pr-2">
                                <span>Date Modified</span>
                                <div
                                    className="w-1 h-5 bg-border hover:bg-zinc-300 cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => handleMouseDown(e, "dateModified")}
                                />
                            </div>
                        </TableHead>
                        <TableHead
                            className="relative font-normal text-foreground group select-none"
                            style={{ width: `${columnWidths.type}px`, minWidth: `${columnWidths.type}px` }}
                        >
                            <div className="flex text-zinc-400 items-center justify-between text-sm pr-2">
                                <span>Type</span>
                                <div
                                    className="w-1 h-5 bg-border hover:bg-zinc-300 cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => handleMouseDown(e, "type")}
                                />
                            </div>
                        </TableHead>
                        <TableHead
                            className="relative font-normal text-foreground group select-none"
                            style={{ width: `${columnWidths.size}px`, minWidth: `${columnWidths.size}px` }}>
                            <div className="flex text-zinc-400 items-center text-sm justify-between pr-2">
                                <span>Size</span>
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sampleData.map((file) => (
                        <TableRow key={file.id} className="hover:bg-blue-100 cursor-pointer transition-colors">
                            <TableCell
                                className="font-normal"
                                style={{ width: `${columnWidths.name}px`, minWidth: `${columnWidths.name}px` }}
                            >
                                {file.name}
                            </TableCell>
                            <TableCell
                                className="text-muted-foreground"
                                style={{ width: `${columnWidths.dateModified}px`, minWidth: `${columnWidths.dateModified}px` }}
                            >
                                {file.dateModified}
                            </TableCell>
                            <TableCell
                                className="text-muted-foreground"
                                style={{ width: `${columnWidths.type}px`, minWidth: `${columnWidths.type}px` }}
                            >
                                {file.type}
                            </TableCell>
                            <TableCell
                                className="text-right text-muted-foreground"
                                style={{ width: `${columnWidths.size}px`, minWidth: `${columnWidths.size}px` }}
                            >
                                {file.size}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
