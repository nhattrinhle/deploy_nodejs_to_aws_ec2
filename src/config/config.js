const dotenv = require('dotenv')
const path = require('path')
const Joi = require('joi')

dotenv.config({ path: path.join(__dirname, '../../.env') })

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
        PORT: Joi.number().default(3000),
        MONGODB_CONNECTION_URL: Joi.string().required().description('Mongo DB url'),
        JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
        SMTP_HOST: Joi.string().description('server that will send the emails'),
        SMTP_PORT: Joi.number().description('port to connect to the email server'),
        EMAIL_USERNAME: Joi.string().description('username for email server'),
        EMAIL_PASSWORD: Joi.string().description('password for email server'),
        EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app')
    })
    .unknown()

const { value: envVars, error } = envVarsSchema
    .messages({
        'any.required': `Config validation error: {#label} is required`,
        'string.empty': `Config validation error: {#label} cannot be empty`
    })
    .validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoose: {
        url: envVars.MONGODB_CONNECTION_URL + (envVars.NODE_ENV === 'test' ? '-test' : '')
    },
    jwt: {
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS
    },
    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            auth: {
                user: envVars.EMAIL_USERNAME,
                pass: envVars.EMAIL_PASSWORD
            }
        },
        from: envVars.EMAIL_FROM
    }
}
