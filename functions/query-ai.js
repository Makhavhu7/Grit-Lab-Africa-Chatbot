const fetch = require('node-fetch');

exports.handler = async function (event) {
    const { question, context } = JSON.parse(event.body);
    const API_TOKEN = process.env.HF_TOKEN; // Changed to HF_TOKEN
    const API_URL = 'https://api-inference.huggingface.co/models/distilbert-base-cased-distilled-squad';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question, context })
        });
        const result = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to query AI' })
        };
    }
};