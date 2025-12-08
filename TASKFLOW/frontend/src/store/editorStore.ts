import create from 'zustand'
import { persist } from 'zustand/middleware'

export type BlockType = 'paragraph' | 'heading' | 'todo'

export type Block = {
  id: string
  type: BlockType
  content: string
  checked?: boolean
}

type EditorState = {
  blocks: Block[]
  selectedId?: string | null
  addBlock: (b: Block, atIndex?: number) => void
  updateBlock: (id: string, patch: Partial<Block>) => void
  removeBlock: (id: string) => void
  moveBlock: (from: number, to: number) => void
  setBlocks: (blocks: Block[]) => void
}

export const useEditorStore = create<EditorState>(
  persist(
    (set, get) => ({
      blocks: [
        { id: 'b1', type: 'heading', content: 'Untitled Document' },
        { id: 'b2', type: 'paragraph', content: 'Start writing... (press / for commands)' }
      ],
      selectedId: null,
      addBlock: (b, atIndex) =>
        set(state => {
          const blocks = [...state.blocks]
          if (typeof atIndex === 'number') blocks.splice(atIndex, 0, b)
          else blocks.push(b)
          return { blocks }
        }),
      updateBlock: (id, patch) =>
        set(state => ({ blocks: state.blocks.map(b => (b.id === id ? { ...b, ...patch } : b)) })),
      removeBlock: id => set(state => ({ blocks: state.blocks.filter(b => b.id !== id) })),
      moveBlock: (from, to) => set(state => {
        const blocks = [...state.blocks]
        const [moved] = blocks.splice(from, 1)
        blocks.splice(to, 0, moved)
        return { blocks }
      }),
      setBlocks: blocks => set({ blocks })
    }),
    {
      name: 'editor-storage-v1'
    }
  )
)
