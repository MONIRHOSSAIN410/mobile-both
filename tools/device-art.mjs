/**
 * Device artwork generator.
 *
 * Produces a self-contained SVG string for one product. It is rendered to a
 * high-resolution WebP by `generate-product-images.mjs`, but the SVG itself is
 * resolution-independent — you can also inline it anywhere.
 *
 * Everything is derived from the product record, so adding a product to the
 * seed data is enough to get artwork for it.
 */

const SIZE = 1000;

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */

/** Signature body colours, so a grid of cards reads as different brands. */
const BODY_BY_BRAND = {
  samsung: "#1b1f2a",
  apple: "#40403f",
  google: "#2b3038",
  xiaomi: "#1e1f22",
  redmi: "#23262c",
  realme: "#25272b",
  oppo: "#1c2620",
  vivo: "#1f2334",
  iqoo: "#15182e",
  honor: "#17232f",
  oneplus: "#261a1d",
  nothing: "#e9e9ec",
  motorola: "#222839",
  tecno: "#152436",
  infinix: "#13251b",
  itel: "#2a1a1a",
  symphony: "#2a1618",
  walton: "#141f2e",
  nokia: "#151d2f",
  hmd: "#141c2c",
  zte: "#152232",
  proton: "#13241f",
  xtra: "#291717",
};

const hex = (value) => {
  const h = String(value ?? "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full.padEnd(6, "0").slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const toHex = ({ r, g, b }) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

const mix = (a, b, t) => {
  const A = hex(a);
  const B = hex(b);
  return toHex({
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
  });
};

const lighten = (c, t) => mix(c, "#ffffff", t);
const darken = (c, t) => mix(c, "#000000", t);

/** Brands whose logo colour is grey/black would give a lifeless wallpaper. */
const SCREEN_ACCENT_BY_BRAND = {
  apple: "#2f6bf0",
  nothing: "#d93a3a",
  motorola: "#4b7bf5",
  hmd: "#2f5fd0",
  nokia: "#2f5fd0",
};

const saturation = (c) => {
  const { r, g, b } = hex(c);
  return Math.max(r, g, b) - Math.min(r, g, b);
};

const luminance = (c) => {
  const { r, g, b } = hex(c);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

/* ------------------------------------------------------------------ */
/*  Shape selection                                                    */
/* ------------------------------------------------------------------ */

export function shapeFor(product) {
  const name = product.name.toLowerCase();
  switch (product.categorySlug) {
    case "featured-phone":
      return "feature";
    case "tablet":
      return "tablet";
    case "smart-watch":
      return /band/.test(name) ? "band" : "watch";
    case "earbuds":
      return "buds";
    case "accessories":
      if (/power bank/.test(name)) return "powerbank";
      if (/case/.test(name)) return "case";
      return "charger";
    case "gadgets":
      if (/speaker/.test(name)) return "speaker";
      if (/camera/.test(name)) return "camera";
      if (/stick|tv/.test(name)) return "stick";
      return "purifier";
    default:
      return "phone";
  }
}

/* ------------------------------------------------------------------ */
/*  Small SVG helpers                                                  */
/* ------------------------------------------------------------------ */

let uid = 0;
let idPrefix = "d";
/** Ids must be unique per document, not per file — several of these can be
 *  inlined on the same page, and duplicate ids silently break clip-path. */
const nextId = () => `${idPrefix}${(uid += 1)}`;

/** Soft elliptical contact shadow under the product. */
const contactShadow = (cx, cy, rx, ry, opacity = 0.3) => {
  const id = nextId();
  return `
  <defs>
    <radialGradient id="${id}">
      <stop offset="0%" stop-color="#000" stop-opacity="${opacity}"/>
      <stop offset="55%" stop-color="#000" stop-opacity="${opacity * 0.45}"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`;
};

/** Brushed-metal edge running down the side of a body. */
const metalEdge = (body) => {
  const id = nextId();
  return {
    id,
    def: `
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${lighten(body, 0.34)}"/>
      <stop offset="6%"   stop-color="${darken(body, 0.25)}"/>
      <stop offset="22%"  stop-color="${lighten(body, 0.1)}"/>
      <stop offset="50%"  stop-color="${body}"/>
      <stop offset="78%"  stop-color="${lighten(body, 0.08)}"/>
      <stop offset="94%"  stop-color="${darken(body, 0.28)}"/>
      <stop offset="100%" stop-color="${lighten(body, 0.3)}"/>
    </linearGradient>`,
  };
};

/** The wallpaper shown on a screen — brand-tinted, with two soft light pools. */
const wallpaper = (accent) => {
  const a = nextId();
  const b = nextId();
  const c = nextId();
  return {
    ids: { base: a, glow1: b, glow2: c },
    def: `
    <linearGradient id="${a}" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%"   stop-color="${darken(accent, 0.55)}"/>
      <stop offset="45%"  stop-color="${darken(accent, 0.2)}"/>
      <stop offset="100%" stop-color="${darken(accent, 0.78)}"/>
    </linearGradient>
    <radialGradient id="${b}">
      <stop offset="0%"   stop-color="${lighten(accent, 0.45)}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${c}">
      <stop offset="0%"   stop-color="${lighten(accent, 0.2)}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>`,
  };
};

/** Diagonal glass glare, clipped to whatever shape you pass. */
const glare = (clipId, x, y, w, h) => {
  const id = nextId();
  return `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#fff" stop-opacity="0.30"/>
      <stop offset="38%"  stop-color="#fff" stop-opacity="0.07"/>
      <stop offset="60%"  stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#${clipId})">
    <path d="M${x - w * 0.1} ${y + h * 0.62} L${x + w * 0.78} ${y - h * 0.06} L${x + w * 1.15} ${y - h * 0.06} L${x - w * 0.1} ${y + h * 1.04} Z" fill="url(#${id})"/>
  </g>`;
};

/** Tiny status bar so screens read as "on" rather than as a coloured rect. */
const statusBar = (x, y, w, scale = 1) => {
  const s = w * 0.055 * scale;
  return `
  <g fill="#fff" opacity="0.9">
    <text x="${x + w * 0.11}" y="${y + s * 0.95}" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="${s}" font-weight="600">9:41</text>
    <g transform="translate(${x + w * 0.66} ${y + s * 0.15})">
      ${[0, 1, 2, 3].map((i) => `<rect x="${i * s * 0.34}" y="${s * (0.72 - i * 0.17)}" width="${s * 0.2}" height="${s * (0.08 + i * 0.17)}" rx="${s * 0.06}"/>`).join("")}
      <rect x="${s * 1.6}" y="${s * 0.18}" width="${s * 1.05}" height="${s * 0.6}" rx="${s * 0.16}" fill="none" stroke="#fff" stroke-width="${s * 0.09}"/>
      <rect x="${s * 1.71}" y="${s * 0.29}" width="${s * 0.62}" height="${s * 0.38}" rx="${s * 0.08}"/>
    </g>
  </g>`;
};

/** A camera lens: barrel, glass, and two speculars. */
const lens = (cx, cy, r, accent) => {
  const g = nextId();
  const s = nextId();
  return `
  <defs>
    <radialGradient id="${g}" cx="0.35" cy="0.3">
      <stop offset="0%"   stop-color="${lighten(accent, 0.5)}"/>
      <stop offset="35%"  stop-color="${darken(accent, 0.45)}"/>
      <stop offset="100%" stop-color="#08090c"/>
    </radialGradient>
    <radialGradient id="${s}">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#101216"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#5b5f68" stroke-width="${r * 0.11}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.76}" fill="url(#${g})"/>
  <circle cx="${cx - r * 0.26}" cy="${cy - r * 0.3}" r="${r * 0.2}" fill="url(#${s})"/>
  <circle cx="${cx + r * 0.3}" cy="${cy + r * 0.32}" r="${r * 0.09}" fill="#fff" opacity="0.35"/>`;
};

const wordmark = (text, x, y, size, fill, opacity = 0.55) => `
  <text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" opacity="${opacity}"
        font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        font-size="${size}" font-weight="700" letter-spacing="${size * 0.16}">${text}</text>`;

/* ------------------------------------------------------------------ */
/*  Shapes                                                             */
/* ------------------------------------------------------------------ */

function phone({ body, accent, label }) {
  // A back-view unit angled behind a front-view unit — the classic store shot.
  const fw = 300;
  const fh = 610;
  const fx = 545;
  const fy = 205;
  const r = 46;

  const bw = 292;
  const bh = 596;
  const bx = 168;
  const by = 218;

  const edge = metalEdge(body);
  const wp = wallpaper(accent);
  const screenClip = nextId();
  const backClip = nextId();
  const islandId = nextId();

  return `
  ${contactShadow(500, 855, 330, 52, 0.34)}
  <defs>
    ${edge.def}
    ${wp.def}
    <linearGradient id="${islandId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${lighten(body, 0.14)}"/>
      <stop offset="100%" stop-color="${darken(body, 0.35)}"/>
    </linearGradient>
    <clipPath id="${screenClip}">
      <rect x="${fx + 13}" y="${fy + 13}" width="${fw - 26}" height="${fh - 26}" rx="${r - 13}"/>
    </clipPath>
    <clipPath id="${backClip}">
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${r}"/>
    </clipPath>
  </defs>

  <!-- back unit, tilted -->
  <g transform="rotate(-7 ${bx + bw / 2} ${by + bh / 2})">
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${r}" fill="url(#${edge.id})"/>
    <rect x="${bx + 5}" y="${by + 5}" width="${bw - 10}" height="${bh - 10}" rx="${r - 5}"
          fill="${body}" stroke="${lighten(body, 0.18)}" stroke-width="1.5"/>
    <g clip-path="url(#${backClip})">
      <ellipse cx="${bx + bw * 0.2}" cy="${by + bh * 0.22}" rx="${bw * 0.8}" ry="${bh * 0.3}"
               fill="${lighten(body, 0.16)}" opacity="0.5"/>
      <path d="M${bx - 20} ${by + bh * 0.72} L${bx + bw * 0.9} ${by - 10} L${bx + bw + 40} ${by - 10} L${bx - 20} ${by + bh * 1.1} Z"
            fill="#fff" opacity="0.05"/>
    </g>
    <!-- camera island -->
    <rect x="${bx + 26}" y="${by + 26}" width="${bw * 0.44}" height="${bw * 0.44}" rx="${bw * 0.13}"
          fill="url(#${islandId})" stroke="${lighten(body, 0.24)}" stroke-width="2"/>
    ${lens(bx + 26 + bw * 0.13, by + 26 + bw * 0.13, bw * 0.078, accent)}
    ${lens(bx + 26 + bw * 0.31, by + 26 + bw * 0.13, bw * 0.078, accent)}
    ${lens(bx + 26 + bw * 0.13, by + 26 + bw * 0.31, bw * 0.078, accent)}
    <circle cx="${bx + 26 + bw * 0.31}" cy="${by + 26 + bw * 0.31}" r="${bw * 0.036}" fill="#f6e7b4" opacity="0.85"/>
    <circle cx="${bx + 26 + bw * 0.31}" cy="${by + 26 + bw * 0.31}" r="${bw * 0.016}" fill="#fff" opacity="0.8"/>
    ${wordmark(label, bx + bw / 2, by + bh * 0.86, bw * 0.075, luminance(body) > 0.6 ? "#333" : "#fff", 0.42)}
  </g>

  <!-- front unit -->
  <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${r}" fill="url(#${edge.id})"/>
  <rect x="${fx + 6}" y="${fy + 6}" width="${fw - 12}" height="${fh - 12}" rx="${r - 6}" fill="#0a0b0d"/>
  <g clip-path="url(#${screenClip})">
    <rect x="${fx + 13}" y="${fy + 13}" width="${fw - 26}" height="${fh - 26}" fill="url(#${wp.ids.base})"/>
    <ellipse cx="${fx + fw * 0.28}" cy="${fy + fh * 0.26}" rx="${fw * 0.75}" ry="${fh * 0.3}" fill="url(#${wp.ids.glow1})"/>
    <ellipse cx="${fx + fw * 0.82}" cy="${fy + fh * 0.78}" rx="${fw * 0.62}" ry="${fh * 0.26}" fill="url(#${wp.ids.glow2})"/>
    ${statusBar(fx + 13, fy + 34, fw - 26)}
  </g>
  ${glare(screenClip, fx, fy, fw, fh)}
  <!-- dynamic island -->
  <rect x="${fx + fw / 2 - 44}" y="${fy + 26}" width="88" height="26" rx="13" fill="#050609"/>
  <circle cx="${fx + fw / 2 + 26}" cy="${fy + 39}" r="7" fill="#12151c"/>
  <circle cx="${fx + fw / 2 + 24}" cy="${fy + 37}" r="2.6" fill="${lighten(accent, 0.35)}" opacity="0.75"/>
  <!-- side buttons -->
  <rect x="${fx + fw - 2}" y="${fy + 150}" width="5" height="86" rx="2.5" fill="${darken(body, 0.35)}"/>
  <rect x="${fx - 3}" y="${fy + 132}" width="5" height="44" rx="2.5" fill="${darken(body, 0.35)}"/>
  <rect x="${fx - 3}" y="${fy + 190}" width="5" height="44" rx="2.5" fill="${darken(body, 0.35)}"/>`;
}

function feature({ body, accent, label }) {
  const w = 288;
  const h = 582;
  const x = 356;
  const y = 218;
  const r = 34;
  const edge = metalEdge(body);
  const wp = wallpaper(accent);
  const screenClip = nextId();

  const keys = [];
  const kx = x + 42;
  const ky = y + 258;
  const kw = (w - 84) / 3;
  const kh = 48;
  const glyphs = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"],
  ];
  glyphs.forEach((row, ri) =>
    row.forEach((g, ci) => {
      const cx = kx + ci * kw + kw / 2;
      const cy = ky + ri * (kh + 10) + kh / 2;
      keys.push(`
      <rect x="${kx + ci * kw + 5}" y="${ky + ri * (kh + 10)}" width="${kw - 10}" height="${kh}" rx="10"
            fill="${lighten(body, 0.16)}" stroke="${lighten(body, 0.3)}" stroke-width="1.2"/>
      <text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="#e9eaee" opacity="0.9"
            font-family="system-ui, sans-serif" font-size="21" font-weight="600">${g}</text>`);
    })
  );

  return `
  ${contactShadow(500, 838, 250, 44, 0.32)}
  <defs>
    ${edge.def}${wp.def}
    <clipPath id="${screenClip}">
      <rect x="${x + 34}" y="${y + 40}" width="${w - 68}" height="150" rx="10"/>
    </clipPath>
  </defs>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${edge.id})"/>
  <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="${r - 6}" fill="${body}"/>

  <!-- earpiece -->
  <rect x="${x + w / 2 - 34}" y="${y + 22}" width="68" height="8" rx="4" fill="${darken(body, 0.5)}"/>

  <!-- screen -->
  <rect x="${x + 30}" y="${y + 36}" width="${w - 60}" height="158" rx="13" fill="#08090b"/>
  <g clip-path="url(#${screenClip})">
    <rect x="${x + 34}" y="${y + 40}" width="${w - 68}" height="150" fill="url(#${wp.ids.base})"/>
    <ellipse cx="${x + w * 0.35}" cy="${y + 80}" rx="140" ry="70" fill="url(#${wp.ids.glow1})"/>
    <g fill="#fff" opacity="0.88" font-family="system-ui, sans-serif">
      <text x="${x + 44}" y="${y + 62}" font-size="13" font-weight="600">▮▮▮</text>
      <text x="${x + w - 74}" y="${y + 62}" font-size="13" font-weight="600">100%</text>
      <text x="${x + w / 2}" y="${y + 128}" text-anchor="middle" font-size="40" font-weight="700">9:41</text>
      <text x="${x + w / 2}" y="${y + 158}" text-anchor="middle" font-size="15" opacity="0.8">${label}</text>
    </g>
  </g>
  ${glare(screenClip, x + 30, y + 36, w - 60, 158)}

  <!-- soft keys + d-pad -->
  <rect x="${x + 34}" y="${y + 208}" width="60" height="26" rx="13" fill="${lighten(body, 0.14)}"/>
  <rect x="${x + w - 94}" y="${y + 208}" width="60" height="26" rx="13" fill="${lighten(body, 0.14)}"/>
  <circle cx="${x + w / 2}" cy="${y + 221}" r="26" fill="${lighten(body, 0.2)}" stroke="${accent}" stroke-width="2.5"/>
  <circle cx="${x + w / 2}" cy="${y + 221}" r="11" fill="${darken(body, 0.3)}"/>
  ${keys.join("")}
  ${wordmark(label, x + w / 2, y + h - 26, 17, "#fff", 0.4)}`;
}

function tablet({ body, accent, label }) {
  const w = 700;
  const h = 522;
  const x = 150;
  const y = 232;
  const r = 30;
  const edge = metalEdge(body);
  const wp = wallpaper(accent);
  const screenClip = nextId();

  return `
  ${contactShadow(500, 806, 400, 44, 0.3)}
  <defs>
    ${edge.def}${wp.def}
    <clipPath id="${screenClip}">
      <rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${h - 32}" rx="${r - 14}"/>
    </clipPath>
  </defs>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${edge.id})"/>
  <rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" rx="${r - 6}" fill="#0a0b0d"/>
  <g clip-path="url(#${screenClip})">
    <rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${h - 32}" fill="url(#${wp.ids.base})"/>
    <ellipse cx="${x + w * 0.3}" cy="${y + h * 0.28}" rx="${w * 0.6}" ry="${h * 0.55}" fill="url(#${wp.ids.glow1})"/>
    <ellipse cx="${x + w * 0.85}" cy="${y + h * 0.85}" rx="${w * 0.45}" ry="${h * 0.45}" fill="url(#${wp.ids.glow2})"/>
    <g opacity="0.92">
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 52 + i * 96}" y="${y + h - 96}" width="66" height="66" rx="17" fill="#fff" opacity="${0.13 + i * 0.03}"/>`).join("")}
    </g>
    ${statusBar(x + 16, y + 30, w - 32, 0.62)}
  </g>
  ${glare(screenClip, x, y, w, h)}
  <circle cx="${x + w / 2}" cy="${y + 15}" r="4.5" fill="#0d0f14"/>
  <circle cx="${x + w / 2 - 1}" cy="${y + 14}" r="1.8" fill="${lighten(accent, 0.4)}" opacity="0.7"/>
`;
}

function watch({ body, accent, label }) {
  const cx = 500;
  const cy = 470;
  const w = 268;
  const h = 320;
  const edge = metalEdge(body);
  const wp = wallpaper(accent);
  const faceClip = nextId();
  const strap = darken(body, 0.2);

  return `
  ${contactShadow(500, 832, 210, 36, 0.3)}
  <defs>
    ${edge.def}${wp.def}
    <clipPath id="${faceClip}">
      <rect x="${cx - w / 2 + 22}" y="${cy - h / 2 + 22}" width="${w - 44}" height="${h - 44}" rx="52"/>
    </clipPath>
  </defs>

  <!-- straps -->
  <path d="M${cx - 84} ${cy - h / 2 + 18} L${cx - 66} ${cy - h / 2 - 172} Q${cx} ${cy - h / 2 - 208} ${cx + 66} ${cy - h / 2 - 172} L${cx + 84} ${cy - h / 2 + 18} Z"
        fill="${strap}"/>
  <path d="M${cx - 84} ${cy + h / 2 - 18} L${cx - 66} ${cy + h / 2 + 178} Q${cx} ${cy + h / 2 + 214} ${cx + 66} ${cy + h / 2 + 178} L${cx + 84} ${cy + h / 2 - 18} Z"
        fill="${strap}"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${cx - 12}" y="${cy + h / 2 + 42 + i * 34}" width="24" height="10" rx="5" fill="#000" opacity="0.32"/>`).join("")}
  ${[0, 1, 2].map((i) => `<rect x="${cx - 62}" y="${cy - h / 2 - 60 - i * 34}" width="124" height="4" rx="2" fill="#fff" opacity="0.07"/>`).join("")}

  <!-- case -->
  <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="66" fill="url(#${edge.id})"/>
  <rect x="${cx - w / 2 + 10}" y="${cy - h / 2 + 10}" width="${w - 20}" height="${h - 20}" rx="58" fill="#08090c"/>

  <g clip-path="url(#${faceClip})">
    <rect x="${cx - w / 2 + 22}" y="${cy - h / 2 + 22}" width="${w - 44}" height="${h - 44}" fill="url(#${wp.ids.base})"/>
    <ellipse cx="${cx - 40}" cy="${cy - 70}" rx="190" ry="150" fill="url(#${wp.ids.glow1})"/>
    <g fill="none" stroke-linecap="round">
      <circle cx="${cx}" cy="${cy + 62}" r="46" stroke="#fff" stroke-opacity="0.14" stroke-width="12"/>
      <circle cx="${cx}" cy="${cy + 62}" r="46" stroke="${lighten(accent, 0.4)}" stroke-width="12"
              stroke-dasharray="215 290" transform="rotate(-90 ${cx} ${cy + 62})"/>
      <circle cx="${cx}" cy="${cy + 62}" r="30" stroke="#fff" stroke-opacity="0.14" stroke-width="10"/>
      <circle cx="${cx}" cy="${cy + 62}" r="30" stroke="#fff" stroke-opacity="0.65" stroke-width="10"
              stroke-dasharray="120 190" transform="rotate(-90 ${cx} ${cy + 62})"/>
    </g>
    <text x="${cx}" y="${cy - 44}" text-anchor="middle" fill="#fff" font-family="system-ui, sans-serif" font-size="62" font-weight="700">9:41</text>
    <text x="${cx}" y="${cy - 12}" text-anchor="middle" fill="#fff" opacity="0.6" font-family="system-ui, sans-serif" font-size="17" font-weight="500">${label}</text>
  </g>
  ${glare(faceClip, cx - w / 2, cy - h / 2, w, h)}

  <!-- crown + button -->
  <rect x="${cx + w / 2 - 3}" y="${cy - 46}" width="14" height="46" rx="7" fill="${lighten(body, 0.3)}"/>
  <rect x="${cx + w / 2 - 3}" y="${cy + 16}" width="11" height="34" rx="5.5" fill="${darken(body, 0.2)}"/>`;
}

function band({ body, accent, label }) {
  const cx = 500;
  const cy = 470;
  const w = 150;
  const h = 300;
  const edge = metalEdge(body);
  const wp = wallpaper(accent);
  const faceClip = nextId();

  return `
  ${contactShadow(500, 826, 150, 30, 0.28)}
  <defs>${edge.def}${wp.def}
    <clipPath id="${faceClip}"><rect x="${cx - w / 2 + 14}" y="${cy - h / 2 + 14}" width="${w - 28}" height="${h - 28}" rx="52"/></clipPath>
  </defs>
  <path d="M${cx - 52} ${cy - h / 2 + 10} L${cx - 44} ${cy - h / 2 - 190} Q${cx} ${cy - h / 2 - 220} ${cx + 44} ${cy - h / 2 - 190} L${cx + 52} ${cy - h / 2 + 10} Z" fill="${darken(body, 0.2)}"/>
  <path d="M${cx - 52} ${cy + h / 2 - 10} L${cx - 44} ${cy + h / 2 + 196} Q${cx} ${cy + h / 2 + 226} ${cx + 44} ${cy + h / 2 + 196} L${cx + 52} ${cy + h / 2 - 10} Z" fill="${darken(body, 0.2)}"/>
  <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="60" fill="url(#${edge.id})"/>
  <rect x="${cx - w / 2 + 7}" y="${cy - h / 2 + 7}" width="${w - 14}" height="${h - 14}" rx="55" fill="#08090c"/>
  <g clip-path="url(#${faceClip})">
    <rect x="${cx - w / 2 + 14}" y="${cy - h / 2 + 14}" width="${w - 28}" height="${h - 28}" fill="url(#${wp.ids.base})"/>
    <ellipse cx="${cx - 20}" cy="${cy - 60}" rx="130" ry="130" fill="url(#${wp.ids.glow1})"/>
    <text x="${cx}" y="${cy - 26}" text-anchor="middle" fill="#fff" font-family="system-ui, sans-serif" font-size="40" font-weight="700">9:41</text>
    <g fill="none" stroke-linecap="round">
      <circle cx="${cx}" cy="${cy + 52}" r="34" stroke="#fff" stroke-opacity="0.14" stroke-width="10"/>
      <circle cx="${cx}" cy="${cy + 52}" r="34" stroke="${lighten(accent, 0.4)}" stroke-width="10" stroke-dasharray="150 215" transform="rotate(-90 ${cx} ${cy + 52})"/>
    </g>
  </g>
  ${glare(faceClip, cx - w / 2, cy - h / 2, w, h)}
  ${wordmark(label, cx, cy + h / 2 + 250, 18, "#8b8b93", 0.45)}`;
}

function buds({ body, accent, label }) {
  const edge = metalEdge(body);
  const wp = wallpaper(accent);
  const budBody = luminance(body) > 0.6 ? body : lighten(body, 0.82);

  const bud = (x, y, s, rot) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <ellipse cx="0" cy="0" rx="52" ry="46" fill="${budBody}"/>
    <ellipse cx="-12" cy="-12" rx="30" ry="24" fill="#fff" opacity="0.55"/>
    <path d="M-18 34 Q-24 128 4 150 Q30 132 22 34 Z" fill="${budBody}"/>
    <path d="M-8 46 Q-12 122 4 138 Q14 124 10 46 Z" fill="#fff" opacity="0.28"/>
    <ellipse cx="6" cy="-4" rx="21" ry="18" fill="${darken(accent, 0.5)}"/>
    <ellipse cx="6" cy="-4" rx="13" ry="11" fill="#0b0c10"/>
    <circle cx="0" cy="-10" r="4" fill="#fff" opacity="0.5"/>
    <rect x="-14" y="96" width="30" height="6" rx="3" fill="${accent}" opacity="0.8"/>
  </g>`;

  return `
  ${contactShadow(500, 800, 300, 42, 0.3)}
  <defs>${edge.def}${wp.def}</defs>

  <!-- charging case (open) -->
  <g transform="translate(500 590)">
    <path d="M-190 -30 Q-190 -150 -150 -160 L150 -160 Q190 -150 190 -30 L190 -20 L-190 -20 Z" fill="${darken(body, 0.35)}"/>
    <rect x="-192" y="-26" width="384" height="188" rx="76" fill="url(#${edge.id})"/>
    <rect x="-182" y="-16" width="364" height="168" rx="68" fill="${body}"/>
    <ellipse cx="0" cy="-14" rx="176" ry="34" fill="#0a0b0e"/>
    <ellipse cx="0" cy="-16" rx="168" ry="27" fill="${darken(accent, 0.72)}"/>
    <ellipse cx="-70" cy="-18" rx="52" ry="15" fill="#000" opacity="0.55"/>
    <ellipse cx="70" cy="-18" rx="52" ry="15" fill="#000" opacity="0.55"/>
    <path d="M-182 40 Q-60 96 182 40 L182 84 Q-60 130 -182 84 Z" fill="#fff" opacity="0.07"/>
    <circle cx="0" cy="112" r="7" fill="${accent}"/>
    ${wordmark(label, 0, 84, 22, luminance(body) > 0.6 ? "#444" : "#fff", 0.4)}
  </g>

  <!-- buds sitting in the case -->
  ${bud(430, 470, 0.62, -9)}
  ${bud(570, 470, 0.62, 9)}
  <!-- hero bud in front -->
  ${bud(742, 452, 0.92, 13)}`;
}

function charger({ body, accent, label }) {
  const edge = metalEdge(body);
  const shell = luminance(body) > 0.6 ? body : "#f2f2f4";
  return `
  ${contactShadow(500, 806, 250, 40, 0.3)}
  <defs>${edge.def}</defs>
  <g transform="translate(500 470)">
    <rect x="-160" y="-160" width="320" height="320" rx="76" fill="${darken(shell, 0.12)}"/>
    <rect x="-152" y="-168" width="304" height="320" rx="72" fill="${shell}"/>
    <path d="M-152 -60 Q0 -18 152 -60 L152 40 Q0 88 -152 40 Z" fill="#fff" opacity="0.5"/>
    <rect x="-46" y="-206" width="30" height="52" rx="6" fill="#b9bcc4"/>
    <rect x="16" y="-206" width="30" height="52" rx="6" fill="#b9bcc4"/>
    <rect x="-56" y="118" width="112" height="26" rx="13" fill="#1a1c22"/>
    <rect x="-44" y="125" width="88" height="12" rx="6" fill="${accent}" opacity="0.85"/>
    ${wordmark(label, 0, 46, 26, "#5a5d66", 0.7)}
  </g>`;
}

function powerbank({ body, accent, label }) {
  const edge = metalEdge(body);
  return `
  ${contactShadow(500, 812, 270, 40, 0.3)}
  <defs>${edge.def}</defs>
  <g transform="translate(500 470)">
    <rect x="-196" y="-250" width="392" height="500" rx="58" fill="url(#${edge.id})"/>
    <rect x="-186" y="-240" width="372" height="480" rx="50" fill="${body}"/>
    <path d="M-186 -80 Q0 -14 186 -80 L186 60 Q0 128 -186 60 Z" fill="#fff" opacity="0.07"/>
    <rect x="-118" y="-186" width="236" height="130" rx="26" fill="#0b0c10"/>
    <text x="0" y="-96" text-anchor="middle" fill="${lighten(accent, 0.35)}" font-family="system-ui, sans-serif" font-size="72" font-weight="700">86</text>
    ${[0, 1, 2, 3].map((i) => `<rect x="${-96 + i * 52}" y="20" width="36" height="10" rx="5" fill="${accent}" opacity="${0.9 - i * 0.18}"/>`).join("")}
    <rect x="-64" y="132" width="56" height="22" rx="11" fill="#101218"/>
    <rect x="12" y="132" width="56" height="22" rx="11" fill="#101218"/>
    ${wordmark(label, 0, 214, 24, "#fff", 0.4)}
  </g>`;
}

function phoneCase({ body, accent, label }) {
  const edge = metalEdge(body);
  return `
  ${contactShadow(500, 848, 240, 40, 0.3)}
  <defs>${edge.def}</defs>
  <g transform="translate(500 470)">
    <rect x="-164" y="-336" width="328" height="672" rx="62" fill="${darken(accent, 0.35)}"/>
    <rect x="-152" y="-324" width="304" height="648" rx="54" fill="${accent}"/>
    <rect x="-134" y="-306" width="268" height="612" rx="44" fill="${darken(accent, 0.5)}"/>
    <path d="M-152 -140 Q0 -70 152 -140 L152 30 Q0 108 -152 30 Z" fill="#fff" opacity="0.12"/>
    <rect x="-108" y="-280" width="150" height="150" rx="44" fill="${darken(body, 0.25)}"/>
    ${lens(-66, -238, 26, accent)}
    ${lens(4, -238, 26, accent)}
    ${lens(-66, -172, 26, accent)}
    ${wordmark(label, 0, 250, 24, "#fff", 0.45)}
  </g>`;
}

function speaker({ body, accent, label }) {
  const edge = metalEdge(body);
  const meshId = nextId();
  return `
  ${contactShadow(500, 786, 260, 38, 0.3)}
  <defs>
    ${edge.def}
    <pattern id="${meshId}" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="3.2" fill="${darken(body, 0.45)}"/>
    </pattern>
  </defs>
  <g transform="translate(500 500)">
    <rect x="-260" y="-160" width="520" height="320" rx="160" fill="url(#${edge.id})"/>
    <rect x="-248" y="-148" width="496" height="296" rx="148" fill="${body}"/>
    <rect x="-224" y="-124" width="448" height="248" rx="124" fill="url(#${meshId})" opacity="0.85"/>
    <path d="M-248 -60 Q0 10 248 -60 L248 30 Q0 110 -248 30 Z" fill="#fff" opacity="0.06"/>
    <circle cx="-118" cy="0" r="54" fill="${darken(accent, 0.6)}" opacity="0.55"/>
    <circle cx="118" cy="0" r="54" fill="${darken(accent, 0.6)}" opacity="0.55"/>
    <rect x="-64" y="112" width="128" height="14" rx="7" fill="${accent}" opacity="0.85"/>
    ${wordmark(label, 0, 200, 26, "#8b8b93", 0.6)}
  </g>`;
}

function camera({ body, accent, label }) {
  const edge = metalEdge(body);
  return `
  ${contactShadow(500, 820, 220, 38, 0.3)}
  <defs>${edge.def}</defs>
  <g transform="translate(500 440)">
    <rect x="-58" y="200" width="116" height="150" rx="26" fill="${darken(body, 0.3)}"/>
    <ellipse cx="0" cy="352" rx="150" ry="34" fill="${body}"/>
    <circle cx="0" cy="20" r="180" fill="url(#${edge.id})"/>
    <circle cx="0" cy="20" r="166" fill="${body}"/>
    <path d="M-166 -30 Q0 46 166 -30 L166 60 Q0 140 -166 60 Z" fill="#fff" opacity="0.07"/>
    ${lens(0, 6, 92, accent)}
    <circle cx="0" cy="-136" r="16" fill="${accent}" opacity="0.9"/>
    <circle cx="0" cy="-136" r="7" fill="#fff" opacity="0.8"/>
    ${wordmark(label, 0, 170, 24, "#fff", 0.4)}
  </g>`;
}

function stick({ body, accent, label }) {
  const edge = metalEdge(body);
  return `
  ${contactShadow(500, 640, 220, 34, 0.28)}
  <defs>${edge.def}</defs>
  <g transform="translate(500 450) rotate(-14)">
    <rect x="-250" y="-90" width="440" height="180" rx="66" fill="url(#${edge.id})"/>
    <rect x="-240" y="-80" width="420" height="160" rx="58" fill="${body}"/>
    <path d="M-240 -30 Q-30 22 180 -30 L180 32 Q-30 92 -240 32 Z" fill="#fff" opacity="0.07"/>
    <rect x="180" y="-42" width="96" height="84" rx="16" fill="#9ea3ad"/>
    <rect x="196" y="-26" width="64" height="52" rx="9" fill="#6f7480"/>
    <circle cx="-160" cy="0" r="19" fill="${accent}"/>
    ${wordmark(label, -20, 14, 30, "#fff", 0.45)}
  </g>`;
}

function purifier({ body, accent, label }) {
  const edge = metalEdge(body);
  const shell = luminance(body) > 0.6 ? body : "#eceef1";
  return `
  ${contactShadow(500, 838, 230, 38, 0.3)}
  <defs>${edge.def}</defs>
  <g transform="translate(500 460)">
    <rect x="-186" y="-330" width="372" height="660" rx="70" fill="${darken(shell, 0.14)}"/>
    <rect x="-176" y="-340" width="352" height="660" rx="64" fill="${shell}"/>
    <path d="M-176 -120 Q0 -46 176 -120 L176 40 Q0 122 -176 40 Z" fill="#fff" opacity="0.5"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-140 + i * 50}" y="-300" width="26" height="120" rx="13" fill="${darken(shell, 0.3)}" opacity="0.65"/>`).join("")}
    <circle cx="0" cy="60" r="92" fill="#0e1014"/>
    <circle cx="0" cy="60" r="80" fill="${darken(accent, 0.65)}"/>
    <text x="0" y="52" text-anchor="middle" fill="${lighten(accent, 0.5)}" font-family="system-ui, sans-serif" font-size="48" font-weight="700">12</text>
    <text x="0" y="86" text-anchor="middle" fill="#fff" opacity="0.6" font-family="system-ui, sans-serif" font-size="18">PM2.5</text>
    <circle cx="0" cy="222" r="20" fill="${accent}" opacity="0.85"/>
    ${wordmark(label, 0, 300, 26, "#5a5d66", 0.7)}
  </g>`;
}

const SHAPES = {
  phone,
  feature,
  tablet,
  watch,
  band,
  buds,
  charger,
  powerbank,
  case: phoneCase,
  speaker,
  camera,
  stick,
  purifier,
};

/**
 * Accessories are physically smaller than phones, but in a product grid every
 * card gets the same box — so scale the small ones up to fill it.
 */
const SHAPE_SCALE = {
  feature: 1.08,
  buds: 1.12,
  charger: 1.3,
  powerbank: 1.18,
  case: 1.08,
  speaker: 1.2,
  camera: 1.15,
  stick: 1.3,
  purifier: 1.12,
  band: 1.05,
};

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function deviceSvg(product, { idPrefix: prefix } = {}) {
  uid = 0;
  idPrefix =
    prefix ??
    `p${[...String(product.slug ?? product.name)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36)}_`;
  const accent = product.accent || "#c9a227";
  const body =
    BODY_BY_BRAND[product.brandSlug] ?? darken(mix(accent, "#1a1b1f", 0.72), 0.1);
  const label = (product.brandName ?? "").toUpperCase();

  const screenAccent =
    SCREEN_ACCENT_BY_BRAND[product.brandSlug] ??
    (saturation(accent) < 34 ? "#3a6df0" : accent);

  const shape = shapeFor(product);
  const draw = SHAPES[shape] ?? phone;
  const scale = SHAPE_SCALE[shape] ?? 1;

  const art = draw({ body, accent: screenAccent, hardware: accent, label });
  const inner =
    scale === 1
      ? art
      : `<g transform="translate(${SIZE / 2} ${SIZE / 2}) scale(${scale}) translate(${-SIZE / 2} ${-SIZE / 2})">${art}</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
${inner}
</svg>`;
}

export { SIZE };
