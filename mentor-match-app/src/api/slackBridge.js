const baseURL = process.env.REACT_APP_SLACK_BRIDGE_URL || ''

export async function postSlackMessage(appConversationId, text, userId) {
  if (!baseURL) return { ok: false, error: 'Slack bridge URL not configured' }
  try {
    const resp = await fetch(`${baseURL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appConversationId, text, userId })
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function createSlackChannel(name, purpose = '') {
  if (!baseURL) return { ok: false, error: 'Slack bridge URL not configured' }
  try {
    const resp = await fetch(`${baseURL}/api/admin/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, purpose })
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    return await resp.json()
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
