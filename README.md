# Layered Architecture Example in Node.js (POC)
This repository demonstrates a simple implementation of Layered Architecture (also known as data and transport) in a Node.js application.
The goal is to separate the core business logic from external systems such as databases, web frameworks, and other services.

In this example, we will use socket.io and http as primary data and SQS and http as secondary data.

Note:
 - It also includes AWS CloudFormation templates to set up the necessary infrastructure, including SQS queues, Lambda functions, and API Gateway.

# Infrastructure Setup
The infrastructure is defined in the `infra/cloud_formation.yml` file. It includes:
- SQS Queues for message handling.
- API Gateway to expose HTTP endpoints.
- Two Lambda Functions; one to process messages from SQS and another to handle HTTP requests.

To deploy the infrastructure, just copy the `cloud_formation.yml` file to your AWS CloudFormation console and create a new stack.

# Running the Application Locally
0. Copy the `.env.example` file to `.env` and fill in the required environment variables.
1. Install dependencies:
```bash
npm install
```
2. Start the application:
```bash
npm start
# or
npm run dev
```

# Testing the Application
You can test the application using tools like Postman or curl to send HTTP requests to the defined endpoints. You can also use a WebSocket client to connect to the socket.io server and send/receive messages.

## HTTP Adapter
We have the following HTTP endpoints:

### HTTP Endpoint
- Endpoint: `http://localhost:3002/http`
- Method: POST
- Body: JSON with a `message` field.
Example:
```json
{
    "message": "Hello HTTP from HTTP Adapter"
}
```
- Response: Reversed Message and JSON from lambda response.
Example:
```text
Processed HTTP: retpadA PTTH morf PTTH olleH with response: {"message":"Hello from API Lambda!"}
```

#### Example Image 
![HTTP from HTTP Adapter](https://raw.githubusercontent.com/joshuansu0897/layered_example_nodejs/refs/heads/main/documentation/img/http_http.png)


### SQS Endpoint
- Endpoint: `http://localhost:3002/sqs`
- Method: POST
- Body: JSON with a `message` field.
Example:
```json
{
    "message": "Hello SQS from HTTP Adapter"
}
```
- Response: Reversed Message and JSON with SQS MessageId.
Example:
```text
Processed SQS: retpadA PTTH morf SQS olleH with response:
{"MD5OfMessageBody":"cf1abc350dcfef3983f1975df225bbf9","MessageId":"b037964f-bc65-4c8f-8c15-f9e9a6967d37"}
```

#### Example Image 
![SQS from HTTP Adapter](https://raw.githubusercontent.com/joshuansu0897/layered_example_nodejs/refs/heads/main/documentation/img/http_sqs.png)


## Socket.io Adapter
- Connect to the socket.io server at `localhost:3000`

### HTTP Event
- Event: `http`
- Data: message string.
Example:
```text
Hello HTTP from Socket.io Adapter
```
- Listener Event: `http`
- Response: Reversed Message and JSON from lambda response.
Example:
```text
Processed HTTP: retpadA oi.tekcoS morf PTTH olleH with response: {"message":"Hello from API Lambda!"}
```

#### Example Image 
![HTTP from Socket.io Adapter](https://raw.githubusercontent.com/joshuansu0897/layered_example_nodejs/refs/heads/main/documentation/img/socket_http.png)


### SQS Event
- Event: `sqs`
- Data: message string.
Example:
```text
Hello SQS from Socket.io Adapter
```
- Listener Event: `sqs`
- Response: Reversed Message and JSON with SQS MessageId.
Example:
```text
Processed SQS: retpadA oi.tekcoS morf SQS olleH with response: {"MD5OfMessageBody":"9cba91e9ca6ca1645b5bc0ba92d9ab3b","MessageId":"8eae268d-aac3-480d-b0dd-6808590f3cd2"}
```

#### Example Image 
![SQS from Socket.io Adapter](https://raw.githubusercontent.com/joshuansu0897/layered_example_nodejs/refs/heads/main/documentation/img/socket_sqs.png)

# Project Structure
The project is structured as follows:
```
./
├───documentation
│   └───img
├───infra
├───src
│   ├───data
│   ├───domain
│   ├───transport
│   └───utils
└───tests
    ├───data
    ├───domain
    ├───transport
    └───utils
```

- `data/`: How we interact with external systems (e.g., databases, external APIs).
- `domain/`: Contains the core business logic and use cases.
- `transport/`: Handles communication with external clients (e.g., HTTP, WebSocket).
- `utils/`: Contains utility functions and helpers.
- `tests/`: Contains Jest unit tests for all layers.

## Testing
This project includes a comprehensive suite of unit tests built with **Jest**. The tests are designed to run in isolation by mocking external dependencies such as HTTP calls, SQS instances, and Socket.io.

To run the test suite, use the following command:
```bash
npm run test
```

## AWS SDK v3
To ensure long-term support and avoid maintenance mode warnings, this project uses the modular AWS SDK for JavaScript v3 (`@aws-sdk/client-sqs`) to handle interaction with Amazon SQS.
