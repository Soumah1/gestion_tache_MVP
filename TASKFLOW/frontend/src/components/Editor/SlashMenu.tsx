import React from 'react'

export const SlashMenu: React.FC<{ onSelect: (type: string) => void }> = ({ onSelect }) => {
    const items = [
        { key: 'heading', label: 'Heading' },
        { key: 'paragraph', label: 'Text' },
        { key: 'todo', label: 'To-do' }
    ]
    return (
        <div className="bg-white rounded shadow p-2 w-48">
            {items.map(i => (
                <div key={i.key} className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={() => onSelect(i.key)}>
                    {i.label}
                </div>
            ))}
        </div>
    )
}
