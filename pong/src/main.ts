import { loadTheme } from "./theme.js";
import { Game } from "./game.js";

const THEME_URL = "grafisk-profil.html";
const CANVAS_ID = "pong-canvas";

async function init(): Promise<void> {
  // Ladda grafisk profil innan spelet startas
  const theme = await loadTheme(THEME_URL);

  // Injicera logo i header om den finns
  const logoContainer = document.getElementById("logo-container");
  if (logoContainer && theme.logoSvg) {
    logoContainer.innerHTML = theme.logoSvg;
  }

  // Applicera temafärger på sidan
  document.body.style.background = theme.background;

  const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
  if (!canvas) {
    console.error(`Canvas-element #${CANVAS_ID} hittades inte`);
    return;
  }

  const game = new Game(canvas, theme);
  game.enableRestart();
  game.start();

  // Knapp för omstart
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => game.resetMatch());
  }
}

init();
