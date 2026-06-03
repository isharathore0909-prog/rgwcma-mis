import React from 'react';

export const InputRow = ({ label, field, value, onChange, type = "text", className = "" }) => (
    <div className={`wa-form-row ${className}`}>
        <label>{label}</label>
        <input
            type={type}
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(field, e.target.value)}
        />
    </div>
);

export const CalculatedRow = ({ label, value, className = "", isPercentage = false, valueClass = "" }) => {
    // Check if the value is purely a string (like "Yes", "No") or a number
    const isNumeric = (val) => {
        if (typeof val === 'number') return true;
        if (typeof val !== 'string') return false;
        return !isNaN(val) && !isNaN(parseFloat(val));
    };

    const numValue = parseFloat(value);
    const displayValue = isNumeric(value)
        ? numValue.toFixed(2) + (isPercentage ? '%' : '')
        : (value || '0.00');

    return (
        <div className={`wa-form-row ${className}`}>
            <label>{label}</label>
            <span className={`wa-value ${valueClass}`}>
                {displayValue}
            </span>
        </div>
    );
};

export const SectionHeader = ({ title }) => (
    <div className="wa-form-row label-only" style={{ marginTop: '20px' }}>
        <label style={{ color: 'var(--wa-accent)', fontWeight: 'bold' }}>{title}</label>
    </div>
);

export const MultiInputRow = ({ label, inputs }) => (
    <div className="wa-form-row indented">
        <label>{label}</label>
        <div style={{ display: 'flex', gap: '5px', width: '80%' }}>
            {inputs.map((inp, idx) => (
                <input
                    key={idx}
                    placeholder={inp.placeholder}
                    type="text"
                    value={inp.value !== undefined && inp.value !== null ? inp.value : ''}
                    onChange={(e) => inp.onChange(e.target.value)}
                    title={inp.title}
                    style={inp.style}
                    className="multi-input-field"
                />
            ))}
        </div>
    </div>
);

export const SelectRow = ({ label, field, value, options, onChange, className = "" }) => (
    <div className={`wa-form-row ${className}`}>
        <label>{label}</label>
        <select
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '80%' }}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export const CheckboxRow = ({ label, field, value, onChange, className = "" }) => (
    <div className={`wa-form-row ${className}`} style={{ alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(field, e.target.checked)}
                style={{ width: '18px', height: '18px' }}
            />
            {label}
        </label>
    </div>
);
