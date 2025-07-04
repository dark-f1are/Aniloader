// References for the Download Links Modal
const downloadModal = document.getElementById('downloadModal');
const downloadModalTitle = document.getElementById('downloadModalTitle');
const downloadLinksContainer = document.getElementById('downloadLinks');
const loadingMessage = document.getElementById('loadingMessage');
const noLinksFoundMessage = document.getElementById('noLinksFound');
const errorMessage = document.getElementById('errorMessage');

// References for the Episode Options Modal
const episodeOptionsModal = document.getElementById('episodeOptionsModal');
const episodeOptionsModalTitle = document.getElementById('episodeOptionsModalTitle');
const viewDetailsBtn = document.getElementById('viewDetailsBtn');
const downloadEpisodeBtn = document.getElementById('downloadEpisodeBtn');

/**
 * Orchestrates showing the Episode Options Modal by extracting data from the clicked card.
 * @param {HTMLElement} clickedElement The <a> element that was clicked.
 */
function showEpisodeOptionsFromCard(clickedElement) {
    const animeSessionId = clickedElement.dataset.animeSessionId;
    const animeTitle = clickedElement.dataset.animeTitle;
    const episodeSessionId = clickedElement.dataset.episodeSessionId;
    const episodeNumber = clickedElement.dataset.episodeNumber;

    // Basic validation: if critical data is missing, log an error and don't proceed.
    if (!animeSessionId || !animeTitle || !episodeSessionId || !episodeNumber) {
        console.error("Missing data for episode options. Cannot open modal.", {
            animeSessionId, animeTitle, episodeSessionId, episodeNumber
        });
        // Optionally, show a user-friendly message or redirect to a fallback page
        return;
    }

    // Now call the main function with the extracted data
    showEpisodeOptions(animeSessionId, animeTitle, episodeSessionId, episodeNumber);
}


/**
 * Opens the Episode Options Modal, presenting choices to view details or download.
 * @param {string} animeSessionId The session ID of the anime.
 * @param {string} animeTitle The title of the anime.
 * @param {string} episodeSessionId The session ID of the specific episode.
 * @param {number} episodeNumber The episode number.
 */
function showEpisodeOptions(animeSessionId, animeTitle, episodeSessionId, episodeNumber) {
    episodeOptionsModalTitle.textContent = animeTitle + ' - Episode ' + episodeNumber;

    // Construct the URL entirely in JavaScript using template literals for clarity and correctness
    // Assumes the Flask route for anime_detail is /anime/<anime_session_id>?anime_title=<anime_title>
    viewDetailsBtn.href = `/anime/${animeSessionId}?anime_title=${encodeURIComponent(animeTitle)}`;

    // Set the onclick for 'Download Episode' button
    downloadEpisodeBtn.onclick = function() {
        closeEpisodeOptionsModal(); // Close the options modal first
        // Use the data extracted from the card to call showDownloads
        showDownloads(animeSessionId, episodeSessionId, 'Episode ' + episodeNumber);
    };

    // Show options modal with animations
    episodeOptionsModal.classList.remove('hidden');
    episodeOptionsModal.classList.add('active');
}

/**
 * Closes the Episode Options Modal.
 */
function closeEpisodeOptionsModal() {
    episodeOptionsModal.classList.remove('active');
    episodeOptionsModal.addEventListener('transitionend', function handler() {
        episodeOptionsModal.classList.add('hidden');
        episodeOptionsModal.removeEventListener('transitionend', handler);
    }, { once: true });
}

// Close options modal when clicking outside of it
episodeOptionsModal.addEventListener('click', (event) => {
    if (event.target === episodeOptionsModal) {
        closeEpisodeOptionsModal();
    }
});


/**
 * Fetches and displays download links in the Download Modal.
 * @param {string} animeSessionId The session ID of the anime.
 * @param {string} episodeSessionId The session ID of the specific episode.
 * @param {string} episodeTitle A display title for the episode (e.g., "Episode 12").
 */
function showDownloads(animeSessionId, episodeSessionId, episodeTitle) {
    downloadModalTitle.textContent = episodeTitle + ' - Download Options';
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
function closeDownloadModal() {
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

// Close download modal when clicking outside of it
downloadModal.addEventListener('click', (event) => {
    if (event.target === downloadModal) {
        closeDownloadModal();
    }
});
