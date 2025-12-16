"use strict";

let concertId = null;
let concertTitle = "";
let songs = [];

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadSongsData(id) {
    concertId = id;
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/concerts/${id}/songs`);
    // const data = await response.json();
    
    // Mock data
    const data = {
        concert_title: "Winter Gala Concert",
        songs: [
            {
                id: 1,
                title: "Symphony No. 5 in C Minor",
                composer: "Ludwig van Beethoven",
                birth_year: "1770",
                ensemble: "Symphony Orchestra",
                soloists: "",
                info: "One of the most famous works in classical music.",
                lyrics: "",
                order: 1
            },
            {
                id: 2,
                title: "Ave Maria",
                composer: "Franz Schubert",
                birth_year: "1797",
                ensemble: "Chamber Choir",
                soloists: "Sarah Johnson, soprano",
                info: "A beautiful setting of the Latin prayer.",
                lyrics: "",
                order: 2
            }
        ],
        intermission: {
            after_song_id: 1,
            duration: 15
        }
    };
    
    concertTitle = data.concert_title;
    songs = data.songs || [];
    
    updatePageTitle();
    displaySongs();
    updateIntermissionOptions();
    
    if (data.intermission) {
        document.getElementById('intermission_after').value = data.intermission.after_song_id || "";
        document.getElementById('intermission_duration').value = data.intermission.duration || 15;
    }
}

function updatePageTitle() {
    const headerTitle = document.querySelector('.navbar-brand h1');
    if (headerTitle && concertTitle) {
        headerTitle.textContent = `Edit Songs: ${concertTitle}`;
    }
}

function displaySongs() {
    const container = document.getElementById('songs-list');
    
    if (songs.length === 0) {
        container.innerHTML = `
            <div class="notification is-light has-text-centered">
                <span class="icon is-large has-text-grey-light">
                    <i class="fas fa-music fa-2x"></i>
                </span>
                <p class="mt-3 has-text-grey">No songs added yet. Add your first piece above!</p>
            </div>
        `;
        return;
    }
    
    songs.sort((a, b) => a.order - b.order);
    
    container.innerHTML = songs.map((song, index) => {
        const composerInfo = song.birth_year ? `${song.composer}, b. ${song.birth_year}` : song.composer;
        const hasDetails = song.ensemble || song.soloists || song.info;
        
        return `
            <div class="card mb-3" data-song-id="${song.id}" draggable="true">
                <div class="card-content">
                    <div class="level is-mobile">
                        <div class="level-left" style="flex: 1;">
                            <span class="icon level-item has-text-grey-light" style="cursor: move;">
                                <i class="fas fa-grip-vertical"></i>
                            </span>
                            <div class="level-item" style="flex-direction: column; align-items: flex-start;">
                                <p class="has-text-weight-bold">${index + 1}. ${song.title}</p>
                                <p class="is-size-7 has-text-grey">${composerInfo}</p>
                                ${hasDetails ? `
                                    <div class="tags mt-2">
                                        ${song.ensemble ? `<span class="tag is-info is-light">${song.ensemble}</span>` : ''}
                                        ${song.soloists ? `<span class="tag is-success is-light">${song.soloists}</span>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="level-right">
                            <div class="buttons level-item">
                                <button class="button is-small is-info is-light" onclick="editSong(${song.id})">
                                    <span class="icon"><i class="fas fa-edit"></i></span>
                                </button>
                                <button class="button is-small is-danger is-light" onclick="deleteSong(${song.id})">
                                    <span class="icon"><i class="fas fa-trash"></i></span>
                                </button>
                            </div>
                        </div>
                    </div>
                    ${song.info ? `<p class="mt-2 is-size-7">${song.info}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    initializeDragAndDrop();
}

function initializeDragAndDrop() {
    const songCards = document.querySelectorAll('.card[data-song-id]');
    let draggedElement = null;
    
    songCards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedElement = card;
            card.style.opacity = '0.5';
        });
        
        card.addEventListener('dragend', (e) => {
            card.style.opacity = '1';
            draggedElement = null;
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedElement && draggedElement !== card) {
                const container = card.parentNode;
                const afterElement = getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(draggedElement);
                } else {
                    container.insertBefore(draggedElement, afterElement);
                }
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card[data-song-id]:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function handleAddSong(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    
    const newSong = {
        id: Date.now(), // Temporary ID
        title: document.getElementById('song_title').value.trim(),
        composer: document.getElementById('composer').value.trim(),
        birth_year: document.getElementById('birth_year').value.trim(),
        ensemble: document.getElementById('performing_ensemble').value.trim(),
        soloists: document.getElementById('soloists').value.trim(),
        info: document.getElementById('song_info').value.trim(),
        lyrics: document.getElementById('lyrics').value.trim(),
        order: songs.length + 1
    };
    
    if (!newSong.title || !newSong.composer) {
        showNotification("Title and composer are required", "warning");
        submitButton.classList.remove("is-loading");
        return;
    }
    
    // TODO: Replace with actual API call
    setTimeout(() => {
        songs.push(newSong);
        displaySongs();
        updateIntermissionOptions();
        form.reset();
        showNotification("Song added to program!", "success");
        submitButton.classList.remove("is-loading");
    }, 300);
}

function editSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    
    // Populate form with song data
    document.getElementById('song_title').value = song.title;
    document.getElementById('composer').value = song.composer;
    document.getElementById('birth_year').value = song.birth_year || '';
    document.getElementById('performing_ensemble').value = song.ensemble || '';
    document.getElementById('soloists').value = song.soloists || '';
    document.getElementById('song_info').value = song.info || '';
    document.getElementById('lyrics').value = song.lyrics || '';
    
    // Scroll to form
    document.getElementById('add-song-form').scrollIntoView({ behavior: 'smooth' });
    
    // Remove the song so it can be re-added
    deleteSong(songId, false);
    
    showNotification("Edit the song details and click 'Add to Program' to save changes", "info");
}

function deleteSong(songId, confirm = true) {
    if (confirm && !window.confirm("Are you sure you want to remove this song from the program?")) {
        return;
    }
    
    songs = songs.filter(s => s.id !== songId);
    
    // Reorder remaining songs
    songs.forEach((song, index) => {
        song.order = index + 1;
    });
    
    displaySongs();
    updateIntermissionOptions();
    
    if (confirm) {
        showNotification("Song removed from program", "info");
    }
}

function updateIntermissionOptions() {
    const select = document.getElementById('intermission_after');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">No intermission</option>';
    
    songs.forEach((song, index) => {
        const option = document.createElement('option');
        option.value = song.id;
        option.textContent = `After: ${index + 1}. ${song.title}`;
        select.appendChild(option);
    });
    
    // Restore previous selection if still valid
    if (currentValue && songs.find(s => s.id == currentValue)) {
        select.value = currentValue;
    }
}

function handleIntermissionSave() {
    const afterSongId = document.getElementById('intermission_after').value;
    const duration = document.getElementById('intermission_duration').value;
    
    // TODO: Replace with actual API call
    setTimeout(() => {
        showNotification("Intermission settings saved!", "success");
    }, 300);
}

function showNotification(message, type = "info") {
    const main = document.querySelector("main");
    const notification = document.createElement("div");
    notification.className = `notification is-${type} is-light`;
    notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    
    main.insertBefore(notification, main.firstChild);
    
    notification.querySelector(".delete").addEventListener("click", () => {
        notification.remove();
    });
    
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s";
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function updateNavLinks() {
    if (!concertId) return;
    
    const navLinks = document.querySelectorAll('.navbar-dropdown a, .navbar-end a, .breadcrumb a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('.html') && !href.includes('?id=') && !href.includes('index.html')) {
            if (href.includes('program.html')) {
                link.setAttribute('href', `../view/program.html?id=${concertId}`);
            } else if (href.startsWith('./')) {
                link.setAttribute('href', `${href}?id=${concertId}`);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const id = getConcertIdFromUrl();
    
    if (!id) {
        showNotification("No concert ID provided. Redirecting...", "warning");
        setTimeout(() => window.location.href = "../index.html", 2000);
        return;
    }
    
    loadSongsData(id);
    
    const addSongForm = document.getElementById('add-song-form');
    if (addSongForm) {
        addSongForm.addEventListener('submit', handleAddSong);
    }
    
    const saveIntermissionBtn = document.getElementById('save-intermission');
    if (saveIntermissionBtn) {
        saveIntermissionBtn.addEventListener('click', handleIntermissionSave);
    }
    
    updateNavLinks();
});