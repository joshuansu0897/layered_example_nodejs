'use strict'

// Mock dependencies
jest.mock('../../src/domain/business_logic')
jest.mock('../../src/utils/logger')

const logger = require('../../src/utils/logger')

// Create stable mock functions
const mockSocketOn = jest.fn()
const mockSocketEmit = jest.fn()
const mockIoOn = jest.fn()

// Mock socket.io Server
jest.mock('socket.io', () => {
  return {
    Server: jest.fn().mockImplementation(() => {
      return {
        on: mockIoOn,
      }
    }),
  }
})

describe('Socket Transport Adapter', () => {
  let mockSocket

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()

    mockSocketOn.mockReset()
    mockSocketEmit.mockReset()
    mockIoOn.mockReset()

    process.env.SOCKET_PORT = '3006'

    mockSocket = {
      id: 'test-socket-id',
      on: mockSocketOn,
      emit: mockSocketEmit
    }

    // Require the module, which will instantiate Server and call io.on('connection')
    require('../../src/transport/socket')
  })

  it('should handle socket connection event', () => {
    // Find the connection event that was registered when the module was required
    expect(mockIoOn).toHaveBeenCalledWith('connection', expect.any(Function))

    // Trigger the connection callback manually
    const connectionCall = mockIoOn.mock.calls.find(call => call[0] === 'connection')
    expect(connectionCall).toBeDefined()

    const connectionCallback = connectionCall[1]
    connectionCallback(mockSocket)

    // Retrieve the active mock instance of logger created AFTER jest.resetModules()
    const activeLoggerMock = require('../../src/utils/logger')

    // Verify that the logger was called with the correct message upon connection
    expect(activeLoggerMock.log).toHaveBeenCalledWith('Socket:Adapter', `user connected: ${mockSocket.id}`)
  })

  it('should process incoming http events', async () => {
    // Trigger the connection explicitly to register inner socket events
    const connectionCall = mockIoOn.mock.calls.find(call => call[0] === 'connection')
    const connectionCallback = connectionCall[1]
    connectionCallback(mockSocket)

    // Retrieve active mocks
    const activeLoggerMock = require('../../src/utils/logger')
    const activeBusinessLogicMock = require('../../src/domain/business_logic')

    const httpCall = mockSocketOn.mock.calls.find(call => call[0] === 'http')
    expect(httpCall).toBeDefined()
    const httpCallback = httpCall[1]

    const testMsg = 'socket query HTTP'
    const mockDomainResponse = 'mocked HTTP result'
    activeBusinessLogicMock.processHTTPMessage.mockResolvedValue(mockDomainResponse)

    // trigger the event
    await httpCallback(testMsg)

    expect(activeLoggerMock.log).toHaveBeenCalledWith('Socket:Adapter', `HTTP - message: ${testMsg}`)
    expect(activeBusinessLogicMock.processHTTPMessage).toHaveBeenCalledWith(testMsg)
    expect(mockSocketEmit).toHaveBeenCalledWith('http', mockDomainResponse)
  })

  it('should process incoming sqs events', async () => {
    // Trigger the connection explicitly to register inner socket events
    const connectionCall = mockIoOn.mock.calls.find(call => call[0] === 'connection')
    const connectionCallback = connectionCall[1]
    connectionCallback(mockSocket)

    // Retrieve active mocks
    const activeLoggerMock = require('../../src/utils/logger')
    const activeBusinessLogicMock = require('../../src/domain/business_logic')

    const sqsCall = mockSocketOn.mock.calls.find(call => call[0] === 'sqs')
    expect(sqsCall).toBeDefined()
    const sqsCallback = sqsCall[1]

    const testMsg = 'socket query SQS'
    const mockDomainResponse = 'mocked SQS result'
    activeBusinessLogicMock.processSQSMessage.mockResolvedValue(mockDomainResponse)

    // trigger the event
    await sqsCallback(testMsg)

    expect(activeLoggerMock.log).toHaveBeenCalledWith('Socket:Adapter', `SQS - message: ${testMsg}`)
    expect(activeBusinessLogicMock.processSQSMessage).toHaveBeenCalledWith(testMsg)
    expect(mockSocketEmit).toHaveBeenCalledWith('sqs', mockDomainResponse)
  })

  it('should handle disconnect event', () => {
    // Trigger the connection
    const connectionCall = mockIoOn.mock.calls.find(call => call[0] === 'connection')
    const connectionCallback = connectionCall[1]
    connectionCallback(mockSocket)

    // Retrieve active logger mock
    const activeLoggerMock = require('../../src/utils/logger')

    // extract the 'disconnect' callback
    const disconnectCall = mockSocketOn.mock.calls.find(call => call[0] === 'disconnect')
    expect(disconnectCall).toBeDefined()
    const disconnectCallback = disconnectCall[1]

    disconnectCallback()

    expect(activeLoggerMock.log).toHaveBeenCalledWith('Socket:Adapter', 'user disconnected')
  })
})
