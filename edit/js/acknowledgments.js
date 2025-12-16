"use strict";

const base_url = "https://kulbee.pythonanywhere.com";
let concertId = null;
let concertTitle = "";
let acknowledgments = [];

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadAcknowledgmentsData(id) {
    concertId = id;
    
    try {
        const concertResponse = await fetch(`${base_url}/api/concerts/${id}`, { cache: "no-store" });
        const acksResponse = await fetch(`${base_url}/api/concerts/${id}/acknowledgments`, { cache: "no-store" });
        
        if (!concertResponse.ok) throw new Error('Failed to load concert');
        if (!acksResponse.ok) throw new Error('Failed to load acknowledgments');
        
        const concertData = await concertResponse.json();
        acknowledgments = await acksResponse.json();
        
        concertTitle = concertData.title;
        updatePageTitle();
        displayAcknowledgments();
    } catch (error) {
        console.error('Error loading acknowledgments:', error);
        showNotification("Error loading acknowledgments: " + error.message, "danger");
    }
}

function updatePageTitle() {
    const headerTitle = document.querySelector('.navbar-brand h1');
    if (headerTitle && concertTitle) {
        headerTitle.textContent = `Edit Acknowledgments: ${concertTitle}`;
    }
}

function displayAcknowledgments() {
    const container = document.getElementById('acknowledgments-list');
    
    if (acknowledgments.length === 0) {
        container.innerHTML = `
            <div class="notification is-light has-text-centered">
                <span class="icon is-large has-text-grey-light">
                    <i class="fas fa-users fa-2x"></i>
                </span>
                <p class="mt-3 has-text-grey">No acknowledgments added yet. Add your first acknowledgment above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = acknowledgments.map(ack => `
        <div class="card mb-3">
            <div class="card-content">
                <div class="level is-mobile">
                    <div class="level-left" style="flex: 1;">
                        <div class="level-item">
                            <p>${ack.text}</p>
                        </div>
                    </div>
                    <div class="level-right">
                        <button class="button is-small is-danger is-light level-item" onclick="deleteAcknowledgment(${ack.id})">
                            <span class="icon"><i class="fas fa-trash"></i></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function handleAddAcknowledgment(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    
    const text = document.getElementById('acknowledgment_content').value.trim();
    
    if (!text) {
        showNotification("Acknowledgment text is required", "warning");
        submitButton.classList.remove("is-loading");
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertId}/acknowledgments/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) throw new Error('Failed to add acknowledgment');
        
        await loadAcknowledgmentsData(concertId);
        form.reset();
        showNotification("Acknowledgment added!", "success");
    } catch (error) {
        console.error('Error adding acknowledgment:', error);
        showNotification("Error adding acknowledgment: " + error.message, "danger");
    } finally {
        submitButton.classList.remove("is-loading");
    }
}

async function deleteAcknowledgment(ackId) {
    if (!confirm('Are you sure you want to remove this acknowledgment?')) {
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertId}/acknowledgments/${ackId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete acknowledgment');
        
        await loadAcknowledgmentsData(concertId);
        showNotification("Acknowledgment removed", "info");
    } catch (error) {
        console.error('Error deleting acknowledgment:', error);
        showNotification("Error deleting acknowledgment: " + error.message, "danger");
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
    
    loadAcknowledgmentsData(id);
    
    const form = document.getElementById('add-acknowledgment-form');
    if (form) {
        form.addEventListener("submit", handleAddAcknowledgment);
    }
    
    updateNavLinks();
});