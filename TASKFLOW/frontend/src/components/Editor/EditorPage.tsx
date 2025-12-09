
import React, { useEffect, useRef, useState } from 'react'
import { useEditorStore, Block } from '../../store/editorStore'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from 'uuid'
import SortableItem from './SortableItem'
import { SlashMenu } from './SlashMenu'
import { StickyToolbar } from './StickyToolbar'
import { motion, AnimatePresence } from 'framer-motion'

export default function EditorPage() {
    const blocks = useEditorStore(s => s.blocks)
    const addBlock = useEditorStore(s => s.addBlock)
    const updateBlock = useEditorStore(s => s.updateBlock)
    const moveBlock = useEditorStore(s => s.moveBlock)
    const setBlocks = useEditorStore(s => s.setBlocks)

    const onDragEnd = (e: any) => {
        const { active, over } = e
        if (active && over && active.id !== over.id) {
            const oldIndex = blocks.findIndex(b => b.id === active.id)
            const newIndex = blocks.findIndex(b => b.id === over.id)
            setBlocks(arrayMove(blocks, oldIndex, newIndex))
        }
    }

    useEffect(() => {
        // create an initial empty block if empty
        if (blocks.length === 0) {
            addBlock({ id: uuidv4(), type: 'paragraph', content: '' })
        }
    }, [])

    return (
        <div className="max-w-3xl mx-auto py-8">
            <StickyToolbar />

            <div className="space-y-3">
                <AnimatePresence>
                    {blocks.map((b, i) => (
                        <motion.div
                            key={b.id}
                            layout
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            draggable
                            onDragStart={(e: any) => e.dataTransfer.setData('text/plain', String(i))}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                                const from = Number(e.dataTransfer.getData('text/plain'))
                                const to = i
                                if (!Number.isNaN(from)) moveBlock(from, to)
                            }}
                        >
                            <SortableItem block={b} index={i} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-6">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => addBlock({ id: uuidv4(), type: 'paragraph', content: '' })}
                >
                    + Add block
                </button>
            </div>
        </div>
    )
}
