require('source-map-support/register')
const serverlessExpress = require('@vendia/serverless-express')
import app from './index'

exports.handler = serverlessExpress({ app })
