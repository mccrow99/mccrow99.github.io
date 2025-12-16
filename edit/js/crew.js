"use strict";

// This is a template that can be adapted for:
// - director_sect.js
// - ensemble.js
// - crew.js
// - songs.js
// - bios.js
// - acknowledgments.js

let concertId = null;
let concertTitle = "";
let sectionData = {};

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadSectionData(id) {
    concertId = id;
    
    // TODO: Replace with actual API calls
    // For director notes:
    // const response = await fetch(`/api/concerts/${id}/director`);
    
    // For ensemble:
    // const response = await fetch(`/api/concerts/${id}/ensembles`);
    
    // For crew:
    // const response = await fetch(`/api/concerts/${id}/crew`);
    
    // For songs:
    // const response = await fetch(`/api/concerts/${id}/songs`);
    
    // For bios:
    // const response = await fetch(`/api/concerts/${id}/bios`);
    
    // For acknowledgments:
    // const response = await fetch(`/api/concerts/${id}/acknowledgments`);
    
    // Mock data - adapt based on section
    sectionData = {
        concert_title: "Winter Gala Concert",
        // Section-specific fields would go here
        content: ""
    };
    
    concertTitle = sectionData.concert_title;
    updatePageTitle();
    populateForm();
}

function updatePageTitle() {
    const headerTitle = document.querySelector('.navbar-brand h1');
    if (headerTitle && concertTitle) {
        // Update based on current page
        const pageName = getCurrentSectionName();
        headerTitle.textContent = `Edit ${pageName}: ${concertTitle}`;
    }
}

function getCurrentSectionName() {
    const path = window.location.pathname;
    if (path.includes('director')) return 'Director Notes';
    if (path.includes('ensemble')) return 'Ensembles';
    if (path.includes('crew')) return 'Crew';
    if (path.includes('songs')) return 'Songs';
    if (path.includes('bios')) return 'Bios';
    if (path.includes('acknowledgments')) return 'Acknowledgments';
    return 'Section';
}

function populateForm() {
    // Adapt based on section - example for text content
    const textarea = document.querySelector('textarea');
    if (textarea && sectionData.content) {
        textarea.value = sectionData.content;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    submitButton.disabled = true;
    
    // Gather form data - adapt based on section
    const formData = {};
    const textareas = form.querySelectorAll('textarea');
    const inputs = form.querySelectorAll('input[type="text"]');
    
    textareas.forEach(ta => {
        formData[ta.name] = ta.value.trim();
    });
    
    inputs.forEach(input => {
        formData[input.name] = input.value.trim();
    });
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/concerts/${concertId}/section`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
    
    // Simulate API call
    setTimeout(() => {
        showNotification("Section updated successfully!", "success");
        submitButton.classList.remove("is-loading");
        submitButton.disabled = false;
    }, 500);
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

// Update navigation links with concert ID
function updateNavLinks() {
    if (!concertId) return;
    
    const navLinks = document.querySelectorAll('.navbar-dropdown a, .navbar-end a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('.html') && !href.includes('?id=')) {
            // Don't add ID to home link or preview
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
    
    loadSectionData(id);
    
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
    
    updateNavLinks();
    
    // Add character counter for textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        const maxLength = 2000;
        textarea.maxLength = maxLength;
        
        const helpText = document.createElement("p");
        helpText.className = "help has-text-right";
        textarea.parentElement.appendChild(helpText);
        
        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            helpText.textContent = `${remaining} characters remaining`;
            if (remaining < 200) {
                helpText.classList.add("has-text-warning");
            } else {
                helpText.classList.remove("has-text-warning");
            }
        };
        
        textarea.addEventListener("input", updateCounter);
        updateCounter();
    });
});