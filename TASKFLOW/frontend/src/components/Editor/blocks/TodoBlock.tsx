import React from 'react'
import { Block } from '../../../store/editorStore'
import { useEditorStore } from '../../../store/editorStore'

const TodoBlock: React.FC<{ block: Block }> = ({ block }) => {
  const update = useEditorStore(s => s.updateBlock)
  return (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={!!block.checked}
        onChange={e => update(block.id, { checked: e.target.checked })}
        className="w-4 h-4"
      />
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={e => update(block.id, { content: (e.target as HTMLDivElement).innerText })}
        className="outline-none"
      >
        {block.content}
      </div>
    </label>
  )
}

export default TodoBlock
