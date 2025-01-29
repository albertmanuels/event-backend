import swaggerAutogen from "swagger-autogen";

const outputFile = "./swagger_output.json" // final json file that holds swagger configs
const endpointsFiles = ["../routes/api"] // path to check existing api

// swagger documentation structures
const doc = {
  info: {
    version: "v0.0.1",
    title: "Event API Documentation",
    description: "Event API Documentation"
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local Server",
    },
    {
      url: "https://event-backend-lac.vercel.app/api",
      description: "Deploy Server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer"
      }
    },
    schemas: {
      LoginRequest: {
        identifier: "albert10@gmail.com",
        password: "123123"
      },
      RegisterRequest: {
        fullName: "Albert M",
        email: "albert10@yopmail.com",
        username: "albert10",
        password: "123123",
        confirmPassword: "123123"
      },
      ActivationRequest: {
        code: 'abc123'
      }
    }
  }
}

swaggerAutogen({openapi: "3.0.0"})(outputFile, endpointsFiles, doc)