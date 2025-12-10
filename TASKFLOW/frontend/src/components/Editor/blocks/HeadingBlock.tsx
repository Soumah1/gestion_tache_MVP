import React from 'react'
import { Block } from '../../../store/editorStore'
import { useEditorStore } from '../../../store/editorStore'

const HeadingBlock: React.FC<{ block: Block }> = ({ block }) => {
  const update = useEditorStore(s => s.updateBlock)
  return (
    <h2
      contentEditable
      suppressContentEditableWarning
      onInput={e => update(block.id, { content: (e.target as HTMLHeadingElement).innerText })}
      className="text-2xl font-semibold outline-none"
    >
      {block.content}
    </h2>
  )
}

export default HeadingBlock
