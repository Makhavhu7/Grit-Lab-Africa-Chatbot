const fetch = require('node-fetch');

exports.handler = async function (event) {
    console.log('Received event:', JSON.stringify(event, null, 2)); // Detailed debug
    if (!event.body) {
        console.log('No body received');
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is empty' })
        };
    }

    let data;
    try {
        data = JSON.parse(event.body);
        console.log('Parsed body:', JSON.stringify(data, null, 2)); // Detailed debug
    } catch (error) {
        console.log('JSON parse error:', error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON in request body', details: error.message })
        };
    }

    const { question, context } = data;
    if (!question || !context) {
        console.log('Missing question or context:', { question, context });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing question or context in request body' })
        };
    }

    const API_TOKEN = process.env.HF_TOKEN;
    if (!API_TOKEN) {
        console.log('HF_TOKEN is not set');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: HF_TOKEN not set' })
        };
    }

    const API_URL = 'https://api-inference.huggingface.co/models/distilbert-base-cased-distilled-squad';

    try {
        console.log('Calling Hugging Face API with question:', question);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question, context })
        });
        console.log('Hugging Face response status:', response.status);
        const result = await response.json();
        if (!response.ok) {
            console.log('Hugging Face error response:', result);
            throw new Error(result.error || `Hugging Face API returned ${response.status}`);
        }
        console.log('Hugging Face response:', JSON.stringify(result, null, 2));
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Hugging Face error:', error.message, error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to query AI', details: error.message })
        };
    }
};