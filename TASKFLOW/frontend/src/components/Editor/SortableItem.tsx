import React from 'react'
import { Block } from '../../store/editorStore'
import TextBlock from './blocks/TextBlock'
import HeadingBlock from './blocks/HeadingBlock'
import TodoBlock from './blocks/TodoBlock'

const SortableItem: React.FC<{ block: Block; index: number }> = ({ block }) => {
    return (
        <div className="p-3 bg-white rounded shadow-sm">
            {block.type === 'heading' && <HeadingBlock block={block} />}
            {block.type === 'paragraph' && <TextBlock block={block} />}
            {block.type === 'todo' && <TodoBlock block={block} />}
        </div>
    )
}

export default SortableItem
