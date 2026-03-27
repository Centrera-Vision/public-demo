/** Fallback-tema om grafisk profil inte kan läsas in */
const FALLBACK_THEME = {
    background: "#1a1a2e",
    primary: "#e94560",
    secondary: "#0f3460",
    accent: "#533483",
    text: "#ffffff",
    textSecondary: "#8888aa",
    fontFamily: "sans-serif",
    paddleColor: "#e94560",
    paddleColorRight: "#0f3460",
    ballColor: "#ffffff",
    centerLineColor: "rgba(255, 255, 255, 0.2)",
    glowEffect: false,
    logoSvg: "",
};
/**
 * Laddar grafisk profil från en separat HTML-fil via fetch + DOMParser.
 * Returnerar fallback-tema vid fel.
 */
export async function loadTheme(url) {
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const el = doc.getElementById("theme");
        if (!el) {
            console.warn("Tema-element #theme saknas i grafisk profil, använder fallback");
            return FALLBACK_THEME;
        }
        // Hämta logo-SVG som HTML-sträng
        const logoEl = doc.getElementById("logo");
        const logoSvg = logoEl ? logoEl.outerHTML : "";
        return {
            background: el.dataset.background ?? FALLBACK_THEME.background,
            primary: el.dataset.primary ?? FALLBACK_THEME.primary,
            secondary: el.dataset.secondary ?? FALLBACK_THEME.secondary,
            accent: el.dataset.accent ?? FALLBACK_THEME.accent,
            text: el.dataset.text ?? FALLBACK_THEME.text,
            textSecondary: el.dataset.textSecondary ?? FALLBACK_THEME.textSecondary,
            fontFamily: el.dataset.fontFamily ?? FALLBACK_THEME.fontFamily,
            paddleColor: el.dataset.paddleColor ?? FALLBACK_THEME.paddleColor,
            paddleColorRight: el.dataset.paddleColorRight ?? FALLBACK_THEME.paddleColorRight,
            ballColor: el.dataset.ballColor ?? FALLBACK_THEME.ballColor,
            centerLineColor: el.dataset.centerLineColor ?? FALLBACK_THEME.centerLineColor,
            glowEffect: el.dataset.glowEffect === "true",
            logoSvg,
        };
    }
    catch (err) {
        console.error("Kunde inte ladda grafisk profil:", err);
        return FALLBACK_THEME;
    }
}
//# sourceMappingURL=theme.js.map