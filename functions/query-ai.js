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

    const { provider, model, messages, stream, temperature, max_tokens } = data;
    if (!provider || !model || !messages) {
        console.log('Missing provider, model, or messages:', { provider, model, messages });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing provider, model, or messages in request body' })
        };
    }

    let API_URL, API_KEY_ENV, API_KEY;
    if (provider === 'portkey') {
        API_URL = 'https://api.portkey.ai/v1/chat/completions';
        API_KEY_ENV = 'PORTKEY_API_KEY';
        API_KEY = process.env.PORTKEY_API_KEY;
    } else if (provider === 'together') {
        API_URL = 'https://api.together.xyz/v1/chat/completions';
        API_KEY_ENV = 'TOGETHER_API_KEY';
        API_KEY = process.env.TOGETHER_API_KEY;
    } else {
        console.log('Invalid provider:', provider);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Invalid provider: ${provider}. Use 'portkey' or 'together'.` })
        };
    }

    if (!API_KEY) {
        console.log(`${API_KEY_ENV} is not set`);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Server configuration error: ${API_KEY_ENV} not set` })
        };
    }

    try {
        console.log(`Calling ${provider} API with model: ${model}`);
        const headers = {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        };
        if (provider === 'portkey') {
            headers['x-portkey-virtual-key'] = 'open-ai-virtual-10d72c';
        }
        const response = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages,
                stream: stream || false,
                temperature: temperature || 0.3,
                ...(provider === 'portkey' && { max_tokens: max_tokens || 512 })
            })
        });
        console.log(`${provider} response status: ${response.status}, statusText: ${response.statusText}`);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                console.log(`${provider} error response:`, JSON.stringify(errorData, null, 2));
                if (response.status === 429) {
                    errorData.suggestion = `Rate limit exceeded (${provider === 'portkey' ? '100 RPM' : '60 RPM'}). Wait a few seconds or upgrade your plan at ${provider === 'portkey' ? 'https://portkey.ai' : 'https://www.together.ai'}.`;
                } else if (response.status === 401) {
                    errorData.suggestion = `Invalid API key. Verify your ${API_KEY_ENV} in Netlify environment variables or generate a new key at ${provider === 'portkey' ? 'https://portkey.ai' : 'https://www.together.ai'}.`;
                } else if (errorData.error?.code === 'model_not_supported') {
                    errorData.suggestion = `The model '${model}' is not supported by ${provider}. Check available models at ${provider === 'portkey' ? 'https://portkey.ai' : 'https://www.together.ai'}.`;
                }
            } catch (e) {
                const text = await response.text();
                console.log('Non-JSON response:', text);
                errorData = { error: `HTTP ${response.status}`, details: text };
            }
            throw new Error(JSON.stringify(errorData, null, 2));
        }

        const result = await response.json();
        console.log(`${provider} response:`, JSON.stringify(result, null, 2));
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error(`${provider} error:`, error.message, error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to query ${provider} AI`, details: error.message })
        };
    }
};