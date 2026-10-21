import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { resolveAsset, type StorefrontProduct } from "./lib/catalog";

// Scroll-scrubbed hero film. The section is several screens tall; its stage is
// pinned with position: sticky while scroll progress (0 → 1) drives a JPEG frame
// sequence drawn to a canvas, plus the editorial copy layered over it.
// Frames live in public/hero-sequence/{wide,tall}/001.jpg … 146.jpg.

const FRAME_COUNT = 146;
const FRAME_SETS = {
  wide: { width: 1280, height: 630 },
  tall: { width: 640, height: 630 },
} as const;
type FrameSet = keyof typeof FRAME_SETS;

// Same breakpoint as the stacked (portrait) layout in index.css.
const TALL_QUERY = "(max-aspect-ratio: 13/10), (max-width: 900px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// The film plays between these scroll positions; the margins let the opening
// title breathe before anything moves and let the finale settle at the end.
const FILM_START = 0.04;
const FILM_END = 0.86;

// Each chapter fades in over [start, start + fade] and out over [end - fade, end].
// The prelude is visible on arrival; the finale never fades out.
const CHAPTERS = [
  { start: -1, end: 0.12, fade: 0.08 },
  { start: 0.36, end: 0.55, fade: 0.06 },
  { start: 0.58, end: 0.8, fade: 0.06 },
  { start: 0.84, end: 2, fade: 0.08 },
] as const;
const RAIL_LABELS = ["The Vessel", "The Colour", "The Icon"];
const NUMERALS = ["I", "II", "III"];

// Time constant (ms) for easing the drawn position toward the scroll position.
// Gives the scrub a weighted, inertial feel instead of tracking the wheel 1:1.
const SMOOTHING_MS = 120;

const frameUrl = (set: FrameSet, index: number) =>
  resolveAsset(`/hero-sequence/${set}/${String(index + 1).padStart(3, "0")}.jpg`);

// Coarse-to-fine load order (every 16th frame, then 8th, 4th, 2nd, all) so the
// scrub is usable after a handful of requests and sharpens as the rest arrive.
const LOAD_ORDER = (() => {
  const order = [0, FRAME_COUNT - 1];
  for (const stride of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < FRAME_COUNT; i += stride) {
      if (!order.includes(i)) order.push(i);
    }
  }
  return order;
})();

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smoothstep = (n: number) => n * n * (3 - 2 * n);
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

const getSpecs = (product?: StorefrontProduct) => {
  if (!product) return [];
  const benefits = Array.isArray(product.benefits)
    ? product.benefits
    : (product.benefits ?? "").split(",").map((b) => b.trim()).filter(Boolean);
  return [
    ["Finish", product.finish],
    ["Wear", benefits[0]],
    ["Formula", benefits.find((b) => /vegan|cruelty/i.test(b))],
    ["Size", product.size],
  ].filter((spec): spec is [string, string] => Boolean(spec[1]));
};

interface ScrollHeroProps {
  header: ReactNode;
  featured?: StorefrontProduct;
  onShopFeatured: () => void;
}

export default function ScrollHero({ header, featured, onShopFeatured }: ScrollHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;

    const tallMedia = window.matchMedia(TALL_QUERY);
    const motionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    const frames: Record<FrameSet, (HTMLImageElement | null)[]> = {
      wide: new Array(FRAME_COUNT).fill(null),
      tall: new Array(FRAME_COUNT).fill(null),
    };
    const requested: Record<FrameSet, Set<number>> = { wide: new Set(), tall: new Set() };

    let set: FrameSet = tallMedia.matches ? "tall" : "wide";
    let isStatic = motionMedia.matches;
    let target = 0;
    let position = 0;
    let drawnFrame = -1;
    let lastTime = 0;
    let rafId = 0;
    let disposed = false;

    const requestFrames = () => {
      // With reduced motion only the closing frame is ever shown.
      const wanted = isStatic ? [FRAME_COUNT - 1] : LOAD_ORDER;
      const which = set;
      wanted.forEach((index, n) => {
        if (requested[which].has(index)) return;
        requested[which].add(index);
        const img = new Image();
        img.decoding = "async";
        if (n < 2) img.setAttribute("fetchpriority", "high");
        img.src = frameUrl(which, index);
        img
          .decode()
          .then(() => {
            if (disposed) return;
            frames[which][index] = img;
            if (which === set) {
              drawnFrame = -1;
              requestTick();
            }
          })
          .catch(() => requested[which].delete(index));
      });
    };

    const nearestReady = (list: (HTMLImageElement | null)[], index: number) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        const before = list[index - d];
        if (before) return before;
        const after = list[index + d];
        if (after) return after;
      }
      return null;
    };

    const applySet = () => {
      const { width, height } = FRAME_SETS[set];
      canvas.width = width;
      canvas.height = height;
      drawnFrame = -1;
      requestFrames();
    };

    const draw = () => {
      const list = frames[set];
      const filmProgress = isStatic ? 1 : clamp01((position - FILM_START) / (FILM_END - FILM_START));
      const exact = filmProgress * (FRAME_COUNT - 1);
      if (Math.abs(exact - drawnFrame) < 0.01) return;

      const index = Math.floor(exact);
      const base = nearestReady(list, index);
      if (!base) return;
      ctx.globalAlpha = 1;
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      // Cross-dissolve into the next frame by the fractional remainder so slow
      // scrolling glides between the film's 24fps frames instead of stepping.
      const blend = exact - index;
      const next = list[index + 1];
      if (blend > 0.02 && base === list[index] && next) {
        ctx.globalAlpha = blend;
        ctx.drawImage(next, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
      section.dataset.ready = "true";
      drawnFrame = exact;
    };

    const updateCopy = () => {
      const p = isStatic ? 1 : position;
      CHAPTERS.forEach((chapter, i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const fadeIn = smoothstep(clamp01((p - chapter.start) / chapter.fade));
        const fadeOut = smoothstep(clamp01((chapter.end - p) / chapter.fade));
        const visibility = Math.min(fadeIn, fadeOut);
        // -1 while waiting below, 0 when settled, +1 once it has drifted past.
        const drift = fadeIn < 1 ? -(1 - fadeIn) : 1 - fadeOut;
        el.style.setProperty("--v", visibility.toFixed(4));
        el.style.setProperty("--s", drift.toFixed(4));
        el.dataset.active = visibility > 0.01 ? "true" : "false";
      });

      const rail = railRef.current;
      if (rail) {
        rail.style.setProperty("--p", clamp01((p - CHAPTERS[1].start) / (CHAPTERS[3].start - CHAPTERS[1].start)).toFixed(4));
        const active = CHAPTERS.reduce((acc, chapter, i) => (p >= chapter.start + chapter.fade / 2 ? i : acc), 0);
        rail.dataset.chapter = String(active - 1);
        rail.dataset.active = p > CHAPTERS[0].end - CHAPTERS[0].fade ? "true" : "false";
      }
    };

    const readScroll = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      target = travel > 0 ? clamp01(-rect.top / travel) : 0;
    };

    const tick = (time: number) => {
      rafId = 0;
      readScroll();
      const dt = lastTime ? Math.min(64, time - lastTime) : 16;
      lastTime = time;
      position += (target - position) * (1 - Math.exp(-dt / SMOOTHING_MS));
      if (Math.abs(target - position) < 0.0004) position = target;

      draw();
      updateCopy();

      if (position !== target) {
        rafId = requestAnimationFrame(tick);
      } else {
        lastTime = 0;
      }
    };

    function requestTick() {
      if (!rafId && !disposed) rafId = requestAnimationFrame(tick);
    }

    const onMediaChange = () => {
      isStatic = motionMedia.matches;
      section.classList.toggle("is-static", isStatic);
      const nextSet: FrameSet = tallMedia.matches ? "tall" : "wide";
      if (nextSet !== set) {
        set = nextSet;
        applySet();
      } else {
        requestFrames();
      }
      drawnFrame = -1;
      requestTick();
    };

    section.classList.toggle("is-static", isStatic);
    applySet();
    readScroll();
    position = target;
    requestTick();

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    tallMedia.addEventListener("change", onMediaChange);
    motionMedia.addEventListener("change", onMediaChange);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", requestTick);
      tallMedia.removeEventListener("change", onMediaChange);
      motionMedia.removeEventListener("change", onMediaChange);
    };
  }, []);

  const productName = featured?.name ?? "Scarlet Rose Lipstick";
  const shadeName = productName.replace(/\s*lipstick$/i, "");
  const specs = getSpecs(featured);
  const setChapterRef = (i: number) => (el: HTMLDivElement | null) => {
    chapterRefs.current[i] = el;
  };

  return (
    <section ref={sectionRef} className="cine-hero" aria-label="She’Aura — your aura, your story">
      <a className="cine-skip" href="#collections">Skip the film</a>
      <div className="cine-stage">
        <div className="cine-film">
          <canvas
            ref={canvasRef}
            className="cine-canvas"
            role="img"
            aria-label={`A gold She’Aura case opens to reveal ${productName} among red satin swatches.`}
          />
        </div>
        <div className="cine-grain" aria-hidden="true" />

        <div className="cine-header">{header}</div>

        <div ref={setChapterRef(0)} className="cine-chapter cine-prelude">
          <p className="cine-eyebrow" style={stagger(0)}>Maison She’Aura · Couture lip colour</p>
          <h1 className="cine-display" style={stagger(1)}>
            A ritual<br /><em>beyond</em> beauty.
          </h1>
          <p className="cine-cue" style={stagger(2)}>
            <span>Scroll to unveil</span>
            <i aria-hidden="true" />
          </p>
        </div>

        <div ref={setChapterRef(1)} className="cine-chapter cine-side cine-side-left">
          <p className="cine-index" style={stagger(0)}><b>I</b>The Vessel</p>
          <h2 className="cine-title" style={stagger(1)}>
            Cast in <em>gold,</em><br />made to be kept.
          </h2>
          <p className="cine-body" style={stagger(2)}>
            A sculpted, mirror-bright case, weighted to sit in the hand like an heirloom.
          </p>
        </div>

        <div ref={setChapterRef(2)} className="cine-chapter cine-side cine-side-right">
          <p className="cine-index" style={stagger(0)}><b>II</b>The Colour</p>
          <h2 className="cine-title" style={stagger(1)}>
            {shadeName},<br /><em>poured like silk.</em>
          </h2>
          <p className="cine-body" style={stagger(2)}>
            Damask rose extract and botanical waxes, melted into a satin bullet that glides on in a single stroke.
          </p>
        </div>

        <div ref={setChapterRef(3)} className="cine-chapter cine-finale">
          <div className="cine-finale-copy">
            <p className="cine-index" style={stagger(0)}><b>III</b>The Icon</p>
            <h2 className="cine-display cine-display-finale" style={stagger(1)}>
              Your aura.<br /><em>Your story.</em>
            </h2>
            <p className="cine-body" style={stagger(2)}>
              Thoughtful formulas. Sensory textures. A more radiant you, every day.
            </p>
            <div className="cine-actions" style={stagger(3)}>
              <button type="button" className="cine-btn" onClick={onShopFeatured}>
                <span>Shop {shadeName}</span>
                {featured?.price && <span className="cine-btn-price">{featured.price}</span>}
              </button>
              <a className="cine-link" href="#shop">Explore the collection</a>
            </div>
          </div>
          {specs.length > 0 && (
            <div className="cine-specs" style={stagger(2)}>
              <p className="cine-specs-name">{productName}</p>
              <dl>
                {featured?.shades && featured.shades.length > 1 ? (
                  <div>
                    <dt>Shades</dt>
                    <dd className="cine-shades">
                      {featured.shades.map((shade) => (
                        <span key={shade.name} title={shade.name} style={{ background: shade.tone }} />
                      ))}
                    </dd>
                  </div>
                ) : featured?.tone ? (
                  <div>
                    <dt>Shade</dt>
                    <dd className="cine-shades">
                      <span style={{ background: featured.tone }} />
                      {shadeName}
                    </dd>
                  </div>
                ) : null}
                {specs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div ref={railRef} className="cine-rail" aria-hidden="true">
          {RAIL_LABELS.map((label, i) => (
            <span key={label} data-index={i}>
              <b>{NUMERALS[i]}</b>
              <em>{label}</em>
            </span>
          ))}
          <i />
        </div>
      </div>
    </section>
  );
}
