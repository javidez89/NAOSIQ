import { readFileSync, writeFileSync } from 'node:fs';

const t = JSON.parse(readFileSync('src/config/naosiq-tokens.json', 'utf8').replace(/^\uFEFF/, ''));
const vars = {
  ink: t.ui_proposal.text, muted: t.ui_proposal.muted, surface: t.ui_proposal.surface,
  bg: t.ui_proposal.background, line: t.ui_proposal.border, accent: t.brand.primary,
  'accent-soft': t.ui_proposal.purpleTint, navigation: t.brand.night,
  'primary-hover': t.ui_proposal.primaryHover, 'control-border': t.ui_proposal.controlBorder,
  focus: t.ui_proposal.focus, cyan: t.brand.cyan, ice: t.brand.ice,
  'cyan-text': t.ui_proposal.cyanText, 'cyan-tint': t.ui_proposal.cyanTint,
  danger: t.ui_proposal.errorText, error: t.semantic.error, 'error-tint': t.ui_proposal.errorTint,
  warning: t.semantic.warning, 'warning-text': t.ui_proposal.warningText, 'warning-tint': t.ui_proposal.warningTint,
  success: t.semantic.success, 'success-text': t.ui_proposal.successText, 'success-tint': t.ui_proposal.successTint,
  'font-brand': 'Montserrat, var(--font-inter), Inter, Arial, sans-serif',
  'font-ui': 'var(--font-inter), Inter, Arial, sans-serif',
  'font-size-hero': `${t.typography.size.hero}px`, 'font-size-h1': `${t.typography.size.h1}px`,
  'font-size-h2': `${t.typography.size.h2}px`, 'font-size-h3': `${t.typography.size.h3}px`,
  'font-size-body': `${t.typography.size.body}px`, 'font-size-label': `${t.typography.size.label}px`,
  'font-size-meta': `${t.typography.size.meta}px`, 'line-height-body': t.typography.lineHeight.body,
  'line-height-heading': t.typography.lineHeight.heading,
  ...Object.fromEntries(t.spacing.map((value) => [`space-${value}`, `${value}px`])),
  'radius-input': `${t.radius.input}px`, 'radius-button': `${t.radius.button}px`,
  'radius-card': `${t.radius.card}px`, 'radius-large': `${t.radius.large}px`,
  'radius-badge': `${t.radius.badge}px`, radius: `${t.radius.card}px`,
  'control-min-height': `${t.control.minTouchHeight}px`,
  'focus-width': `${t.control.focusWidth}px`, 'focus-offset': `${t.control.focusOffset}px`,
};
const css = `/* Generated from src/config/naosiq-tokens.json. */\n:root {\n${Object.entries(vars).map(([key, value]) => `  --${key}: ${value};`).join('\n')}\n}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync('src/app/naosiq-tokens.css', 'utf8') !== css) throw new Error('NAOSIQ CSS tokens are out of sync.');
  console.log('NAOSIQ CSS tokens match the approved source.');
} else writeFileSync('src/app/naosiq-tokens.css', css);
