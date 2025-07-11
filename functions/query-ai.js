<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grit Lab - Chat with Slides</title>
    <meta name="description" content="Chat with your study slides using StudyFlow">
    <meta name="author" content="StudyFlow">
    <!-- Lucide Icons CDN -->
    <script src="https://cdn.jsdelivr.net/npm/lucide@0.441.0/dist/umd/lucide.min.js"></script>
    <!-- PDF.js CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    </script>
    <style>
        /* Same styles as provided */
        :root {
            --background: 0 0% 90%;
            --foreground: 0 0% 0%;
            --card: 0 0% 90%;
            --card-foreground: 0 0% 0%;
            --primary: 43.3 96% 22.7%;
            --primary-foreground: 0 0% 100%;
            --secondary: 0 0% 90%;
            --secondary-foreground: 0 0% 0%;
            --muted: 0 0% 80%;
            --muted-foreground: 0 0% 20%;
            --accent: 43.3 96% 22.7%;
            --accent-foreground: 0 0% 100%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 0 0% 100%;
            --border: 0 0% 80%;
            --input: 0 0% 80%;
            --ring: 43.3 96% 22.7%;
            --sidebar-background: 0 0% 20%;
            --sidebar-foreground: 0 0% 100%;
            --sidebar-primary: 43.3 96% 22.7%;
            --sidebar-primary-foreground: 0 0% 100%;
            --sidebar-accent: 0 0% 30%;
            --sidebar-accent-foreground: 0 0% 100%;
            --sidebar-border: 0 0% 30%;
            --sidebar-ring: 43.3 96% 22.7%;
            --radius: 0.5rem;
        }
        /* ... rest of the styles unchanged ... */
    </style>
</head>
<body>
    <nav>
        <div class="nav-container">
            <div class="logo">
                <i data-lucide="book-open" class="h-8 w-8"></i>
                Grit Bot
            </div>
            <div class="nav-buttons">
                <button><i data-lucide="trending-up" class="h-5 w-5 mr-2"></i>Overview</button>
                <button class="active"><i data-lucide="message-square" class="h-5 w-5 mr-2"></i>Chat with Slides</button>
                <button><i data-lucide="settings" class="h-5 w-5 mr-2"></i>Settings</button>
                <button><i data-lucide="log-out" class="h-5 w-5 mr-2"></i>Logout</button>
            </div>
        </div>
    </nav>
    <div class="main-container">
        <div class="chat-container">
            <div class="chat-header">
                <div class="flex items-center space-x-3">
                    <div class="avatar">
                        <i data-lucide="sparkles" class="h-5 w-5"></i>
                        <div class="status"></div>
                    </div>
                    <div>
                        <h2 class="title">Study Assistant <i data-lucide="zap" class="h-4 w-4"></i></h2>
                        <p class="subtitle"><i data-lucide="book-open" class="h-3 w-3"></i>Ready to help with your slides</p>
                    </div>
                </div>
                <span class="badge">AI Powered</span>
            </div>
            <div class="chat-messages">
                <div class="message bot">
                    <div class="avatar"><i data-lucide="bot" class="h-4 w-4"></i></div>
                    <div class="message-content">
                        <p>👋 Hello! I'm your AI study assistant. Select a slide and ask me anything!</p>
                        <div class="meta">
                            <span>5:30 PM</span>
                            <div class="actions">
                                <button onclick="handleReaction('1', 'like')"><i data-lucide="thumbs-up" class="h-3 w-3"></i></button>
                                <button onclick="handleReaction('1', 'dislike')"><i data-lucide="thumbs-down" class="h-3 w-3"></i></button>
                                <button onclick="regenerateResponse('1')"><i data-lucide="rotate-ccw" class="h-3 w-3"></i></button>
                                <button onclick="copyMessage('Hello! I\'m your AI study assistant...')"><i data-lucide="copy" class="h-3 w-3"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="quick-prompts">
                <button onclick="setInput('Explain this concept simply')">Explain this concept simply</button>
                <button onclick="setInput('Create practice questions')">Create practice questions</button>
                <button onclick="setInput('Summarize key points')">Summarize key points</button>
                <button onclick="setInput('Show me examples')">Show me examples</button>
            </div>
            <div class="chat-input">
                <form onsubmit="handleSendMessage(event)">
                    <div class="input-wrapper">
                        <input type="text" id="chatInput" placeholder="Ask me anything about your slides..." onkeypress="handleKeyPress(event)">
                        <div class="input-actions">
                            <button type="button"><i data-lucide="paperclip" class="h-4 w-4"></i></button>
                            <button type="button"><i data-lucide="smile" class="h-4 w-4"></i></button>
                            <button type="button"><i data-lucide="mic" class="h-4 w-4"></i></button>
                        </div>
                    </div>
                    <button type="submit" class="send-button"><i data-lucide="send" class="h-4 w-4"></i></button>
                </form>
                <p class="input-info">Press Enter to send • Shift+Enter for new line • AI can make mistakes</p>
            </div>
        </div>
        <div class="slides-container">
            <div class="slides-header">
                <h2 class="title">Knowledge Base</h2>
                <div class="controls">
                    <div class="search">
                        <i data-lucide="search" class="h-4 w-4"></i>
                        <input type="text" id="slideSearch" placeholder="Search slides..." oninput="searchSlides()">
                    </div>
                    <div class="view-toggle">
                        <button id="gridView" class="active" onclick="setViewMode('grid')"><i data-lucide="grid" class="h-4 w-4"></i></button>
                        <button id="listView" onclick="setViewMode('list')"><i data-lucide="list" class="h-4 w-4"></i></button>
                    </div>
                </div>
                <span class="badge" id="selectionBadge">0 slides selected</span>
            </div>
            <div class="slides-content">
                <div id="slidesContainer" class="slides-grid"></div>
            </div>
        </div>
    </div>
    <script>
        lucide.createIcons();
        const pdfFiles = [
            { id: '1', name: 'ACSSE_IFM02A2_Tut2.pdf', path: '/pdfs/Equations and Inequalities.pdf', pages: 5, size: '45kb', date: '2024-06-01' },
            { id: '2', name: 'IFM2A_Chapter1.pdf', path: '/pdfs/Mechanical Energy.pdf', pages: 7, size: '45kb', date: '2024-06-02' },
            { id: '3', name: 'ACSSE_IFM02A2_Chap11.pdf', path: '/pdfs/TRIGONOMETRY.pdf', pages: 7, size: '59kb', date: '2024-06-03' }
        ];
        let pdfContent = {};
        let selectedSlides = [];

        async function loadPDFs() {
            let loadErrors = [];
            for (const pdf of pdfFiles) {
                try {
                    console.log(`Fetching PDF: ${pdf.path}`);
                    const response = await fetch(pdf.path);
                    if (!response.ok) throw new Error(`Failed to fetch ${pdf.name}: ${response.statusText}`);
                    const arrayBuffer = await response.arrayBuffer();
                    const typedArray = new Uint8Array(arrayBuffer);
                    const pdfDoc = await pdfjsLib.getDocument(typedArray).promise;
                    pdfContent[pdf.id] = [];
                    pdf.pages = pdfDoc.numPages;
                    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                        const page = await pdfDoc.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const text = textContent.items.map(item => item.str).join(' ');
                        pdfContent[pdf.id].push({ page: pageNum, text });
                    }
                    console.log(`Loaded ${pdf.name}: ${pdfContent[pdf.id].length} pages`);
                } catch (error) {
                    console.error(`Error loading ${pdf.name}:`, error);
                    loadErrors.push(pdf.name);
                }
            }
            if (loadErrors.length > 0) {
                alert(`Failed to load PDFs: ${loadErrors.join(', ')}. Please check the files and try again.`);
            } else {
                console.log('All PDFs processed');
                console.log('pdfContent:', pdfContent);
                updateSlidesViewer();
            }
        }

        function updateSlidesViewer() {
            const container = document.getElementById('slidesContainer');
            container.innerHTML = '';
            pdfFiles.forEach(pdf => {
                const slideCard = document.createElement('div');
                slideCard.className = `slide-card ${selectedSlides.includes(pdf.id) ? 'selected' : ''}`;
                slideCard.dataset.id = pdf.id;
                slideCard.onclick = () => toggleSlideSelection(pdf.id);
                slideCard.innerHTML = `
                    <div class="thumbnail">
                        <img src="/static/placeholder.png" alt="${pdf.name}">
                    </div>
                    <div class="content">
                        <h3 class="title">${pdf.name}</h3>
                        <div class="meta">
                            <span>${pdf.pages} pages</span>
                            <span>${pdf.size}</span>
                        </div>
                        <div class="date">${pdf.date}</div>
                    </div>
                `;
                container.appendChild(slideCard);
            });
            lucide.createIcons();
        }

        async function handleSendMessage(event) {
            event.preventDefault();
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            if (!message) return;
            const messagesContainer = document.querySelector('.chat-messages');
            const userMessage = document.createElement('div');
            userMessage.className = 'message user';
            userMessage.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                    <div class="meta">
                        <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div class="actions">
                            <button onclick="copyMessage('${message}')"><i data-lucide="copy" class="h-3 w-3"></i></button>
                        </div>
                    </div>
                </div>
                <div class="avatar"><i data-lucide="user" class="h-4 w-4"></i></div>
            `;
            messagesContainer.appendChild(userMessage);
            input.value = '';
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message bot typing-indicator';
            typingIndicator.innerHTML = `
                <div class="avatar"><i data-lucide="bot" class="h-4 w-4"></i></div>
                <div class="flex space-x-1">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            `;
            messagesContainer.appendChild(typingIndicator);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            let context = '';
            let relevantPage = 1;
            let pdfName = '';
            console.log('pdfContent:', pdfContent);
            console.log('selectedSlides:', selectedSlides);
            if (selectedSlides.length > 0) {
                const selectedId = selectedSlides[0];
                const selectedPdf = pdfContent[selectedId];
                console.log('Selected PDF content:', selectedPdf);
                if (selectedPdf && selectedPdf.length > 0) {
                    for (const page of selectedPdf) {
                        if (page.text.toLowerCase().includes(message.toLowerCase())) {
                            context = page.text.substring(0, 1000);
                            relevantPage = page.page;
                            pdfName = pdfFiles.find(pdf => pdf.id === selectedId).name;
                            break;
                        }
                    }
                    if (!context) {
                        context = selectedPdf[0].text.substring(0, 1000);
                        pdfName = pdfFiles.find(pdf => pdf.id === selectedId).name;
                    }
                } else {
                    console.log('No content for selected PDF:', selectedId);
                    alert('Selected PDF content not loaded. Please ensure PDFs are loaded correctly.');
                    messagesContainer.removeChild(typingIndicator);
                    return;
                }
            } else {
                console.log('No slide selected, searching all PDFs');
                for (const pdfId of Object.keys(pdfContent)) {
                    const pdfPages = pdfContent[pdfId];
                    if (pdfPages && pdfPages.length > 0) {
                        for (const page of pdfPages) {
                            if (page.text.toLowerCase().includes(message.toLowerCase())) {
                                context = page.text.substring(0, 1000);
                                relevantPage = page.page;
                                pdfName = pdfFiles.find(pdf => pdf.id === pdfId).name;
                                break;
                            }
                        }
                        if (context) break;
                    }
                }
                if (!context && Object.keys(pdfContent).length > 0) {
                    const firstPdfId = Object.keys(pdfContent)[0];
                    const firstPdfPages = pdfContent[firstPdfId];
                    if (firstPdfPages && firstPdfPages.length > 0) {
                        context = firstPdfPages[0].text.substring(0, 1000);
                        pdfName = pdfFiles.find(pdf => pdf.id === firstPdfId).name;
                    }
                }
            }
            if (!context) {
                console.log('No context found');
                alert('No PDF content available. Please ensure PDFs are loaded correctly.');
                messagesContainer.removeChild(typingIndicator);
                return;
            }
            const payload = {
                messages: [
                    { role: 'system', content: 'You are a helpful assistant providing accurate answers based on the provided context.' },
                    { role: 'user', content: `${message}\n\nContext: ${context}` }
                ],
                stream: false,
                temperature: 0.3,
                max_tokens: 512
            };
            try {
                console.log('Sending payload to Portkey:', JSON.stringify(payload));
                const response = await fetch('/.netlify/functions/query-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, provider: 'portkey', model: 'gpt-4o-mini' })
                });
                if (!response.ok) {
                    throw new Error(`Portkey failed: HTTP ${response.status}`);
                }
                const result = await response.json();
                const answer = result.choices?.[0]?.message?.content || 'Sorry, I couldn’t find a clear answer.';
                const botMessage = document.createElement('div');
                botMessage.className = 'message bot';
                botMessage.innerHTML = `
                    <div class="avatar"><i data-lucide="bot" class="h-4 w-4"></i></div>
                    <div class="message-content">
                        <p>${answer} (See ${pdfName}, slide ${relevantPage})</p>
                        <div class="meta">
                            <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <div class="actions">
                                <button onclick="handleReaction('temp', 'like')"><i data-lucide="thumbs-up" class="h-3 w-3"></i></button>
                                <button onclick="handleReaction('temp', 'dislike')"><i data-lucide="thumbs-down" class="h-3 w-3"></i></button>
                                <button onclick="regenerateResponse('temp')"><i data-lucide="rotate-ccw" class="h-3 w-3"></i></button>
                                <button onclick="copyMessage('${answer}')"><i data-lucide="copy" class="h-3 w-3"></i></button>
                            </div>
                        </div>
                    </div>
                `;
                messagesContainer.removeChild(typingIndicator);
                messagesContainer.appendChild(botMessage);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                lucide.createIcons();
            } catch (error) {
                console.error('Portkey error:', error.message);
                console.log('Falling back to Together AI');
                try {
                    const fallbackPayload = {
                        ...payload,
                        model: 'meta-llama/Llama-3-70b-chat-hf'
                    };
                    console.log('Sending payload to Together AI:', JSON.stringify(fallbackPayload));
                    const fallbackResponse = await fetch('/.netlify/functions/query-ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...fallbackPayload, provider: 'together' })
                    });
                    if (!fallbackResponse.ok) {
                        const contentType = fallbackResponse.headers.get('content-type');
                        let errorData;
                        if (contentType && contentType.includes('application/json')) {
                            errorData = await fallbackResponse.json();
                        } else {
                            errorData = { error: `HTTP ${fallbackResponse.status}`, details: await fallbackResponse.text() };
                        }
                        let errorMessage = errorData.error?.message || JSON.stringify(errorData, null, 2);
                        if (fallbackResponse.status === 429) {
                            errorMessage = `Together AI rate limit exceeded (60 RPM). Please wait or upgrade your plan at https://www.together.ai.`;
                        } else if (fallbackResponse.status === 401) {
                            errorMessage = `Together AI: Unauthorized. Please verify TOGETHER_API_KEY in Netlify environment variables.`;
                        } else if (errorData.error?.code === 'model_not_supported') {
                            errorMessage = `Together AI: The model 'meta-llama/Llama-3-70b-chat-hf' is not supported. Check available models at https://www.together.ai.`;
                        }
                        throw new Error(errorMessage);
                    }
                    const result = await fallbackResponse.json();
                    const answer = result.choices?.[0]?.message?.content || 'Sorry, I couldn’t find a clear answer.';
                    const botMessage = document.createElement('div');
                    botMessage.className = 'message bot';
                    botMessage.innerHTML = `
                        <div class="avatar"><i data-lucide="bot" class="h-4 w-4"></i></div>
                        <div class="message-content">
                            <p>${answer} (See ${pdfName}, slide ${relevantPage}) [Fallback: Together AI]</p>
                            <div class="meta">
                                <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <div class="actions">
                                    <button onclick="handleReaction('temp', 'like')"><i data-lucide="thumbs-up" class="h-3 w-3"></i></button>
                                    <button onclick="handleReaction('temp', 'dislike')"><i data-lucide="thumbs-down" class="h-3 w-3"></i></button>
                                    <button onclick="regenerateResponse('temp')"><i data-lucide="rotate-ccw" class="h-3 w-3"></i></button>
                                    <button onclick="copyMessage('${answer}')"><i data-lucide="copy" class="h-3 w-3"></i></button>
                                </div>
                            </div>
                        </div>
                    `;
                    messagesContainer.removeChild(typingIndicator);
                    messagesContainer.appendChild(botMessage);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    lucide.createIcons();
                } catch (fallbackError) {
                    console.error('Together AI error:', fallbackError.message);
                    alert(`Error querying AI: Portkey failed (${error.message}), and Together AI failed (${fallbackError.message}). Please try again or contact support.`);
                    messagesContainer.removeChild(typingIndicator);
                }
            }
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendMessage(event);
            }
        }

        function setInput(text) {
            document.getElementById('chatInput').value = text;
        }

        function copyMessage(content) {
            navigator.clipboard.writeText(content);
            alert('Message copied to clipboard!');
        }

        function handleReaction(id, reaction) {
            const button = event.target.closest('button');
            if (reaction === 'like') {
                button.style.color = button.style.color === 'rgb(74, 222, 128)' ? '' : '#4ade80';
            } else {
                button.style.color = button.style.color === 'rgb(248, 113, 113)' ? '' : '#f87171';
            }
            alert(reaction === 'like' ? 'Thanks for the feedback!' : 'Feedback received');
        }

        function regenerateResponse(id) {
            alert('Regenerating response...');
        }

        let viewMode = 'grid';
        function setViewMode(mode) {
            viewMode = mode;
            const gridButton = document.getElementById('gridView');
            const listButton = document.getElementById('listView');
            const container = document.getElementById('slidesContainer');
            if (mode === 'grid') {
                gridButton.classList.add('active');
                listButton.classList.remove('active');
                container.className = 'slides-grid';
                document.querySelectorAll('.slide-card').forEach(card => {
                    card.classList.remove('list');
                });
            } else {
                listButton.classList.add('active');
                gridButton.classList.remove('active');
                container.className = 'slides-list';
                document.querySelectorAll('.slide-card').forEach(card => {
                    card.classList.add('list');
                });
            }
        }

        function searchSlides() {
            const searchTerm = document.getElementById('slideSearch').value.toLowerCase();
            document.querySelectorAll('.slide-card').forEach(card => {
                const title = card.querySelector('.title').textContent.toLowerCase();
                card.style.display = title.includes(searchTerm) ? '' : 'none';
            });
        }

        function toggleSlideSelection(id) {
            const card = document.querySelector(`.slide-card[data-id="${id}"]`);
            if (selectedSlides.includes(id)) {
                selectedSlides = selectedSlides.filter(slideId => slideId !== id);
                card.classList.remove('selected');
            } else {
                selectedSlides = [id];
                document.querySelectorAll('.slide-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            }
            const badge = document.getElementById('selectionBadge');
            badge.textContent = `${selectedSlides.length} slide${selectedSlides.length !== 1 ? 's' : ''} selected`;
            badge.style.display = selectedSlides.length > 0 ? 'inline-block' : 'none';
        }

        window.onload = function () {
            loadPDFs();
        };
    </script>
</body>
</html>