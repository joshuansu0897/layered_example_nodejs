'use strict'

const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs')
const logger = require('../../src/utils/logger')

jest.mock('../../src/utils/logger')
jest.mock('@aws-sdk/client-sqs')

// Setup env variables BEFORE requiring the module being tested
process.env.AWS_REGION = 'us-east-1'
process.env.AWS_ACCESS_KEY_ID = 'test'
process.env.AWS_SECRET_ACCESS_KEY = 'test'
process.env.SQS_QUEUE_URL = 'http://sqs-test-url'

// Mock the SQS client send method
const mockSend = jest.fn()
SQSClient.mockImplementation(() => ({
  send: mockSend
}))

const sqsPort = require('../../src/data/sqs')

describe('Data Layer - SQS', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSend.mockReset()
  })

  it('should send message to SQS successfully', async () => {
    const mockResponse = { MessageId: 'mock-12345' }
    mockSend.mockResolvedValue(mockResponse)

    const result = await sqsPort.sendMessageToSQS('test sqs msg')

    expect(result).toEqual(mockResponse)

    // Verify SendMessageCommand was instantiated with right params
    expect(SendMessageCommand).toHaveBeenCalledWith({
      QueueUrl: 'http://sqs-test-url',
      MessageBody: 'test sqs msg'
    })

    expect(logger.log).toHaveBeenCalledWith('SQSPort', 'Sending message to SQS: test sqs msg')
    expect(logger.log).toHaveBeenCalledWith('SQSPort', 'Message sent to SQS with ID: mock-12345')
  })

  it('should handle SQS errors gracefully', async () => {
    const errorMsg = 'SQS Error'
    mockSend.mockRejectedValue(new Error(errorMsg))

    const result = await sqsPort.sendMessageToSQS('test sqs msg')

    expect(result).toBeNull()
    expect(logger.error).toHaveBeenCalledWith('SQSPort', `Failed to send message to SQS: ${errorMsg}`)
  })
})
