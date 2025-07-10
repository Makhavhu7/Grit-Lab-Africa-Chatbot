const fetch = require('node-fetch');

exports.handler = async function (event) {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is empty' })
        };
    }

    let data;
    try {
        data = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
    }

    const { question, context } = data;
    if (!question || !context) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing question or context in request body' })
        };
    }

    const API_TOKEN = process.env.HF_TOKEN;
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