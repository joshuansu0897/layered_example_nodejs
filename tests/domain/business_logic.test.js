const businessLogic = require('../../src/domain/business_logic')
const httpPort = require('../../src/data/http')
const sqsPort = require('../../src/data/sqs')
const logger = require('../../src/utils/logger')

// Mock dependencies
jest.mock('../../src/data/http')
jest.mock('../../src/data/sqs')
jest.mock('../../src/utils/logger')

describe('Business Logic Domain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('processHTTPMessage', () => {
    it('should process the message, call http port, and return the formatted response', async () => {
      const originalMsg = 'hello'
      const reversedMsg = 'olleh'
      const mockResponse = { status: 'success' }

      httpPort.handleHTTPCall.mockResolvedValue(mockResponse)

      const result = await businessLogic.processHTTPMessage(originalMsg)

      expect(logger.log).toHaveBeenCalledWith('BusinessLogic', `Processing HTTP message in business logic: ${originalMsg}`)
      expect(logger.log).toHaveBeenCalledWith('BusinessLogic', 'Executing secret business function')

      expect(httpPort.handleHTTPCall).toHaveBeenCalledWith(reversedMsg)
      expect(result).toBe(`Processed HTTP: ${reversedMsg} with response: ${JSON.stringify(mockResponse)}`)
    })
  })

  describe('processSQSMessage', () => {
    it('should process the message, call sqs port, and return the formatted response', async () => {
      const originalMsg = 'world'
      const reversedMsg = 'dlrow'
      const mockResponse = { MessageId: '12345' }

      sqsPort.sendMessageToSQS.mockResolvedValue(mockResponse)

      const result = await businessLogic.processSQSMessage(originalMsg)

      expect(logger.log).toHaveBeenCalledWith('BusinessLogic', `Processing SQS message in business logic: ${originalMsg}`)
      expect(logger.log).toHaveBeenCalledWith('BusinessLogic', 'Executing secret business function')

      expect(sqsPort.sendMessageToSQS).toHaveBeenCalledWith(reversedMsg)
      expect(result).toBe(`Processed SQS: ${reversedMsg} with response: ${JSON.stringify(mockResponse)}`)
    })
  })
})
