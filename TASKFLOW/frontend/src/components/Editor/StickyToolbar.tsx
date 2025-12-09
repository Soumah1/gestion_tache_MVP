import React from 'react'

export const StickyToolbar: React.FC = () => {
    return (
        <div className="sticky top-16 z-30 bg-transparent mb-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between px-2">
                <div className="bg-white/70 backdrop-blur rounded shadow px-3 py-1 flex items-center space-x-2">
                    <button className="text-sm px-2 py-1">B</button>
                    <button className="text-sm px-2 py-1">I</button>
                    <button className="text-sm px-2 py-1">Link</button>
                </div>
                <div className="text-sm text-gray-500">Autosave: on</div>
            </div>
        </div>
    )
}
