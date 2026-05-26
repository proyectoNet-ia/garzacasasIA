// Centralized Font Awesome social icons for brand consistency
// Import this wherever you need social brand icons
// NOTE: FA overrides h/w via inline SVG attrs, so we wrap in a <span>
// that holds the Tailwind size class and force the SVG to fill it 100%.

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faInstagram,
    faFacebook,
    faWhatsapp,
    faLinkedin,
    faXTwitter,
    faYoutube,
    faTiktok,
} from '@fortawesome/free-brands-svg-icons'

interface SocialIconProps {
    className?: string
}

const iconStyle = { width: '100%', height: '100%', display: 'block' }

export function IconInstagram({ className }: SocialIconProps) {
    return <span className={`inline-flex items-center justify-center ${className ?? ''}`}><FontAwesomeIcon icon={faInstagram} style={iconStyle} /></span>
}

export function IconFacebook({ className }: SocialIconProps) {
    return <span className={`inline-flex items-center justify-center ${className ?? ''}`}><FontAwesomeIcon icon={faFacebook} style={iconStyle} /></span>
}

export function IconWhatsApp({ className }: SocialIconProps) {
    return <span className={`inline-flex items-center justify-center ${className ?? ''}`}><FontAwesomeIcon icon={faWhatsapp} style={iconStyle} /></span>
}

export function IconLinkedIn({ className }: SocialIconProps) {
    return <span className={`inline-flex items-center justify-center ${className ?? ''}`}><FontAwesomeIcon icon={faLinkedin} style={iconStyle} /></span>
}

export function IconXTwitter({ className }: SocialIconProps) {
    return <span className={`inline-flex items-center justify-center ${className ?? ''}`}><FontAwesomeIcon icon={faXTwitter} style={iconStyle} /></span>
}

export function IconYoutube({ className }: SocialIconProps) {
    return <span className={`inline-flex items-center justify-center ${className ?? ''}`}><FontAwesomeIcon icon={faYoutube} style={iconStyle} /></span>
}

export function IconTikTok({ className }: SocialIconProps) {
    return <span className={`inline-flex items-center justify-center ${className ?? ''}`}><FontAwesomeIcon icon={faTiktok} style={iconStyle} /></span>
}

