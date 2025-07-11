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

    const { provider, model, messages, stream, temperature, max_tokens, api_base } = data;
    if (!provider || !model || !messages) {
        console.log('Missing provider, model, or messages:', { provider, model, messages });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing provider, model, or messages in request body' })
        };
    }

    if (provider === 'litellm') {
        const LITELLM_API_KEY = process.env.LITELLM_API_KEY;
        if (!LITELLM_API_KEY) {
            console.log('LITELLM_API_KEY is not set');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error: LITELLM_API_KEY not set' })
            };
        }
        if (!api_base) {
            console.log('api_base is missing for LiteLLM provider');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'api_base is required for LiteLLM provider' })
            };
        }

        const API_URL = `${api_base}/v1/chat/completions`;
        try {
            console.log('Calling LiteLLM API with model:', model, 'api_base:', api_base);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${LITELLM_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model, messages, stream: stream || false, temperature: temperature || 0.3, max_tokens })
            });
            console.log('LiteLLM response status:', response.status, 'statusText:', response.statusText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                    console.log('LiteLLM error response:', JSON.stringify(errorData, null, 2));
                    if (response.status === 429) {
                        errorData.suggestion = 'LiteLLM rate limit exceeded. Wait a few seconds or check your Hugging Face plan at https://huggingface.co.';
                    } else if (response.status === 401) {
                        errorData.suggestion = 'LiteLLM: Invalid API key. Verify LITELLM_API_KEY in Netlify environment variables and Hugging Face dashboard.';
                    } else if (errorData.error?.code === 'model_not_supported') {
                        errorData.suggestion = 'LiteLLM: The model is not supported. Check available models at https://huggingface.co.';
                    }
                } catch (e) {
                    const text = await response.text();
                    console.log('Non-JSON response:', text);
                    errorData = { error: `HTTP ${response.status}`, details: text };
                }
                throw new Error(JSON.stringify(errorData, null, 2));
            }

            const result = await response.json();
            console.log('LiteLLM response:', JSON.stringify(result, null, 2));
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            console.error('LiteLLM error:', error.message, error.stack);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to query LiteLLM', details: error.message })
            };
        }
    } else if (provider === 'portkey') {
        const PORTKEY_API_KEY = process.env.PORTKEY_API_KEY;
        const PORTKEY_VIRTUAL_KEY = process.env.PORTKEY_VIRTUAL_KEY;
        if (!PORTKEY_API_KEY || !PORTKEY_VIRTUAL_KEY) {
            console.log('PORTKEY_API_KEY or PORTKEY_VIRTUAL_KEY is not set');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error: PORTKEY_API_KEY or PORTKEY_VIRTUAL_KEY not set' })
            };
        }

        const API_URL = 'https://api.portkey.ai/v1/chat/completions';
        try {
            console.log('Calling Portkey AI API with model:', model);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PORTKEY_API_KEY}`,
                    'x-portkey-virtual-key': PORTKEY_VIRTUAL_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model, messages, stream: stream || false, temperature: temperature || 0.3, max_tokens })
            });
            console.log('Portkey AI response status:', response.status, 'statusText:', response.statusText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                    console.log('Portkey AI error response:', JSON.stringify(errorData, null, 2));
                    if (response.status === 429) {
                        errorData.suggestion = 'Portkey rate limit exceeded. Wait a few seconds or upgrade your plan at https://portkey.ai.';
                    } else if (response.status === 401) {
                        errorData.suggestion = 'Portkey: Invalid API key or virtual key. Verify PORTKEY_API_KEY and PORTKEY_VIRTUAL_KEY in Netlify environment variables.';
                    } else if (errorData.error?.code === 'model_not_supported') {
                        errorData.suggestion = 'Portkey: The model is not supported. Check available models at https://portkey.ai.';
                    }
                } catch (e) {
                    const text = await response.text();
                    console.log('Non-JSON response:', text);
                    errorData = { error: `HTTP ${response.status}`, details: text };
                }
                throw new Error(JSON.stringify(errorData, null, 2));
            }

            const result = await response.json();
            console.log('Portkey AI response:', JSON.stringify(result, null, 2));
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            console.error('Portkey AI error:', error.message, error.stack);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to query Portkey AI', details: error.message })
            };
        }
    } else if (provider === 'together') {
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
                        errorData.suggestion = 'Together AI rate limit exceeded (60 RPM). Wait a few seconds or upgrade your plan at https://www.together.ai.';
                    } else if (response.status === 401) {
                        errorData.suggestion = 'Together AI: Invalid API key. Verify TOGETHER_API_KEY in Netlify environment variables.';
                    } else if (errorData.error?.code === 'model_not_supported') {
                        errorData.suggestion = 'Together AI: The model is not supported. Try a different model or check available models at https://www.together.ai.';
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
                body: JSON.stringify({ error: 'Failed to query Together AI', details: error.message })
            };
        }
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid provider specified. Use "litellm", "portkey", or "together".' })
        };
    }
};