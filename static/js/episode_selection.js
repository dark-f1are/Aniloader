// References for the Download Links Modal (these elements are in episode_selection.html)
const downloadModal = document.getElementById('downloadModal');
const modalTitle = document.getElementById('modalTitle'); // Original ID from episode_selection.html
const downloadLinksContainer = document.getElementById('downloadLinks');
const loadingMessage = document.getElementById('loadingMessage');
const noLinksFoundMessage = document.getElementById('noLinksFound');
const errorMessage = document.getElementById('errorMessage');

/**
 * Fetches and displays download links in the Download Modal.
 * @param {string} animeSessionId The session ID of the anime.
 * @param {string} episodeSessionId The session ID of the specific episode.
 * @param {string} episodeTitle A display title for the episode (e.g., "Episode 12").
 */
function showDownloads(animeSessionId, episodeSessionId, episodeTitle) {
    modalTitle.textContent = episodeTitle + ' - Download Options';
    // Reset previous state
    loadingMessage.classList.remove('hidden');
    noLinksFoundMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    downloadLinksContainer.innerHTML = '';
    downloadLinksContainer.appendChild(loadingMessage); // Re-add loading message for current fetch

    // Show modal with animations
    downloadModal.classList.remove('hidden');
    downloadModal.classList.add('active'); // Trigger CSS animation

    // Fetch URL is relative, assuming Flask serves this endpoint
    fetch(`/api/episode-downloads/${animeSessionId}/${episodeSessionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadingMessage.classList.add('hidden');
            if (data.downloads && data.downloads.length > 0) {
                data.downloads.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.href;
                    a.textContent = link.text;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.className = 'block px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg text-center hover:bg-blue-700 transition-colors duration-200 shadow-md transform hover:scale-[1.02] active:scale-95 download-btn-gradient';
                    downloadLinksContainer.appendChild(a);
                });
            } else {
                noLinksFoundMessage.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching download links:', error);
            loadingMessage.classList.add('hidden');
            errorMessage.textContent = 'Failed to load download links. Please check your connection or try again later.';
            errorMessage.classList.remove('hidden');
        });
}

/**
 * Closes the Download Links Modal.
 */
function closeModal() {
    // Trigger CSS animation for closing
    downloadModal.classList.remove('active');
    downloadModal.addEventListener('transitionend', function handler() {
        downloadModal.classList.add('hidden');
        // Clear links and messages when closing the modal
        downloadLinksContainer.innerHTML = '';
        downloadLinksContainer.appendChild(loadingMessage);
        loadingMessage.classList.remove('hidden');
        noLinksFoundMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        downloadModal.removeEventListener('transitionend', handler); // Clean up listener
    }, { once: true });
}

// Close modal when clicking outside of it
downloadModal.addEventListener('click', (event) => {
    if (event.target === downloadModal) {
        closeModal();
    }
});
