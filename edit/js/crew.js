"use strict";

const base_url = "https://kulbee.pythonanywhere.com";
let concertId = null;
let concertTitle = "";
let crewMembers = [];

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadCrewData(id) {
    concertId = id;
    
    try {
        const concertResponse = await fetch(`${base_url}/api/concerts/${id}`, { cache: "no-store" });
        const crewResponse = await fetch(`${base_url}/api/concerts/${id}/crew`, { cache: "no-store" });
        
        if (!concertResponse.ok) throw new Error('Failed to load concert');
        if (!crewResponse.ok) throw new Error('Failed to load crew');
        
        const concertData = await concertResponse.json();
        crewMembers = await crewResponse.json();
        
        concertTitle = concertData.title;
        updatePageTitle();
        displayCrew();
    } catch (error) {
        console.error('Error loading crew:', error);
        showNotification("Error loading crew: " + error.message, "danger");
    }
}

function updatePageTitle() {
    const headerTitle = document.querySelector('.navbar-brand h1');
    if (headerTitle && concertTitle) {
        headerTitle.textContent = `Edit Crew: ${concertTitle}`;
    }
}

function displayCrew() {
    const container = document.getElementById('crew-list');
    
    if (crewMembers.length === 0) {
        container.innerHTML = `
            <div class="notification is-light has-text-centered">
                <span class="icon is-large has-text-grey-light">
                    <i class="fas fa-users fa-2x"></i>
                </span>
                <p class="mt-3 has-text-grey">No crew members added yet. Add your first member above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = crewMembers.map(member => `
        <div class="card mb-3">
            <div class="card-content">
                <div class="level is-mobile">
                    <div class="level-left">
                        <div class="level-item">
                            <div>
                                <p class="has-text-weight-bold">${member.name}</p>
                                <p class="is-size-7 has-text-grey">${member.role || 'No role specified'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="level-right">
                        <button class="button is-small is-danger is-light level-item" onclick="deleteCrew(${member.id})">
                            <span class="icon"><i class="fas fa-trash"></i></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function handleAddCrew(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    
    const name = document.getElementById('crew_member_name').value.trim();
    const role = document.getElementById('crew_member_role').value.trim();
    
    if (!name || !role) {
        showNotification("Name and role are required", "warning");
        submitButton.classList.remove("is-loading");
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertId}/crew/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role })
        });
        
        if (!response.ok) throw new Error('Failed to add crew member');
        
        await loadCrewData(concertId);
        form.reset();
        showNotification("Crew member added!", "success");
    } catch (error) {
        console.error('Error adding crew:', error);
        showNotification("Error adding crew: " + error.message, "danger");
    } finally {
        submitButton.classList.remove("is-loading");
    }
}

async function deleteCrew(crewId) {
    if (!confirm('Are you sure you want to remove this crew member?')) {
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertId}/crew/${crewId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete crew member');
        
        await loadCrewData(concertId);
        showNotification("Crew member removed", "info");
    } catch (error) {
        console.error('Error deleting crew:', error);
        showNotification("Error deleting crew: " + error.message, "danger");
    }
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
        if (href && href.includes('.html') && !href.includes('?id=')) {
            if (!href.includes('index.html') && !href.includes('program.html')) {
                link.setAttribute('href', `${href}?id=${concertId}`);
            } else if (href.includes('program.html')) {
                link.setAttribute('href', `../view/program.html?id=${concertId}`);
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
    
    loadCrewData(id);
    
    const form = document.getElementById('add-crew-form');
    if (form) {
        form.addEventListener("submit", handleAddCrew);
    }
    
    updateNavLinks();
});