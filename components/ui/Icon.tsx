import React from "react";

type IconName =
  | "home" | "users" | "user" | "card" | "tag" | "qr" | "dumbbell"
  | "chart" | "plus" | "search" | "filter" | "bell" | "arrow-up"
  | "arrow-down" | "arrow-right" | "check" | "flame" | "whatsapp"
  | "logo" | "more" | "wallet" | "apple" | "google" | "play";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
  style?: React.CSSProperties;
}

export default function Icon({ name, size = 16, stroke = 1.6, color = "currentColor", style }: IconProps) {
  const s: React.CSSProperties = { width: size, height: size, display: "inline-block", flexShrink: 0, ...style };
  const p = { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home":       return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 11l9-8 9 8M5 9.5V21h5v-7h4v7h5V9.5"/></svg>;
    case "users":      return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="9" cy="8" r="4"/><path {...p} d="M2 21v-1a6 6 0 016-6h2a6 6 0 016 6v1M17 4a4 4 0 010 8M22 21v-1a5 5 0 00-4-4.9"/></svg>;
    case "user":       return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="8" r="4"/><path {...p} d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"/></svg>;
    case "card":       return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="3" y="6" width="18" height="13" rx="2"/><path {...p} d="M3 10h18M7 15h4"/></svg>;
    case "tag":        return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 12V4h8l10 10-8 8L3 12z"/><circle {...p} cx="8" cy="9" r="1.2"/></svg>;
    case "qr":         return <svg viewBox="0 0 24 24" style={s}><rect {...p} x="3" y="3" width="7" height="7"/><rect {...p} x="14" y="3" width="7" height="7"/><rect {...p} x="3" y="14" width="7" height="7"/><path {...p} d="M14 14h3v3M21 14v7M14 21h3"/></svg>;
    case "dumbbell":   return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/></svg>;
    case "chart":      return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 21h18M6 17v-5M11 17V8M16 17v-3M20 17V5"/></svg>;
    case "plus":       return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 5v14M5 12h14"/></svg>;
    case "search":     return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="11" cy="11" r="7"/><path {...p} d="M20 20l-3.5-3.5"/></svg>;
    case "filter":     return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 5h16l-6 8v6l-4 2v-8L4 5z"/></svg>;
    case "bell":       return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 21h4"/></svg>;
    case "arrow-up":   return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 19V5M5 12l7-7 7 7"/></svg>;
    case "arrow-down": return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 5v14M5 12l7 7 7-7"/></svg>;
    case "arrow-right":return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 12h14M12 5l7 7-7 7"/></svg>;
    case "check":      return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 12l5 5L20 7"/></svg>;
    case "flame":      return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3s5 4 5 9a5 5 0 11-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-8z"/></svg>;
    case "whatsapp":   return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 21l1.7-5A8 8 0 1119 18a8 8 0 01-8 1L3 21z"/><path {...p} d="M8.5 9.5c0 3 2 5 5 5l1-1.5-2-1-1 .5c-1 0-2-1-2-2l.5-1-1-2L8 8c0 .5.5 1 .5 1.5z"/></svg>;
    case "logo":       return <svg viewBox="0 0 24 24" style={s}><path fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M4 16L9 6l3 6 3-3 5 9"/></svg>;
    case "more":       return <svg viewBox="0 0 24 24" style={s}><circle cx="5" cy="12" r="1.6" fill={color}/><circle cx="12" cy="12" r="1.6" fill={color}/><circle cx="19" cy="12" r="1.6" fill={color}/></svg>;
    case "wallet":     return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 7a2 2 0 012-2h13v4M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2z"/><circle {...p} cx="17" cy="14" r="1.2"/></svg>;
    case "apple":      return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M16 8c-1.5 0-3 1-4 1s-2.5-1-4-1c-2.5 0-4 2-4 5s2 8 4 8c1 0 1.5-1 3-1s2 1 3 1c1 0 2-1 3-3M14 4c0 1.5-1 3-2.5 3"/></svg>;
    case "google":     return <svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 8v4h5c-.5 2-2 3.5-5 3.5"/></svg>;
    case "play":       return <svg viewBox="0 0 24 24" style={s}><path {...p} d="M7 5l12 7-12 7V5z"/></svg>;
    default: return null;
  }
}
