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

    const { model, messages, stream, temperature, max_tokens } = data;
    if (!model || !messages) {
        console.log('Missing model or messages:', { model, messages });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing model or messages in request body' })
        };
    }

    const PORTKEY_API_KEY = process.env.PORTKEY_API_KEY;
    const PORTKEY_VIRTUAL_KEY = process.env.PORTKEY_VIRTUAL_KEY;
    const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

    if (!PORTKEY_VIRTUAL_KEY|| !PORTKEY_API_KEY || !TOGETHER_API_KEY) {
        console.log('Environment variables missing:', {
            PORTKEY_VIRTUAL_KEY: !!PORTKEY_VIRTUAL_KEY,
            PORTKEY_API_KEY: !!PORTKEY_API_KEY,
            TOGETHER_API_KEY: !!TOGETHER_API_KEY
        });
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: Missing API keys' })
        };
    }

    const PORTKEY_API_URL = 'https://api.portkey.ai/v1/chat/completions';
    const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

    // Try Portkey AI first
    try {
        console.log('Calling Portkey AI with model:', model);
        const portkeyResponse = await fetch(PORTKEY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PORTKEY_API_KEY}`,
                'x-portkey-virtual-key': PORTKEY_VIRTUAL_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model, messages, stream: stream || false, temperature: temperature || 0.3, max_tokens: max_tokens || 512 })
        });
        console.log('Portkey AI response status:', portkeyResponse.status, 'statusText:', portkeyResponse.statusText);

        if (portkeyResponse.ok) {
            const result = await portkeyResponse.json();
            console.log('Portkey AI response:', JSON.stringify(result, null, 2));
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } else {
            let errorData;
            try {
                errorData = await portkeyResponse.json();
                console.log('Portkey AI error response:', JSON.stringify(errorData, null, 2));
                if (portkeyResponse.status === 429) {
                    errorData.suggestion = 'Portkey AI rate limit exceeded. Check your quota at https://portkey.ai.';
                } else if (portkeyResponse.status === 401) {
                    errorData.suggestion = 'Invalid Portkey API key or virtual key. Verify at https://portkey.ai.';
                } else if (errorData.error?.type === 'invalid_request_error') {
                    errorData.suggestion = `Invalid request to Portkey AI. Check model availability for ${model}.`;
                }
            } catch (e) {
                const text = await portkeyResponse.text();
                console.log('Portkey AI non-JSON response:', text);
                errorData = { error: `HTTP ${portkeyResponse.status}`, details: text };
            }
            console.log('Portkey AI failed, falling back to Together AI:', JSON.stringify(errorData, null, 2));
        }
    } catch (error) {
        console.error('Portkey AI error:', error.message, error.stack);
    }

    // Fallback to Together AI
    try {
        console.log('Calling Together AI with model: deepseek-ai/DeepSeek-V3');
        const togetherPayload = {
            model: 'deepseek-ai/DeepSeek-V3',
            messages: messages,
            stream: stream || false,
            temperature: temperature || 0.3,
            max_tokens: max_tokens || 512
        };
        const togetherResponse = await fetch(TOGETHER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(togetherPayload)
        });
        console.log('Together AI response status:', togetherResponse.status, 'statusText:', togetherResponse.statusText);

        if (!togetherResponse.ok) {
            let errorData;
            try {
                errorData = await togetherResponse.json();
                console.log('Together AI error response:', JSON.stringify(errorData, null, 2));
                if (togetherResponse.status === 429) {
                    errorData.suggestion = 'Rate limit exceeded (60 RPM). Wait a few seconds or upgrade your plan at https://www.together.ai.';
                } else if (togetherResponse.status === 401) {
                    errorData.suggestion = 'Invalid API key. Verify your TOGETHER_API_KEY in Netlify environment variables or generate a new key at https://www.together.ai.';
                } else if (errorData.error?.code === 'model_not_supported') {
                    errorData.suggestion = 'The model deepseek-ai/DeepSeek-V3 is not supported by Together AI. Check available models at https://www.together.ai.';
                }
            } catch (e) {
                const text = await togetherResponse.text();
                console.log('Together AI non-JSON response:', text);
                errorData = { error: `HTTP ${togetherResponse.status}`, details: text };
            }
            throw new Error(JSON.stringify(errorData, null, 2));
        }

        const result = await togetherResponse.json();
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