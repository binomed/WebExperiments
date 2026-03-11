/**
 * @file proofread.js
 * @description Logic for the standalone Proofreader tool using Chrome's Built-in Proofreader API.
 */

let proofreader = null;
let currentText = '';
let activeCorrection = null;

const elements = {
    input: document.getElementById('text-input'),
    view: document.getElementById('proofread-view'),
    btnProofread: document.getElementById('btn-proofread'),
    btnReset: document.getElementById('btn-reset'),
    spinner: document.getElementById('loading-spinner'),
    statusBar: document.getElementById('status-bar'),
    // Tooltip elements
    tooltip: document.getElementById('correction-tooltip'),
    suggestionVal: document.getElementById('suggestion-value'),
    explanationVal: document.getElementById('explanation-value'),
    btnApply: document.getElementById('btn-apply-correction'),
    btnCancel: document.getElementById('btn-cancel-correction')
};

/**
 * Initialize the Proofreader API
 */
async function init() {
    updateStatus('Initializing Proofreader API...', 'info');
    
    if (!window.Proofreader) {
        updateStatus('Proofreader API not found. Please ensure you are using a compatible Chrome version and the API is enabled.', 'error');
        elements.btnProofread.disabled = true;
        return;
    }

    try {
        const availability = await window.Proofreader.availability();
        if (availability === 'unavailable') {
            updateStatus('Proofreader API is unavailable on this device.', 'error');
            elements.btnProofread.disabled = true;
            return;
        }

        proofreader = await window.Proofreader.create({
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    updateStatus(`Downloading model: ${progress}%`, 'info');
                });
            }
        });
        
        updateStatus('Ready to proofread.', 'success');
    } catch (error) {
        console.error('Init error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

/**
 * Perform proofreading
 */
async function performProofread() {
    const text = elements.input.value.trim();
    if (!text) {
        updateStatus('Please enter some text.', 'info');
        return;
    }

    if (!proofreader) {
        updateStatus('Proofreader not initialized.', 'error');
        return;
    }

    currentText = text;
    setLoading(true);
    updateStatus('Analyzing text...', 'info');

    try {
        const result = await proofreader.proofread(currentText);
        console.log('Proofreader Result:', result);
        renderResult(result);
        updateStatus('Analysis complete.', 'success');
    } catch (error) {
        console.error('Proofread error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

/**
 * Render the results with highlights
 */
function renderResult(result) {
    elements.view.innerHTML = '';
    const { corrections } = result;
    
    let lastIndex = 0;
    
    corrections.forEach((correction) => {
        // Unchanged part
        if (correction.startIndex > lastIndex) {
            const span = document.createElement('span');
            span.textContent = currentText.substring(lastIndex, correction.startIndex);
            elements.view.appendChild(span);
        }

        // Error part
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-highlight';
        errorSpan.textContent = currentText.substring(correction.startIndex, correction.endIndex);
        
        errorSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showTooltip(e, correction);
        });

        elements.view.appendChild(errorSpan);
        lastIndex = correction.endIndex;
    });

    // Remaining text
    if (lastIndex < currentText.length) {
        const span = document.createElement('span');
        span.textContent = currentText.substring(lastIndex);
        elements.view.appendChild(span);
    }

    // Toggle views
    elements.input.style.display = 'none';
    elements.view.style.display = 'block';
    
    elements.btnProofread.style.display = 'none';
    elements.btnReset.style.display = 'flex';
}

/**
 * Tooltip Management
 */
function showTooltip(event, correction) {
    activeCorrection = correction;
    
    elements.suggestionVal.textContent = correction.correction || 'No suggestion';
    elements.explanationVal.textContent = correction.explanation || '';
    
    // Position tooltip
    const rect = event.target.getBoundingClientRect();
    elements.tooltip.style.left = `${rect.left + window.scrollX}px`;
    elements.tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
    elements.tooltip.style.display = 'flex';
}

function hideTooltip() {
    elements.tooltip.style.display = 'none';
    activeCorrection = null;
}

function applyCorrection() {
    if (!activeCorrection) return;
    
    const before = currentText.substring(0, activeCorrection.startIndex);
    const after = currentText.substring(activeCorrection.endIndex);
    currentText = before + activeCorrection.correction + after;
    
    hideTooltip();
    
    // Refresh the view with new text
    reAnalyzeAndRender();
}

async function reAnalyzeAndRender() {
    updateStatus('Updating text...', 'info');
    try {
        const result = await proofreader.proofread(currentText);
        renderResult(result);
        updateStatus('Text updated and re-analyzed.', 'success');
    } catch (error) {
        console.error('Re-analyze error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

/**
 * Reset to input mode
 */
function reset() {
    elements.input.value = currentText;
    elements.input.style.display = 'block';
    elements.view.style.display = 'none';
    elements.btnProofread.style.display = 'flex';
    elements.btnReset.style.display = 'none';
    elements.statusBar.style.display = 'none';
    hideTooltip();
}

/**
 * UI Utilities
 */
function updateStatus(msg, type) {
    elements.statusBar.textContent = msg;
    elements.statusBar.className = `status-bar status-${type}`;
    elements.statusBar.style.display = 'block';
}

function setLoading(isLoading) {
    elements.spinner.style.display = isLoading ? 'block' : 'none';
    elements.btnProofread.disabled = isLoading;
}

// Listeners
elements.btnProofread.addEventListener('click', performProofread);
elements.btnReset.addEventListener('click', reset);
elements.btnApply.addEventListener('click', applyCorrection);
elements.btnCancel.addEventListener('click', hideTooltip);

// Close tooltip on click outside
document.addEventListener('click', (e) => {
    if (!elements.tooltip.contains(e.target) && !e.target.classList.contains('error-highlight')) {
        hideTooltip();
    }
});

// Init on load
document.addEventListener('DOMContentLoaded', init);
