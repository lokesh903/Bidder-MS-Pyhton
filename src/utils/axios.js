const axios = require('axios');

const instance = axios.create({
    baseURL: `https://${process.env.ENTITY_PATH}.autotask.net/atservicesrest/v1.0`,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'ApiIntegrationCode' : process.env.AUTOTASK_INTEGRATION_CODE,
        'UserName': process.env.AUTOTASK_KEY,
        'Secret': process.env.AUTOTASK_SECRET 
    }
})

module.exports = instance;