import axios from 'axios'

// Without proxy: false, axios picks up HTTP_PROXY / HTTPS_PROXY from the
// environment and routes calls through it. On dev this caused ECONNREFUSED
// on every outbound request. All services import this instead of axios directly.
const httpClient = axios.create({ proxy: false })

export default httpClient
