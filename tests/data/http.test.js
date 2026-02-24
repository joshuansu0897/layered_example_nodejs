const httpPort = require('../../src/data/http')
const logger = require('../../src/utils/logger')

jest.mock('../../src/utils/logger')

describe('Data Layer - HTTP', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    process.env.SERVICE_URL = 'http://test-url.com'
  })

  afterAll(() => {
    delete global.fetch
    delete process.env.SERVICE_URL
  })

  it('should return a JSON response on success', async () => {
    const mockJson = { message: 'Success' }
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockJson)
    })

    const result = await httpPort.handleHTTPCall('test message')

    expect(global.fetch).toHaveBeenCalledWith('http://test-url.com')
    expect(result).toEqual(mockJson)
    expect(logger.log).toHaveBeenCalledWith('HTTP:Port', 'Making HTTP call with message: test message')
    expect(logger.log).toHaveBeenCalledWith('HTTP:Port', `Received response: ${JSON.stringify(mockJson)}`)
  })

  it('should handle fetch errors gracefully', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    })

    const result = await httpPort.handleHTTPCall('test message')

    expect(result).toEqual({ ok: false, status: 404 })
    expect(logger.error).toHaveBeenCalledWith('HTTP:Port', 'Error during HTTP call: HTTP error! status: 404')
  })

  it('should catch unhandled exceptions', async () => {
    const errorMsg = 'Network Error'
    global.fetch.mockRejectedValue(new Error(errorMsg))

    const result = await httpPort.handleHTTPCall('test message')

    expect(result).toBeNull()
    expect(logger.error).toHaveBeenCalledWith('HTTP:Port', `Error during HTTP call: ${errorMsg}`)
  })
})
