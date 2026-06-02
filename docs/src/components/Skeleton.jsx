function Skeleton({ type = 'card' }) {

    if (type === 'table') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{
                        display: 'flex', gap: '16px', padding: '10px 0',
                        opacity: 1 - (i * 0.12),
                    }}>
                        <div style={shimmer(30 + Math.random() * 20)} />
                        <div style={shimmer(15 + Math.random() * 15)} />
                        <div style={shimmer(20 + Math.random() * 10)} />
                        <div style={shimmer(10 + Math.random() * 8)} />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'form') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
                <div style={shimmer(100, '42px')} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={shimmer(100, '42px')} />
                    <div style={shimmer(100, '42px')} />
                    <div style={shimmer(100, '42px')} />
                    <div style={shimmer(100, '42px')} />
                </div>
                <div style={shimmer(30, '40px')} />
            </div>
        );
    }

    if (type === 'detail') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <div style={shimmer(50, '28px')} />
                <div style={shimmer(80, '16px')} />
                <div style={{ height: '1px', backgroundColor: '#f0f0f0' }} />
                <div style={shimmer(100, '60px')} />
                <div style={shimmer(100, '60px')} />
                <div style={shimmer(60, '60px')} />
            </div>
        );
    }

    // Cards / Stats
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    padding: '18px 20px',
                }}>
                    <div style={shimmer(50, '11px', '6px')} />
                    <div style={shimmer(75, '24px', '10px')} />
                </div>
            ))}
        </div>
    );
}

function shimmer(width, height = '14px', marginBottom = '0') {
    return {
        width: `${width}%`,
        height,
        marginBottom,
        borderRadius: '4px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
    };
}

export default Skeleton;