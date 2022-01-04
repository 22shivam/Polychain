require('source-map-support/register')
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./index.ts')

exports.handler = serverlessExpress({ app })
