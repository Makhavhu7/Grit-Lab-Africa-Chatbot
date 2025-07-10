const fetch = require('node-fetch');

exports.handler = async function (event) {
    console.log('Received event:', JSON.stringify(event, null, 2));
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
        console.log('Parsed body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('JSON parse error:', error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON in request body', details: error.message })
        };
    }

    const { model, messages } = data;
    if (!model || !messages) {
        console.log('Missing model or messages:', { model, messages });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing model or messages in request body' })
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

    const API_URL = 'https://router.huggingface.co/v1/chat/completions';

    try {
        console.log('Calling Hugging Face API with model:', model);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model, messages, stream: false })
        });
        console.log('Hugging Face response status:', response.status);
        let result;
        try {
            result = await response.json();
        } catch (e) {
            const text = await response.text();
            console.log('Non-JSON response:', text);
            throw new Error(`Invalid response from API: ${text}`);
        }
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