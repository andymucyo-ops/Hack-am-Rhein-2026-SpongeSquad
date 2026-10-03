// Minimal, dependency-free Markdown → HTML renderer for the research and planning documents.
// Supports what those documents use: headings, paragraphs, nested lists, pipe tables, fenced code,
// blockquotes, rules, inline code, links, bare URLs, bold and italic. Raw HTML is escaped.

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function slugify(text) {
  return String(text).toLowerCase().replace(/<[^>]+>/g, '').replace(/[`*_~]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');
}

function inline(text, ctx) {
  const tokens = [];
  const keep = (html) => `\u0000${tokens.push(html) - 1}\u0000`;
  let s = text;
  s = s.replace(/\\([\\`*_{}\[\]()#+\-.!|>])/g, (_, c) => keep(escapeHtml(c)));
  s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => keep(`<code>${escapeHtml(code.trim())}</code>`));
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => keep(`<a href="${escapeHtml(ctx.link(url))}">${escapeHtml(alt || url)}</a>`));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, url) => {
    const href = ctx.link(url);
    const external = /^https?:/i.test(href);
    return keep(`<a href="${escapeHtml(href)}"${external ? ' rel="noreferrer"' : ''}>${inline(label, ctx)}</a>`);
  });
  s = s.replace(/<(https?:\/\/[^>\s]+)>/g, (_, url) => keep(`<a href="${escapeHtml(url)}" rel="noreferrer">${escapeHtml(url)}</a>`));
  s = s.replace(/https?:\/\/[^\s<>)\]]+[^\s<>)\].,;:!?'"]/g, (url) => keep(`<a href="${escapeHtml(url)}" rel="noreferrer">${escapeHtml(url)}</a>`));
  s = escapeHtml(s);
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+?)__/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>').replace(/(^|[^_\w])_([^_\s][^_]*?)_(?!\w)/g, '$1<em>$2</em>');
  s = s.replace(/ {2,}\n/g, '<br>\n');
  for (let i = 0; i < 3 && s.includes('\u0000'); i++) s = s.replace(/\u0000(\d+)\u0000/g, (_, n) => tokens[Number(n)]);
  return s;
}

function splitRow(line) {
  let row = line.trim();
  if (row.startsWith('|')) row = row.slice(1);
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);
  const cells = [];
  let cell = '';
  let inCode = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (c === '\\' && row[i + 1] === '|') { cell += '|'; i++; continue; }
    if (c === '`') inCode = !inCode;
    if (c === '|' && !inCode) { cells.push(cell.trim()); cell = ''; continue; }
    cell += c;
  }
  cells.push(cell.trim());
  return cells;
}

const listMarker = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

function renderList(lines, ctx) {
  // lines: raw lines belonging to one list block
  const items = [];
  const baseIndent = lines[0].match(listMarker)[1].length;
  const ordered = /\d/.test(lines[0].match(listMarker)[2]);
  let current = null;
  for (const line of lines) {
    const m = line.match(listMarker);
    if (m && m[1].length <= baseIndent + 1) {
      current = { text: [m[3]], children: [] };
      items.push(current);
    } else if (current) {
      if (m || current.children.length) current.children.push(line.slice(Math.min(baseIndent + 2, line.search(/\S|$/))));
      else current.text.push(line.trim());
    }
  }
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((it) => `<li>${inline(it.text.join('\n'), ctx)}${it.children.length ? renderBlocks(it.children, ctx) : ''}</li>`).join('')}</${tag}>`;
}

function renderBlocks(lines, ctx) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = line.match(/^\s*(```+|~~~+)\s*([\w-]*)/);
    if (fence) {
      const close = fence[1];
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(close)) body.push(lines[i++]);
      i++;
      const lang = fence[2] ? ` class="language-${escapeHtml(fence[2])}"` : '';
      const note = fence[2] === 'mermaid' ? '<p class="tiny">Diagram source (Mermaid). It renders as a diagram on GitHub.</p>' : '';
      out.push(`${note}<pre><code${lang}>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length;
      const id = slugify(heading[2]);
      out.push(`<h${level} id="${escapeHtml(id)}">${inline(heading[2], ctx)}</h${level}>`);
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]));
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${inline(h, ctx)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, ctx)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${renderBlocks(body, ctx)}</blockquote>`);
      continue;
    }
    if (listMarker.test(line)) {
      const block = [];
      while (i < lines.length) {
        const l = lines[i];
        if (!l.trim()) {
          const next = lines[i + 1];
          if (next !== undefined && (listMarker.test(next) || /^\s{2,}\S/.test(next))) { i++; continue; }
          break;
        }
        if (!listMarker.test(l) && !/^\s/.test(l) && block.length && !/^\s*$/.test(l)) {
          // lazy continuation of the previous item
          block.push('  ' + l);
          i++;
          continue;
        }
        block.push(l);
        i++;
      }
      out.push(renderList(block, ctx));
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s/.test(lines[i]) && !/^\s*(```|~~~)/.test(lines[i]) && !(lines[i].trim().startsWith('|') && para.length === 0) && !/^\s*>/.test(lines[i]) && !(listMarker.test(lines[i]) && para.length === 0)) {
      if (listMarker.test(lines[i])) break;
      para.push(lines[i++]);
    }
    if (!para.length) { out.push(`<p>${inline(lines[i++], ctx)}</p>`); continue; }
    out.push(`<p>${inline(para.join('\n'), ctx)}</p>`);
  }
  return out.join('\n');
}

export function renderMarkdown(source, { link = (url) => url } = {}) {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  return renderBlocks(lines, { link });
}

export function firstHeading(source) {
  const m = String(source).match(/^#\s+(.+)$/m);
  return m ? m[1].replace(/[`*_]/g, '').trim() : null;
}

// Returns the Markdown of one section (heading line included) up to the next heading of the same or higher level.
export function extractSection(source, title) {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((l) => /^#{1,6}\s/.test(l) && l.replace(/^#+\s+/, '').trim() === title);
  if (start < 0) throw new Error(`Section not found: ${title}`);
  const level = lines[start].match(/^#+/)[0].length;
  let end = lines.length;
  let inFence = false;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) inFence = !inFence;
    const m = !inFence && lines[i].match(/^(#{1,6})\s/);
    if (m && m[1].length <= level) { end = i; break; }
  }
  return lines.slice(start, end).join('\n');
}
