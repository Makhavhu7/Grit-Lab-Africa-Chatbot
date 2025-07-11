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
        console.error('JSON parse error:', error.message, error.stack);
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
        console.log('Querying for:', query);
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        console.log('Search URL:', searchUrl);
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            throw new Error(`Search failed: HTTP ${searchResponse.status}, ${errorText}`);
        }
        const searchData = await searchResponse.json();
        console.log('Search response:', JSON.stringify(searchData, null, 2));
        const page = searchData.query.search[0];
        if (!page) {
            return {
                statusCode: 200,
                body: JSON.stringify({ content: 'No relevant information found.' })
            };
        }

        const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(page.title)}&format=json&origin=*`;
        console.log('Page URL:', pageUrl);
        const pageResponse = await fetch(pageUrl);
        if (!pageResponse.ok) {
            const errorText = await pageResponse.text();
            throw new Error(`Page fetch failed: HTTP ${pageResponse.status}, ${errorText}`);
        }
        const pageData = await pageResponse.json();
        console.log('Page response:', JSON.stringify(pageData, null, 2));
        const pageId = Object.keys(pageData.query.pages)[0];
        let content = pageData.query.pages[pageId].extract || 'No content available.';
        
        if (context) {
            content = `From your slides: ${context.substring(0, 200)}...<br><br>${content}`;
        }

        console.log('Response:', content.substring(0, 100) + '...');
        return {
            statusCode: 200,
            body: JSON.stringify({ content })
        };
    } catch (error) {
        console.error('API error:', error.message, error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to query server', details: error.message })
        };
    }
};