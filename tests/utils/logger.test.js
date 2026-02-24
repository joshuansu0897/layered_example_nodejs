const logger = require('../../src/utils/logger')

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should format and log info messages correctly', () => {
    logger.log('TestAdapter', 'Test message')
    expect(console.log).toHaveBeenCalledWith('[LOG] (TestAdapter): Test message')
  })

  it('should format and log error messages correctly', () => {
    logger.error('TestAdapter', 'Error message')
    expect(console.error).toHaveBeenCalledWith('[ERROR] (TestAdapter): Error message')
  })
})
