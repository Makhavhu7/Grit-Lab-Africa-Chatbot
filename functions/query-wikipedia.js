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
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`;
        console.log('Search URL:', searchUrl);
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            throw new Error(`Search failed: HTTP ${searchResponse.status}, ${errorText}`);
        }
        const searchData = await searchResponse.json();
        console.log('Search response:', JSON.stringify(searchData, null, 2));

        let content = '';
        const pages = searchData.query.search;
        if (!pages || pages.length === 0) {
            content = 'No relevant information found on Wikipedia.';
        } else {
            for (let i = 0; i < Math.min(3, pages.length); i++) {
                const page = pages[i];
                const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=1&titles=${encodeURIComponent(page.title)}&format=json&origin=*&exsectionformat=plain`;
                console.log('Page URL:', pageUrl);
                const pageResponse = await fetch(pageUrl);
                if (!pageResponse.ok) {
                    console.warn(`Page fetch failed for ${page.title}: HTTP ${pageResponse.status}`);
                    continue;
                }
                const pageData = await pageResponse.json();
                console.log('Page response:', JSON.stringify(pageData, null, 2));
                const pageId = Object.keys(pageData.query.pages)[0];
                const pageContent = pageData.query.pages[pageId].extract || 'No content available.';
                content += `<h3>${page.title}</h3><p>${pageContent.substring(0, 2000)}...</p>`;
            }
        }

        if (context) {
            content = `From your slides: ${context.substring(0, 1000)}...<br><br><h2>Wikipedia Information</h2>${content}`;
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