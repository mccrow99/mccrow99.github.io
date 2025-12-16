"use strict";

const base_url = "https://kulbee.pythonanywhere.com";
let concertId = null;
let concertTitle = "";
let songs = [];

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadSongsData(id) {
    concertId = id;
    
    try {
        const concertResponse = await fetch(`${base_url}/api/concerts/${id}`, { cache: "no-store" });
        const songResponse = await fetch(`${base_url}/api/concerts/${id}/songs`, { cache: "no-store" });
        
        if (!concertResponse.ok) throw new Error('Failed to load concert');
        if (!songResponse.ok) throw new Error('Failed to load songs');
        
        const concertData = await concertResponse.json();
        const songsData = await songResponse.json();
        
        concertTitle = concertData.title;
        songs = songsData.map(s => ({
            id: s.id,
            title: s.work.title,
            composer: s.work.composer.name,
            birth_year: s.work.composer.birth_date ? new Date(s.work.composer.birth_date).getFullYear() : '',
            position: s.position,
            ensemble: s.ensemble_name || '',
            soloists: s.soloists || '',
            info: s.notes || '',
            lyrics: s.lyrics || ''
        }));
        
        updatePageTitle();
        displaySongs();
        updateIntermissionOptions();
    } catch (error) {
        console.error('Error loading songs:', error);
        showNotification("Error loading songs: " + error.message, "danger");
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
    
    songs.sort((a, b) => a.position - b.position);
    
    container.innerHTML = songs.map((song, index) => {
        const composerInfo = song.birth_year ? `${song.composer}, b. ${song.birth_year}` : song.composer;
        const hasDetails = song.ensemble || song.soloists || song.info;
        
        return `
            <div class="card mb-3" data-song-id="${song.id}">
                <div class="card-content">
                    <div class="level is-mobile">
                        <div class="level-left" style="flex: 1;">
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
}

async function handleAddSong(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    
    const newSong = {
        title: document.getElementById('song_title').value.trim(),
        composer: document.getElementById('composer').value.trim(),
        birth_year: document.getElementById('birth_year').value.trim(),
        ensemble: document.getElementById('performing_ensemble').value.trim(),
        soloists: document.getElementById('soloists').value.trim(),
        info: document.getElementById('song_info').value.trim(),
        lyrics: document.getElementById('lyrics').value.trim(),
        position: songs.length
    };
    
    if (!newSong.title || !newSong.composer) {
        showNotification("Title and composer are required", "warning");
        submitButton.classList.remove("is-loading");
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertId}/songs/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSong)
        });
        
        if (!response.ok) throw new Error('Failed to add song');
        
        await loadSongsData(concertId);
        form.reset();
        showNotification("Song added to program!", "success");
    } catch (error) {
        console.error('Error adding song:', error);
        showNotification("Error adding song: " + error.message, "danger");
    } finally {
        submitButton.classList.remove("is-loading");
    }
}

async function deleteSong(songId) {
    if (!window.confirm("Are you sure you want to remove this song from the program?")) {
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertId}/songs/${songId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete song');
        
        await loadSongsData(concertId);
        showNotification("Song removed from program", "info");
    } catch (error) {
        console.error('Error deleting song:', error);
        showNotification("Error deleting song: " + error.message, "danger");
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
    
    if (currentValue && songs.find(s => s.id == currentValue)) {
        select.value = currentValue;
    }
}

function handleIntermissionSave() {
    showNotification("Intermission settings saved!", "success");
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
    
    const navLinks = document.querySelectorAll('.navbar-dropdown a, .navbar-end a');
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