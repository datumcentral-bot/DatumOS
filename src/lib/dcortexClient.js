/**
 * DCORTEX V1 Canonical Backend Client
 *
 * SERVER-SIDE ONLY — never import in client components.
 *
 * Provides server-to-server identity exchange (POST /auth/datumos-exchange)
 * + cached JWT bearer tokens for all canonical DCORTEX gateway endpoints.
 *
 * The DCORTEX_DATUMOS_PROXY_SECRET is read from process.env.server-only
 * and is NEVER exposed to the browser.
 */

const DCORTEX_URL = process.env.DCORTEX_API_URL || 'http://127.0.0.1:8799'
const PROXY_SECRET = process.env.DCORTEX_DATUMOS_PROXY_SECRET

const TOKEN_TTL_MS = 55 * 60 * 1000
const tokenCache = new Map()

function validateConfig() {
  if (!PROXY_SECRET) {
    throw new DcortexError(
      'DCORTEX_DATUMOS_PROXY_SECRET is not configured',
      503
    )
  }
  if (!process.env.DCORTEX_API_URL) {
    throw new DcortexError(
      'DCORTEX_API_URL is not configured',
      503
    )
  }
}

function buildIdentity(session) {
  if (!session?.user) {
    throw new DcortexError('Not authenticated', 401)
  }

  const roleMap = {
    DIRECTOR: 'DIRECTOR',
    MEMBER: 'WORKSPACE',
    CLIENT: 'CLIENT',
  }

  return {
    user_id: session.user.id || session.user.userId,
    username: session.user.name || session.user.username,
    email: session.user.email,
    roles: roleMap[session.user.role]
      ? [roleMap[session.user.role]]
      : [session.user.role],
  }
}

async function exchangeToken(identity) {
  validateConfig()

  const cacheKey = identity.user_id
  const cached = tokenCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token
  }

  const res = await fetch(`${DCORTEX_URL}/auth/datumos-exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-datumos-proxy-secret': PROXY_SECRET,
    },
    body: JSON.stringify({
      user_id: identity.user_id,
      username: identity.username,
      email: identity.email,
      roles: identity.roles,
    }),
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new DcortexError(
      `Auth exchange failed: ${res.status} ${errText}`,
      res.status === 503 ? 503 : 503
    )
  }

  const data = await res.json()
  const token = data.access_token

  tokenCache.set(cacheKey, {
    token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  })

  return token
}

async function apiCall(token, path, options = {}) {
  const url = `${DCORTEX_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new DcortexError(
      `DCORTEX API error: ${res.status} ${res.statusText}`,
      res.status
    )
  }

  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}

function buildQueryString(params) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, String(v)))
    } else {
      qs.append(key, String(value))
    }
  }
  const str = qs.toString()
  return str ? `?${str}` : ''
}

export class DcortexError extends Error {
  constructor(message, status = 503) {
    super(message)
    this.name = 'DcortexError'
    this.status = status
  }
}

export class DcortexClient {
  constructor(identity) {
    this.identity = identity
    this._token = null
  }

  async getToken() {
    if (!this._token) {
      this._token = await exchangeToken(this.identity)
    }
    return this._token
  }

  async request(path, method = 'GET', body = null, params = {}) {
    const token = await this.getToken()
    const qs = buildQueryString(params)
    const options = { method }
    if (body) {
      options.headers = { 'Content-Type': 'application/json' }
      options.body = JSON.stringify(body)
    }
    return apiCall(token, `${path}${qs}`, options)
  }

  async getHealth() {
    return this.request('/health')
  }

  async getNodes() {
    return this.request('/nodes')
  }

  async getNode(nodeId) {
    return this.request(`/nodes/${nodeId}`)
  }

  async getAgents() {
    return this.request('/ai/agents')
  }

  async getAgent(agentId) {
    return this.request(`/ai/agents/${agentId}`)
  }

  async getBimElements(params = {}) {
    return this.request('/bim/elements', 'GET', null, params)
  }

  async getBimElement(elementId, params = {}) {
    return this.request(`/bim/elements/${elementId}`, 'GET', null, params)
  }

  async getClashes(params = {}) {
    return this.request('/bim/clash/findings', 'GET', null, params)
  }

  async getClashSummary(params = {}) {
    return this.request('/bim/clash/summary', 'GET', null, params)
  }

  async getClashPrioritized(params = {}) {
    return this.request('/bim/clash/prioritized', 'GET', null, params)
  }

  async getClashRules(params = {}) {
    return this.request('/bim/clash/rules', 'GET', null, params)
  }

  async runClashSuite(body = {}) {
    return this.request('/bim/clash/run-suite', 'POST', body)
  }

  async getQaRules(params = {}) {
    return this.request('/bim/qa/rules', 'GET', null, params)
  }

  async getQaSummary(params = {}) {
    return this.request('/bim/qa/summary', 'GET', null, params)
  }

  // DN035 engineering advisory surface: canonical engineering calculators plus
  // live model-grounded discipline signals. Read-only.
  async getEngineering(params = {}) {
    return this.request('/bim/engineering', 'GET', null, params)
  }

  // DN015 / DN016 truthful element-class reads. A ViewSheet and a ViewSchedule
  // are distinct Revit classes from View and are never inferred from one another.
  async getSheets(params = {}) {
    return this.request('/revit/sheets', 'GET', null, params)
  }

  async getSchedules(params = {}) {
    return this.request('/revit/schedules', 'GET', null, params)
  }

  async getRevitFamilies(params = {}) {
    return this.request('/revit/families', 'GET', null, params)
  }

  // DN027 live Revit entry-command registry (read from the loaded addin assembly).
  async getRevitCommands(params = {}) {
    return this.request('/revit/commands', 'GET', null, params)
  }

  // DN030 live Revit context reads.
  async getRevitSelection(params = {}) {
    return this.request('/revit/selection', 'GET', null, params)
  }

  async getRevitDocument(params = {}) {
    return this.request('/revit/document', 'GET', null, params)
  }

  async getQaRuntime() {
    return this.request('/bim/qa/runtime', 'GET', null, {})
  }

  async runQaSuite(body = {}) {
    return this.request('/bim/qa/run-suite', 'POST', body)
  }

  async getSpatialNear(params = {}) {
    return this.request('/bim/spatial/near', 'GET', null, params)
  }

  async getSpatialInside(params = {}) {
    return this.request('/bim/spatial/inside', 'GET', null, params)
  }

  async getSpatialFlow(params = {}) {
    return this.request('/bim/spatial/flow', 'GET', null, params)
  }

  async getSpatialPath(params = {}) {
    return this.request('/bim/spatial/path', 'GET', null, params)
  }

  async getSpatialRelated(params = {}) {
    return this.request('/bim/spatial/related', 'GET', null, params)
  }

  async getSpatialDescribe(elementId, params = {}) {
    return this.request(`/bim/spatial/describe/${elementId}`, 'GET', null, params)
  }

  async getRevitHealth() {
    return this.request('/revit/health')
  }

  async getAiModels() {
    return this.request('/ai/models')
  }

  async aiChat(messages, model, projectId) {
    return this.request(
      '/ai/chat',
      'POST',
      { messages, model, project_id: projectId }
    )
  }

  async getModelHealth(projectId) {
    return this.request('/bim/model/health', 'GET', null, { project_id: projectId })
  }
}

export async function getDcortexClient(session) {
  const identity = buildIdentity(session)
  return new DcortexClient(identity)
}
