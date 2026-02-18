import { EmailBlock } from './blockDefinitions';

export interface GlobalStyles {
  bgColor: string;
  contentBgColor: string;
  contentWidth: number;
  fontFamily: string;
}

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  bgColor: '#f4f4f5',
  contentBgColor: '#ffffff',
  contentWidth: 600,
  fontFamily: 'Arial, sans-serif',
};

function esc(s: string) {
  return s || '';
}

function align(a: string) {
  return a === 'left' || a === 'center' || a === 'right' ? a : 'left';
}

// Social icon SVG-safe colors
const SOCIAL_COLORS: Record<string, string> = {
  Twitter: '#000000',
  LinkedIn: '#0077B5',
  Facebook: '#1877F2',
  Instagram: '#E4405F',
  YouTube: '#FF0000',
  TikTok: '#000000',
  Pinterest: '#E60023',
};

const SOCIAL_LETTERS: Record<string, string> = {
  Twitter: '𝕏',
  LinkedIn: 'in',
  Facebook: 'f',
  Instagram: '✦',
  YouTube: '▶',
  TikTok: '♪',
  Pinterest: 'P',
};

function getGradientBg(p: Record<string, any>, bgColor: string): string {
  if (p.gradientEnabled && p.gradientEndColor) {
    return `background:linear-gradient(${p.gradientDirection || '135deg'}, ${bgColor}, ${p.gradientEndColor});`;
  }
  return `background-color:${bgColor};`;
}

function getBorderCss(p: Record<string, any>): string {
  if (p.borderWidth && p.borderWidth > 0) {
    let css = `border:${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || '#e2e8f0'};`;
    if (p.borderRadius) css += `border-radius:${p.borderRadius}px;`;
    return css;
  }
  return '';
}

function renderBlock(block: EmailBlock): string {
  const p = block.props;
  const px = p.paddingX ?? 24;
  const py = p.paddingY ?? 12;

  switch (block.type) {
    case 'header': {
      const bgCss = getGradientBg(p, esc(p.backgroundColor));
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${bgCss}${getBorderCss(p)}">
  <tr><td align="${align(p.alignment)}" style="padding:${p.paddingY || 32}px ${px}px;">
    ${p.logoUrl ? `<img src="${esc(p.logoUrl)}" alt="Logo" style="max-height:48px;margin-bottom:12px;display:block;margin-left:${p.alignment === 'center' ? 'auto' : '0'};margin-right:${p.alignment === 'center' ? 'auto' : '0'};" /><br/>` : ''}
    <h1 style="margin:0;font-size:${p.fontSize || 28}px;color:${esc(p.textColor)};font-family:Arial,sans-serif;">${esc(p.text)}</h1>
  </td></tr>
</table>`;
    }

    case 'text':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="padding:${py}px ${px}px;font-size:${p.fontSize || 16}px;color:${esc(p.textColor)};line-height:${p.lineHeight || 1.6};text-align:${align(p.alignment)};font-family:Arial,sans-serif;${getBorderCss(p)}">
    ${p.content}
  </td></tr>
</table>`;

    case 'image': {
      const borderCss = getBorderCss(p);
      const imgTag = `<img src="${esc(p.url)}" alt="${esc(p.alt)}" style="width:${esc(p.width)};max-width:100%;display:block;border:0;${borderCss}" />`;
      const linked = p.linkUrl ? `<a href="${esc(p.linkUrl)}" target="_blank">${imgTag}</a>` : imgTag;
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="${align(p.alignment)}" style="padding:${py}px ${px}px;">${linked}</td></tr>
</table>`;
    }

    case 'button': {
      const bgCss = getGradientBg(p, esc(p.backgroundColor));
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="${align(p.alignment)}" style="padding:${py}px ${px}px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td style="${bgCss}border-radius:${p.borderRadius || 6}px;padding:${p.paddingY || 14}px ${p.paddingX || 32}px;">
        <a href="${esc(p.url)}" target="_blank" style="color:${esc(p.textColor)};font-size:${p.fontSize || 16}px;font-family:Arial,sans-serif;text-decoration:none;display:inline-block;font-weight:bold;">${esc(p.text)}</a>
      </td></tr>
    </table>
  </td></tr>
</table>`;
    }

    case 'divider':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="padding:${p.marginY || 20}px ${px}px;">
    <hr style="border:none;border-top:${p.thickness || 1}px solid ${esc(p.color)};margin:0;width:${esc(p.width)};" />
  </td></tr>
</table>`;

    case 'spacer':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="height:${p.height || 32}px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>`;

    case 'columns': {
      const cols = p.columns || [];
      const count = p.columnCount || 2;
      const colWidth = Math.floor(100 / count);
      const colsHtml = cols.slice(0, count).map((col: any) =>
        `<td width="${colWidth}%" valign="top" class="responsive-col" style="padding:8px ${(p.gap || 16) / 2}px;font-family:Arial,sans-serif;font-size:14px;color:#333333;">${col.content || ''}</td>`
      ).join('');
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="padding:${py}px ${px}px;${getBorderCss(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" class="responsive-table"><tr>${colsHtml}</tr></table>
  </td></tr>
</table>`;
    }

    case 'social': {
      const platforms = (p.platforms || []).filter((pl: any) => pl.enabled);
      const icons = platforms.map((pl: any) => {
        const bgColor = SOCIAL_COLORS[pl.name] || '#6b7280';
        const letter = SOCIAL_LETTERS[pl.name] || pl.name[0];
        return `<a href="${esc(pl.url)}" target="_blank" style="display:inline-block;margin:0 5px;width:36px;height:36px;line-height:36px;text-align:center;border-radius:50%;background-color:${bgColor};color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${letter}</a>`;
      }).join('');
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="${align(p.alignment)}" style="padding:${py}px ${px}px;">${icons}</td></tr>
</table>`;
    }

    case 'footer':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center" style="padding:${p.paddingY ?? 24}px ${p.paddingX ?? 24}px;font-size:${p.fontSize || 12}px;color:${esc(p.textColor)};font-family:Arial,sans-serif;line-height:1.5;">
    <p style="margin:0 0 8px;">${esc(p.companyName)}</p>
    <p style="margin:0 0 8px;">${esc(p.address)}</p>
    <p style="margin:0;"><a href="{{unsubscribe_link}}" style="color:${esc(p.textColor)};">${esc(p.unsubscribeText)}</a></p>
  </td></tr>
</table>`;

    case 'video':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="${align(p.alignment)}" style="padding:${py}px ${px}px;">
    <a href="${esc(p.videoUrl)}" target="_blank">
      <img src="${esc(p.thumbnailUrl)}" alt="${esc(p.alt)}" style="max-width:100%;display:block;border:0;${getBorderCss(p)}" />
    </a>
  </td></tr>
</table>`;

    default:
      return '';
  }
}

export function exportBlocksToHtml(blocks: EmailBlock[], styles: GlobalStyles = DEFAULT_GLOBAL_STYLES): string {
  const sorted = [...blocks]
    .filter(b => !b.hidden)
    .sort((a, b) => a.order - b.order);
  const body = sorted.map(renderBlock).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email</title>
<style>
  @media only screen and (max-width: 600px) {
    .responsive-table { width: 100% !important; }
    .responsive-col {
      display: block !important;
      width: 100% !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    img { max-width: 100% !important; height: auto !important; }
    h1 { font-size: 22px !important; }
    td { padding-left: 16px !important; padding-right: 16px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${styles.bgColor};font-family:${styles.fontFamily};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${styles.bgColor};">
  <tr><td align="center" style="padding:24px 0;">
    <table width="${styles.contentWidth}" cellpadding="0" cellspacing="0" border="0" style="background-color:${styles.contentBgColor};max-width:${styles.contentWidth}px;width:100%;">
      <tr><td>
${body}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
