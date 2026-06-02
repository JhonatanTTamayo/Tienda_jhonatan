function Spinner({ size = 32, color = '#0066FF', text }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px' }}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#f0f0f0" strokeWidth="3" />
                <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{
                        transformOrigin: 'center',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
            </svg>
            {text && <span style={{ fontSize: '13px', color: '#737373' }}>{text}</span>}
        </div>
    );
}

export default Spinner;