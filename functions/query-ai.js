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

    const { model, messages, stream, temperature } = data;
    if (!model || !messages) {
        console.log('Missing model or messages:', { model, messages });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing model or messages in request body' })
        };
    }

    const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
    if (!TOGETHER_API_KEY) {
        console.log('TOGETHER_API_KEY is not set');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: TOGETHER_API_KEY not set' })
        };
    }

    const API_URL = 'https://api.together.xyz/v1/chat/completions';

    try {
        console.log('Calling Together AI API with model:', model);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model, messages, stream: stream || false, temperature: temperature || 0.3 })
        });
        console.log('Together AI response status:', response.status, 'statusText:', response.statusText);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                console.log('Together AI error response:', JSON.stringify(errorData, null, 2));
                if (response.status === 429) {
                    errorData.suggestion = 'Rate limit exceeded (60 RPM). Wait a few seconds or upgrade your plan at https://www.together.ai.';
                } else if (response.status === 401) {
                    errorData.suggestion = 'Invalid API key. Verify your TOGETHER_API_KEY in Netlify environment variables or generate a new key at https://www.together.ai.';
                } else if (errorData.error?.code === 'model_not_supported') {
                    errorData.suggestion = 'The model is not supported by Together AI. Try a different model like deepseek-ai/DeepSeek-R1 or check available models at https://www.together.ai.';
                }
            } catch (e) {
                const text = await response.text();
                console.log('Non-JSON response:', text);
                errorData = { error: `HTTP ${response.status}`, details: text };
            }
            throw new Error(JSON.stringify(errorData, null, 2));
        }

        const result = await response.json();
        console.log('Together AI response:', JSON.stringify(result, null, 2));
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Together AI error:', error.message, error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to query AI', details: error.message })
        };
    }
};