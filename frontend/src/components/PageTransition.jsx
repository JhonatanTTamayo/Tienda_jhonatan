import { useEffect, useState } from 'react';

function PageTransition({ children }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(timer);
    }, []);

    return (
        <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}>
            {children}
        </div>
    );
}

export default PageTransition;