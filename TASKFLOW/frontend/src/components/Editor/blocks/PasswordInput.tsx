import React, { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface PasswordInputProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    required?: boolean
    id?: string
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, placeholder = '••••••••', required = false, id }) => {
    const [show, setShow] = useState(false)

    return (
        <div className="relative">
            <input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                aria-label="Password"
            />

            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                title={show ? 'Hide password' : 'Show password'}
                aria-pressed={show ? 'true' : 'false'}
            >
                {show ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
        </div>
    )
}

export default PasswordInput
