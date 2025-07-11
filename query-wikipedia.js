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

    const { query, context } = data;
    if (!query) {
        console.log('Missing query');
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing query in request body' })
        };
    }

    try {
        console.log('Querying Wikipedia for:', query);
        const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
        if (!searchResponse.ok) {
            throw new Error(`Wikipedia search failed: HTTP ${searchResponse.status}`);
        }
        const searchData = await searchResponse.json();
        const page = searchData.query.search[0];
        if (!page) {
            return {
                statusCode: 200,
                body: JSON.stringify({ content: 'No relevant Wikipedia page found.' })
            };
        }

        const pageResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(page.title)}&format=json&origin=*`);
        if (!pageResponse.ok) {
            throw new Error(`Wikipedia page fetch failed: HTTP ${pageResponse.status}`);
        }
        const pageData = await pageResponse.json();
        const pageId = Object.keys(pageData.query.pages)[0];
        let content = pageData.query.pages[pageId].extract || 'No content available.';
        
        // Combine with context if available
        if (context) {
            content = `From your slides: ${context.substring(0, 200)}...\n\nFrom Wikipedia: ${content}`;
        }

        console.log('Wikipedia response:', content.substring(0, 100) + '...');
        return {
            statusCode: 200,
            body: JSON.stringify({ content })
        };
    } catch (error) {
        console.error('Wikipedia API error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to query Wikipedia', details: error.message })
        };
    }
};