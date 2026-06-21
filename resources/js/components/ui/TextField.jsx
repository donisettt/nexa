import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function TextField({ error, icon: Icon, placeholder, name, onChange, type = 'text', value }) {
    const fieldId = `field-${name}`;
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className="w-full">
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#9ca3af]">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    autoComplete={name}
                    className={`h-12 w-full rounded-lg border bg-white text-sm text-[#1f2933] outline-none transition focus:border-[#6366f2] focus:ring-4 focus:ring-[#6366f2]/15 ${
                        Icon ? 'pl-11' : 'px-4'
                    } ${isPassword ? 'pr-11' : 'pr-4'} ${
                        error ? 'border-[#d95f43]' : 'border-[#e2e8f0]'
                    }`}
                    id={fieldId}
                    name={name}
                    onChange={onChange}
                    type={inputType}
                    value={value}
                    placeholder={placeholder}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#9ca3af] hover:text-[#4b5563]"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error ? <span className="mt-1.5 block text-xs font-semibold text-[#bd4b32]">{error}</span> : null}
        </div>
    );
}
