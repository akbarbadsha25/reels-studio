// Fonts ship with the repo (via @fontsource) so renders work offline and behind proxies.
import { loadFont } from "@remotion/fonts";
import montserrat700 from "@fontsource/montserrat/files/montserrat-latin-700-normal.woff2";
import montserrat800 from "@fontsource/montserrat/files/montserrat-latin-800-normal.woff2";
import montserrat900 from "@fontsource/montserrat/files/montserrat-latin-900-normal.woff2";
import inter700 from "@fontsource/inter/files/inter-latin-700-normal.woff2";
import inter800 from "@fontsource/inter/files/inter-latin-800-normal.woff2";
import inter900 from "@fontsource/inter/files/inter-latin-900-normal.woff2";
import poppins700 from "@fontsource/poppins/files/poppins-latin-700-normal.woff2";
import poppins800 from "@fontsource/poppins/files/poppins-latin-800-normal.woff2";
import poppins900 from "@fontsource/poppins/files/poppins-latin-900-normal.woff2";
import bebas400 from "@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2";
import { Brand } from "./types";

const FILES: Record<NonNullable<Brand["font"]>, Record<string, string>> = {
  Montserrat: { "700": montserrat700, "800": montserrat800, "900": montserrat900 },
  Inter: { "700": inter700, "800": inter800, "900": inter900 },
  Poppins: { "700": poppins700, "800": poppins800, "900": poppins900 },
  // Single weight; every heavier weight maps to it so it never falls back to a system font.
  "Bebas Neue": { "700": bebas400, "800": bebas400, "900": bebas400 },
};

const loaded = new Set<string>();

export const fontFamily = (brand: Brand) => {
  const family = brand.font ?? "Montserrat";
  if (!loaded.has(family)) {
    loaded.add(family);
    for (const [weight, url] of Object.entries(FILES[family])) loadFont({ family, url, weight });
  }
  return `"${family}", sans-serif`;
};
