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

function renderBlock(block: EmailBlock): string {
  const p = block.props;
  switch (block.type) {
    case 'header':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${esc(p.backgroundColor)};">
  <tr><td align="${align(p.alignment)}" style="padding:${p.paddingY || 32}px 24px;">
    ${p.logoUrl ? `<img src="${esc(p.logoUrl)}" alt="Logo" style="max-height:48px;margin-bottom:12px;display:block;margin-left:${p.alignment === 'center' ? 'auto' : '0'};margin-right:${p.alignment === 'center' ? 'auto' : '0'};" /><br/>` : ''}
    <h1 style="margin:0;font-size:${p.fontSize || 28}px;color:${esc(p.textColor)};font-family:Arial,sans-serif;">${esc(p.text)}</h1>
  </td></tr>
</table>`;

    case 'text':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="padding:${p.paddingY || 12}px 24px;font-size:${p.fontSize || 16}px;color:${esc(p.textColor)};line-height:${p.lineHeight || 1.6};text-align:${align(p.alignment)};font-family:Arial,sans-serif;">
    ${p.content}
  </td></tr>
</table>`;

    case 'image':
      const imgTag = `<img src="${esc(p.url)}" alt="${esc(p.alt)}" style="width:${esc(p.width)};max-width:100%;display:block;border:0;" />`;
      const linked = p.linkUrl ? `<a href="${esc(p.linkUrl)}" target="_blank">${imgTag}</a>` : imgTag;
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="${align(p.alignment)}" style="padding:12px 24px;">${linked}</td></tr>
</table>`;

    case 'button':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="${align(p.alignment)}" style="padding:16px 24px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background-color:${esc(p.backgroundColor)};border-radius:${p.borderRadius || 6}px;padding:${p.paddingY || 14}px ${p.paddingX || 32}px;">
        <a href="${esc(p.url)}" target="_blank" style="color:${esc(p.textColor)};font-size:${p.fontSize || 16}px;font-family:Arial,sans-serif;text-decoration:none;display:inline-block;font-weight:bold;">${esc(p.text)}</a>
      </td></tr>
    </table>
  </td></tr>
</table>`;

    case 'divider':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="padding:${p.marginY || 20}px 24px;">
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
        `<td width="${colWidth}%" valign="top" style="padding:8px ${(p.gap || 16) / 2}px;font-family:Arial,sans-serif;font-size:14px;color:#333333;">${col.content || ''}</td>`
      ).join('');
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="padding:12px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${colsHtml}</tr></table>
  </td></tr>
</table>`;
    }

    case 'social': {
      const platforms = (p.platforms || []).filter((pl: any) => pl.enabled);
      const icons = platforms.map((pl: any) =>
        `<a href="${esc(pl.url)}" target="_blank" style="display:inline-block;margin:0 6px;color:#3b82f6;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">${pl.name}</a>`
      ).join(' ');
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="${align(p.alignment)}" style="padding:16px 24px;">${icons}</td></tr>
</table>`;
    }

    case 'footer':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center" style="padding:24px;font-size:${p.fontSize || 12}px;color:${esc(p.textColor)};font-family:Arial,sans-serif;line-height:1.5;">
    <p style="margin:0 0 8px;">${esc(p.companyName)}</p>
    <p style="margin:0 0 8px;">${esc(p.address)}</p>
    <p style="margin:0;"><a href="{{unsubscribe_link}}" style="color:${esc(p.textColor)};">${esc(p.unsubscribeText)}</a></p>
  </td></tr>
</table>`;

    case 'video':
      return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="${align(p.alignment)}" style="padding:12px 24px;">
    <a href="${esc(p.videoUrl)}" target="_blank">
      <img src="${esc(p.thumbnailUrl)}" alt="${esc(p.alt)}" style="max-width:100%;display:block;border:0;" />
    </a>
  </td></tr>
</table>`;

    default:
      return '';
  }
}

export function exportBlocksToHtml(blocks: EmailBlock[], styles: GlobalStyles = DEFAULT_GLOBAL_STYLES): string {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const body = sorted.map(renderBlock).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email</title>
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
