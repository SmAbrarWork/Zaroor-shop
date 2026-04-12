import swaggerJSDoc from 'swagger-jsdoc'

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Zeroor Shop Server API',
    version: '1.0.0',
    description: 'API documentation for backend testing.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local server',
    },
  ],
  components: {
    schemas: {
      Theme: {
        type: 'object',
        properties: {
          primary: { type: 'string', example: '#020617' },
          accent: { type: 'string', example: '#f59e0b' },
          text: { type: 'string', example: '#ffffff' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '67f24c9aa733357703b35d27' },
          name: { type: 'string', example: 'Ramadan Drop' },
          slug: { type: 'string', example: 'ramadan' },
          theme: { $ref: '#/components/schemas/Theme' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
      TrackingRequest: {
        type: 'object',
        required: ['eventName'],
        properties: {
          eventName: { type: 'string', example: 'purchase' },
          payload: {
            type: 'object',
            additionalProperties: true,
            example: { orderId: 'ORD-1001', amount: 4999 },
          },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Server is healthy' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/events': {
      get: {
        tags: ['Events'],
        summary: 'List events',
        responses: {
          200: {
            description: 'List of events',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Event' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tracking': {
      post: {
        tags: ['Tracking'],
        summary: 'Track an event',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TrackingRequest' },
            },
          },
        },
        responses: {
          202: {
            description: 'Event accepted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', additionalProperties: true },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'eventName is required' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

export const swaggerSpec = swaggerJSDoc({
  definition,
  apis: [],
})
