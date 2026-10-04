// Reads research/source-repo/resources/catalog.yml.
// The file uses a small YAML subset (top-level scalars and one list of flat mappings with
// scalar or inline-array values), so a dedicated parser avoids adding a YAML dependency.
// Unexpected structure throws instead of being silently misread.

function scalar(raw) {
  const value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((s) => scalar(s)).filter((s) => s !== '');
  }
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

export function parseCatalog(text) {
  const result = { resources: [] };
  let inList = false;
  let current = null;
  text.replace(/\r\n?/g, '\n').split('\n').forEach((line, index) => {
    if (!line.trim() || line.trim().startsWith('#')) return;
    const top = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (top) {
      inList = top[1] === 'resources' && top[2] === '';
      if (!inList) result[top[1]] = scalar(top[2]);
      return;
    }
    const item = line.match(/^\s+-\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    const field = line.match(/^\s{3,}([A-Za-z_][\w-]*):\s*(.*)$/);
    if (inList && item) {
      current = { [item[1]]: scalar(item[2]) };
      result.resources.push(current);
    } else if (inList && field && current) {
      current[field[1]] = scalar(field[2]);
    } else {
      throw new Error(`catalog.yml line ${index + 1}: unsupported structure: ${line}`);
    }
  });
  for (const r of result.resources) {
    for (const key of ['id', 'title', 'url', 'status']) if (!r[key]) throw new Error(`catalog.yml: resource without ${key}`);
  }
  return result;
}
