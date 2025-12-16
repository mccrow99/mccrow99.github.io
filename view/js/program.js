"use strict";

const base_url = "https://kulbee.pythonanywhere.com";

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadConcertData(concertId) {
    try {
        // Load all concert data
        const concertResponse = await fetch(`${base_url}/api/concerts/${concertId}`, { cache: "no-store" });
        
        if (!concertResponse.ok) {
            throw new Error('Concert not found');
        }
        
        const concert = await concertResponse.json();
        
        // Populate all sections
        populateCoverPage(concert);
        populateEnsembles(concert.ensembles);
        populateCrew(concert.crew_members);
        populateDirectorSection(concert.director);
        populateSongs(concert.songs);
        populateBios(concert.bios);
        populateAcknowledgments(concert.acknowledgments);
        
    } catch (error) {
        console.error('Error loading concert data:', error);
        document.querySelector('.playbill').innerHTML = `
            <div class="section has-text-centered">
                <h1 class="title is-3 has-text-danger">Error Loading Concert</h1>
                <p>${error.message}</p>
                <a href="../index.html" class="button is-link mt-4">Return to Home</a>
            </div>
        `;
    }
}

function populateCoverPage(concert) {
    // Title and subtitle
    document.getElementById('concert-title').textContent = concert.title || 'Untitled Concert';
    
    const subtitleEl = document.getElementById('concert-subtitle');
    if (concert.subtitle) {
        subtitleEl.textContent = concert.subtitle;
        subtitleEl.style.display = 'block';
    } else {
        subtitleEl.style.display = 'none';
    }
    
    // Director
    const directorEl = document.getElementById('director-name');
    if (concert.director) {
        directorEl.textContent = `${concert.director.name}, Director`;
    } else {
        directorEl.style.display = 'none';
    }
    
    // Cover image
    const coverSection = document.getElementById('cover-section');
    if (concert.cover_image) {
        coverSection.innerHTML = `<img src="${concert.cover_image}" alt="Concert Cover" style="max-width: 400px; max-height: 300px;">`;
    } else {
        coverSection.innerHTML = '';
    }
    
    // Performances
    const perfList = document.getElementById('performances-list');
    if (concert.performances && concert.performances.length > 0) {
        perfList.innerHTML = concert.performances.map(perf => {
            const date = formatDate(perf.date);
            const time = perf.time ? ` at ${perf.time}` : '';
            const location = perf.location ? ` - ${perf.location}` : '';
            return `<li>${date}${time}${location}</li>`;
        }).join('');
    } else {
        perfList.innerHTML = '<li>No performance dates scheduled</li>';
    }
    
    // Admission info
    const admissionEl = document.getElementById('admission-info');
    if (concert.price) {
        admissionEl.innerHTML = `<p class="has-text-weight-bold">Admission: ${concert.price}</p>`;
    } else {
        admissionEl.innerHTML = '';
    }
    
    // Announcements
    const announcementsEl = document.getElementById('announcements');
    if (concert.additional_notes) {
        announcementsEl.innerHTML = `<p>${concert.additional_notes}</p>`;
    } else {
        announcementsEl.innerHTML = '';
    }
    
    // Sponsors
    const sponsorsEl = document.getElementById('sponsors');
    if (concert.sponsors) {
        sponsorsEl.innerHTML = `<strong>Sponsored by:</strong><br>${concert.sponsors}`;
    } else {
        sponsorsEl.innerHTML = '';
    }
    
    // Copyright info (could add to footer)
    if (concert.copyright_info) {
        const footerSection = document.querySelector('.playbill');
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'content has-text-centered is-size-7 mt-6';
        copyrightDiv.innerHTML = `<p>${concert.copyright_info}</p>`;
        footerSection.appendChild(copyrightDiv);
    }
}

function populateEnsembles(ensembles) {
    const container = document.getElementById('ensembles-container');
    
    if (!ensembles || ensembles.length === 0) {
        container.innerHTML = '<p class="has-text-centered has-text-grey">No ensembles listed</p>';
        return;
    }
    
    container.innerHTML = ensembles.map(ensemble => {
        const performers = ensemble.performers || [];
        
        // Check if performers use sectioned format (contains colons)
        const hasSections = performers.some(p => p.includes(':'));
        
        if (hasSections) {
            // Group by sections
            const sections = {};
            performers.forEach(p => {
                const parts = p.split(':');
                if (parts.length === 2) {
                    const section = parts[0].trim();
                    const name = parts[1].trim();
                    if (!sections[section]) sections[section] = [];
                    sections[section].push(name);
                } else {
                    if (!sections['Other']) sections['Other'] = [];
                    sections['Other'].push(p);
                }
            });
            
            return `
                <div class="mb-6">
                    <h3 class="title is-4 has-text-centered mb-4">${ensemble.name} Personnel</h3>
                    <div class="columns is-multiline">
                        ${Object.entries(sections).map(([section, names]) => `
                            <div class="column is-one-quarter">
                                <p class="has-text-weight-bold mb-2">${section}</p>
                                ${names.map(name => `<p class="is-size-7">${name}</p>`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            // Simple list format
            return `
                <div class="mb-6">
                    <h3 class="title is-4 has-text-centered mb-4">${ensemble.name} Personnel</h3>
                    <div class="columns is-multiline">
                        ${performers.map(name => `
                            <div class="column is-one-quarter">
                                <p class="is-size-7">${name}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }).join('');
}

function populateCrew(crew) {
    const container = document.getElementById('crew-container');
    
    if (!crew || crew.length === 0) {
        container.innerHTML = '<p class="column has-text-centered has-text-grey">No crew members listed</p>';
        return;
    }
    
    container.innerHTML = crew.map(member => `
        <div class="column is-one-third">
            <p><strong>${member.name}</strong>, ${member.role || 'Crew'}</p>
        </div>
    `).join('');
}

function populateDirectorSection(director) {
    const notesEl = document.getElementById('director-notes-content');
    const bioEl = document.getElementById('director-bio-content');
    const bioTitleEl = document.getElementById('director-bio-title');
    
    if (!director) {
        notesEl.innerHTML = '<p class="has-text-centered has-text-grey">No director notes available</p>';
        bioEl.innerHTML = '';
        bioTitleEl.style.display = 'none';
        return;
    }
    
    if (director.notes) {
        notesEl.innerHTML = `<p>${director.notes}</p>`;
    } else {
        notesEl.innerHTML = '<p class="has-text-centered has-text-grey">No director notes available</p>';
    }
    
    if (director.bio) {
        bioTitleEl.textContent = `About ${director.name}`;
        bioEl.innerHTML = `<p>${director.bio}</p>`;
    } else {
        bioEl.innerHTML = '';
        bioTitleEl.style.display = 'none';
    }
}

function populateSongs(songs) {
    const container = document.getElementById('songs-container');
    
    if (!songs || songs.length === 0) {
        container.innerHTML = '<div class="column is-full has-text-centered has-text-grey">No pieces in program</div>';
        return;
    }
    
    // Sort by position
    songs.sort((a, b) => a.position - b.position);
    
    container.innerHTML = songs.map(song => {
        const work = song.work || {};
        const composer = work.composer || {};
        const birthYear = composer.birth_date ? `, b. ${new Date(composer.birth_date).getFullYear()}` : '';
        
        return `
            <div class="column is-full mb-4">
                <div class="box">
                    <h4 class="title is-5">${work.title || 'Untitled'}</h4>
                    <p class="subtitle is-6 has-text-grey">${composer.name || 'Unknown Composer'}${birthYear}</p>
                    ${song.ensemble_name ? `<p class="is-size-7"><strong>Performed by:</strong> ${song.ensemble_name}</p>` : ''}
                    ${song.soloists ? `<p class="is-size-7"><strong>Featured Soloists:</strong> ${song.soloists}</p>` : ''}
                    ${song.notes ? `<div class="content mt-3"><p>${song.notes}</p></div>` : ''}
                    ${song.lyrics ? `<div class="content mt-3 has-background-light p-3"><pre style="white-space: pre-wrap; font-family: inherit;">${song.lyrics}</pre></div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function populateBios(bios) {
    const container = document.getElementById('bios-container');
    
    if (!bios || bios.length === 0) {
        container.innerHTML = '<div class="column is-full has-text-centered has-text-grey">No biographies available</div>';
        return;
    }
    
    container.innerHTML = bios.map(bio => `
        <div class="column is-half">
            <div class="box">
                <h4 class="title is-6">${bio.name}${bio.role ? `, ${bio.role}` : ''}</h4>
                <div class="content">
                    <p>${bio.text}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function populateAcknowledgments(acknowledgments) {
    const container = document.getElementById('acknowledgments-content');
    
    if (!acknowledgments || acknowledgments.length === 0) {
        container.innerHTML = '<p class="has-text-centered has-text-grey">No acknowledgments</p>';
        return;
    }
    
    container.innerHTML = `<ul>${acknowledgments.map(ack => 
        `<li>${ack.text}</li>`
    ).join('')}</ul>`;
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const concertId = getConcertIdFromUrl();
    
    if (!concertId) {
        document.querySelector('.playbill').innerHTML = `
            <div class="section has-text-centered">
                <h1 class="title is-3">No Concert Selected</h1>
                <p>Please select a concert to view its program.</p>
                <a href="../index.html" class="button is-link mt-4">Return to Home</a>
            </div>
        `;
        return;
    }
    
    loadConcertData(concertId);
});