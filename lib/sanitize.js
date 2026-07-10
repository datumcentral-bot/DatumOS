// Sanitize form data: convert empty strings to null for optional fields
export function sanitize(body) {
  const out = {}
  for (const [k, v] of Object.entries(body)) {
    if (v === '' || v === undefined) out[k] = null
    else out[k] = v
  }
  return out
}
