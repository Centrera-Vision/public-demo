import { ThemeConfig } from "./theme.js";

// ── Spelobjekt-typer ──────────────────────────────────────────────

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

interface GameConfig {
  width: number;
  height: number;
  paddleSpeed: number;
  initialBallSpeed: number;
  maxBallSpeed: number;
  winScore: number;
}

// ── Standardkonfiguration ─────────────────────────────────────────

const DEFAULT_CONFIG: GameConfig = {
  width: 800,
  height: 500,
  paddleSpeed: 6,
  initialBallSpeed: 5,
  maxBallSpeed: 12,
  winScore: 10,
};

// ── Spelmotor ─────────────────────────────────────────────────────

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private theme: ThemeConfig;
  private config: GameConfig;

  private ball!: Ball;
  private leftPaddle!: Paddle;
  private rightPaddle!: Paddle;

  private keys = new Set<string>();
  private running = false;
  private gameOver = false;
  private winner = "";

  constructor(
    canvas: HTMLCanvasElement,
    theme: ThemeConfig,
    config?: Partial<GameConfig>
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.theme = theme;
    this.config = { ...DEFAULT_CONFIG, ...config };

    canvas.width = this.config.width;
    canvas.height = this.config.height;

    this.initGameObjects();
    this.setupInput();
  }

  /** Skapar paddlar och boll i startposition */
  private initGameObjects(): void {
    const paddleW = 12;
    const paddleH = 80;
    const { width, height } = this.config;

    this.leftPaddle = {
      x: 24,
      y: (height - paddleH) / 2,
      width: paddleW,
      height: paddleH,
      score: 0,
    };

    this.rightPaddle = {
      x: width - 24 - paddleW,
      y: (height - paddleH) / 2,
      width: paddleW,
      height: paddleH,
      score: 0,
    };

    this.ball = this.createBall();
  }

  /** Skapa en ny boll i center med slumpmässig riktning */
  private createBall(): Ball {
    const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8;
    const direction = Math.random() > 0.5 ? 1 : -1;
    return {
      x: this.config.width / 2,
      y: this.config.height / 2,
      vx: Math.cos(angle) * this.config.initialBallSpeed * direction,
      vy: Math.sin(angle) * this.config.initialBallSpeed,
      radius: 8,
    };
  }

  // ── Input ─────────────────────────────────────────────────────

  private setupInput(): void {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key);
      // Förhindra scroll vid piltangenter
      if (["ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.key));
  }

  // ── Game loop ─────────────────────────────────────────────────

  /** Starta spelet */
  start(): void {
    this.running = true;
    this.loop();
  }

  private loop = (): void => {
    if (!this.running) return;
    if (!this.gameOver) {
      this.update();
    }
    this.render();
    requestAnimationFrame(this.loop);
  };

  // ── Uppdateringslogik ─────────────────────────────────────────

  private update(): void {
    this.movePaddles();
    this.moveBall();
    this.checkWallCollision();
    this.checkPaddleCollision(this.leftPaddle);
    this.checkPaddleCollision(this.rightPaddle);
    this.checkScoring();
  }

  private movePaddles(): void {
    const speed = this.config.paddleSpeed;
    const maxY = this.config.height;

    // Vänster spelare: W / S
    if (this.keys.has("w") || this.keys.has("W")) this.leftPaddle.y -= speed;
    if (this.keys.has("s") || this.keys.has("S")) this.leftPaddle.y += speed;

    // Höger spelare: Pil upp / Pil ner
    if (this.keys.has("ArrowUp")) this.rightPaddle.y -= speed;
    if (this.keys.has("ArrowDown")) this.rightPaddle.y += speed;

    // Begränsa paddlar inom spelplanen
    this.leftPaddle.y = clamp(this.leftPaddle.y, 0, maxY - this.leftPaddle.height);
    this.rightPaddle.y = clamp(this.rightPaddle.y, 0, maxY - this.rightPaddle.height);
  }

  private moveBall(): void {
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
  }

  /** Studsa bollen mot topp/botten */
  private checkWallCollision(): void {
    const { ball } = this;
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y + ball.radius >= this.config.height) {
      ball.y = this.config.height - ball.radius;
      ball.vy = -Math.abs(ball.vy);
    }
  }

  /** Kontrollera kollision mellan boll och paddel */
  private checkPaddleCollision(paddle: Paddle): void {
    const { ball } = this;
    if (
      ball.x - ball.radius < paddle.x + paddle.width &&
      ball.x + ball.radius > paddle.x &&
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height
    ) {
      // Beräkna träffposition på paddeln (-0.5 till 0.5)
      const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);

      // Studsa tillbaka med ökad hastighet
      const speed = Math.min(
        Math.sqrt(ball.vx ** 2 + ball.vy ** 2) * 1.05,
        this.config.maxBallSpeed
      );
      const bounceAngle = hitPos * (Math.PI / 3); // max ±60°
      const direction = paddle === this.leftPaddle ? 1 : -1;

      ball.vx = Math.cos(bounceAngle) * speed * direction;
      ball.vy = Math.sin(bounceAngle) * speed;

      // Förhindra att bollen fastnar i paddeln
      if (direction === 1) ball.x = paddle.x + paddle.width + ball.radius;
      else ball.x = paddle.x - ball.radius;
    }
  }

  /** Poäng när bollen passerar vänster/höger kant */
  private checkScoring(): void {
    if (this.ball.x + this.ball.radius < 0) {
      this.rightPaddle.score++;
      this.checkWinCondition("Höger");
      if (!this.gameOver) this.ball = this.createBall();
    } else if (this.ball.x - this.ball.radius > this.config.width) {
      this.leftPaddle.score++;
      this.checkWinCondition("Vänster");
      if (!this.gameOver) this.ball = this.createBall();
    }
  }

  private checkWinCondition(player: string): void {
    const score = player === "Vänster" ? this.leftPaddle.score : this.rightPaddle.score;
    if (score >= this.config.winScore) {
      this.gameOver = true;
      this.winner = player;
    }
  }

  // ── Rendering ─────────────────────────────────────────────────

  private render(): void {
    const { ctx, theme, config } = this;

    this.renderBackground(ctx, theme, config);
    this.renderCenterLine(ctx, theme, config);
    this.renderPaddle(ctx, this.leftPaddle, theme.paddleColor, theme);
    this.renderPaddle(ctx, this.rightPaddle, theme.paddleColorRight, theme);
    this.renderBall(ctx, theme);
    this.renderScore(ctx, theme, config);

    if (this.gameOver) {
      this.renderGameOver(ctx, theme, config);
    }
  }

  private renderBackground(
    ctx: CanvasRenderingContext2D,
    theme: ThemeConfig,
    config: GameConfig
  ): void {
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, config.width, config.height);
  }

  private renderCenterLine(
    ctx: CanvasRenderingContext2D,
    theme: ThemeConfig,
    config: GameConfig
  ): void {
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = theme.centerLineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(config.width / 2, 0);
    ctx.lineTo(config.width / 2, config.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private renderPaddle(
    ctx: CanvasRenderingContext2D,
    paddle: Paddle,
    color: string,
    theme: ThemeConfig
  ): void {
    if (theme.glowEffect) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
    }
    // Rundade hörn för paddeln
    ctx.fillStyle = color;
    this.roundRect(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 6);
    ctx.shadowBlur = 0;
  }

  private renderBall(ctx: CanvasRenderingContext2D, theme: ThemeConfig): void {
    if (theme.glowEffect) {
      ctx.shadowColor = theme.ballColor;
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = theme.ballColor;
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  private renderScore(
    ctx: CanvasRenderingContext2D,
    theme: ThemeConfig,
    config: GameConfig
  ): void {
    ctx.fillStyle = theme.text;
    ctx.font = `700 48px ${theme.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(String(this.leftPaddle.score), config.width / 4, 24);
    ctx.fillText(String(this.rightPaddle.score), (config.width * 3) / 4, 24);
  }

  private renderGameOver(
    ctx: CanvasRenderingContext2D,
    theme: ThemeConfig,
    config: GameConfig
  ): void {
    // Overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, config.width, config.height);

    // Vinnartext
    ctx.fillStyle = theme.primary;
    ctx.font = `800 42px ${theme.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${this.winner} spelare vinner!`, config.width / 2, config.height / 2 - 20);

    // Instruktion
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `400 18px ${theme.fontFamily}`;
    ctx.fillText("Tryck R för att starta om", config.width / 2, config.height / 2 + 30);
  }

  /** Ritar en rektangel med rundade hörn */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  // ── Publika metoder ───────────────────────────────────────────

  /** Nollställ poäng och starta om */
  resetMatch(): void {
    this.leftPaddle.score = 0;
    this.rightPaddle.score = 0;
    this.leftPaddle.y = (this.config.height - this.leftPaddle.height) / 2;
    this.rightPaddle.y = (this.config.height - this.rightPaddle.height) / 2;
    this.ball = this.createBall();
    this.gameOver = false;
    this.winner = "";
  }

  /** Lyssna på R-tangent för omstart */
  enableRestart(): void {
    window.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        this.resetMatch();
      }
    });
  }
}

// ── Hjälpfunktion ─────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
