const AWS = require('aws-sdk')
const logger = require('../../src/utils/logger')

jest.mock('../../src/utils/logger')
jest.mock('aws-sdk')

// Setup env variables BEFORE requiring the module being tested
process.env.AWS_REGION = 'us-east-1'
process.env.AWS_ACCESS_KEY_ID = 'test'
process.env.AWS_SECRET_ACCESS_KEY = 'test'
process.env.SQS_QUEUE_URL = 'http://sqs-test-url'

// Mock the SQS class and its instances
const mockSendMessagePromise = jest.fn()
AWS.SQS.mockImplementation(() => ({
  sendMessage: () => ({
    promise: mockSendMessagePromise
  })
}))

const sqsPort = require('../../src/data/sqs')

describe('Data Layer - SQS', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSendMessagePromise.mockReset()
  })

  it('should send message to SQS successfully', async () => {
    const mockResponse = { MessageId: 'mock-12345' }
    mockSendMessagePromise.mockResolvedValue(mockResponse)

    const result = await sqsPort.sendMessageToSQS('test sqs msg')

    expect(result).toEqual(mockResponse)
    expect(logger.log).toHaveBeenCalledWith('SQSPort', 'Sending message to SQS: test sqs msg')
    expect(logger.log).toHaveBeenCalledWith('SQSPort', 'Message sent to SQS with ID: mock-12345')
  })

  it('should handle SQS errors gracefully', async () => {
    const errorMsg = 'SQS Error'
    mockSendMessagePromise.mockRejectedValue(new Error(errorMsg))

    const result = await sqsPort.sendMessageToSQS('test sqs msg')

    expect(result).toBeNull()
    expect(logger.error).toHaveBeenCalledWith('SQSPort', `Failed to send message to SQS: ${errorMsg}`)
  })
})
