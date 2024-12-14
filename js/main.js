document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-area');
    const outputArea = document.getElementById('output-area');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const clearBtn = document.getElementById('clear-btn');
    const themeBtn = document.getElementById('theme-btn');
    const infoText = document.querySelector('.info-text');

    // Theme toggle functionality
    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

    // Theme button click handler
    themeBtn.addEventListener('click', toggleTheme);

    // Function to toggle info text visibility
    function toggleInfoText() {
        const hasContent = inputArea.value.trim().length > 0;
        if (hasContent) {
            infoText.classList.add('hidden');
        } else {
            infoText.classList.remove('hidden');
        }
    }

    // Load saved content from localStorage
    const savedContent = localStorage.getItem('jsonContent');
    if (savedContent) {
        inputArea.value = savedContent;
        formatOutput(savedContent);
        toggleInfoText();
    }

    // Input area event listeners
    inputArea.addEventListener('input', (e) => {
        const content = e.target.value;
        toggleInfoText();
        if (content) {
            localStorage.setItem('jsonContent', content);
            formatOutput(content);
        } else {
            localStorage.removeItem('jsonContent');
            outputArea.textContent = '';
        }
    });

    // Format and display output
    function formatOutput(text) {
        try {
            if (!text.trim()) {
                outputArea.textContent = '';
                return;
            }

            // Remove single quotes and handle escaped quotes
            let processedText = text
                .replace(/'/g, '')  // Remove all single quotes
                .replace(/\\"/g, '"');  // Unescape double quotes

            // Try to parse as JSON first
            try {
                const parsed = JSON.parse(processedText);
                outputArea.textContent = JSON.stringify(parsed, null, 2);
                return;
            } catch (e) {
                // If not valid JSON, continue with text formatting
            }

            // Convert text to JSON array
            const lines = processedText.trim().split('\n');
            const jsonArray = lines
                .filter(line => line.trim())
                .map(line => {
                    line = line.trim();
                    
                    // Remove existing quotes
                    if (line.startsWith('"') && line.endsWith('"')) {
                        line = line.slice(1, -1);
                    }
                    
                    // Escape any remaining double quotes
                    line = line.replace(/(?<!\\)"/g, '\\"');
                    
                    return `"${line}"`;
                });

            const jsonString = `[\n  ${jsonArray.join(',\n  ')}\n]`;
            outputArea.textContent = jsonString;
        } catch (error) {
            outputArea.textContent = 'Error formatting JSON: ' + error.message;
        }
    }

    // Copy button functionality
    copyBtn.addEventListener('click', () => {
        const content = outputArea.textContent;
        if (content) {
            navigator.clipboard.writeText(content)
                .then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                });
        }
    });

    // Download button functionality
    downloadBtn.addEventListener('click', () => {
        const content = outputArea.textContent;
        if (content) {
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `formatted_json_${new Date().toISOString().slice(0,19).replace(/[-:]/g, '')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // Clear button functionality
    clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        outputArea.textContent = '';
        localStorage.removeItem('jsonContent');
        toggleInfoText();
    });

    // Handle URL hash for sharing
    window.addEventListener('load', () => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            try {
                const decoded = decodeURIComponent(atob(hash));
                inputArea.value = decoded;
                formatOutput(decoded);
            } catch (e) {
                console.error('Failed to load shared data:', e);
            }
        }
    });

    // Update URL hash when content changes
    inputArea.addEventListener('input', (e) => {
        const content = e.target.value;
        if (content) {
            const encoded = btoa(encodeURIComponent(content));
            window.location.hash = encoded;
        } else {
            window.location.hash = '';
        }
    });
});
