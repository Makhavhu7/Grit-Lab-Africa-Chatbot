const fetch = require('node-fetch');

exports.handler = async function (event) {
    console.log('Received event:', event); // Debug
    if (!event.body) {
        console.log('No body received'); // Debug
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is empty' })
        };
    }

    let data;
    try {
        data = JSON.parse(event.body);
        console.log('Parsed body:', data); // Debug
    } catch (error) {
        console.log('JSON parse error:', error); // Debug
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
    }

    const { question, context } = data;
    if (!question || !context) {
        console.log('Missing question or context:', { question, context }); // Debug
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
        console.log('Hugging Face response:', result); // Debug
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.log('Hugging Face error:', error); // Debug
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to query AI' })
        };
    }
};