import { getAvatarColor, getInitials } from '../utils/avatarUtils';

function Avatar({ name, size = 40, fontSize = 16 }) {
    const color = getAvatarColor(name);
    const initials = getInitials(name);

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: fontSize,
            fontFamily: "'Baloo 2', system-ui, sans-serif",
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
            {initials}
        </div>
    );
}

export default Avatar;