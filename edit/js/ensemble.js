"use strict";

let concertId = null;
let concertTitle = "";
let ensembles = [];
let currentEnsemble = null;

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadEnsemblesData(id) {
    concertId = id;
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/concerts/${id}/ensembles`);
    // const data = await response.json();
    
    // Mock data
    const data = {
        concert_title: "Winter Gala Concert",
        ensembles: [
            {
                id: 1,
                name: "Symphony Orchestra",
                type: "sectioned",
                sections: [
                    { name: "Violin I", members: ["Alice Smith", "Bob Jones", "Carol White"] },
                    { name: "Violin II", members: ["David Brown", "Emma Davis"] },
                    { name: "Viola", members: ["Frank Miller"] },
                    { name: "Cello", members: ["Grace Wilson", "Henry Moore"] }
                ]
            },
            {
                id: 2,
                name: "Chamber Choir",
                type: "simple",
                members: ["Jane Doe", "John Smith", "Mary Johnson", "Tom Wilson"]
            }
        ]
    };
    
    concertTitle = data.concert_title;
    ensembles = data.ensembles || [];
    
    updatePageTitle();
    displayEnsembles();
}

function updatePageTitle() {
    const headerTitle = document.querySelector('.navbar-brand h1');
    if (headerTitle && concertTitle) {
        headerTitle.textContent = `Edit Ensembles: ${concertTitle}`;
    }
}

function displayEnsembles() {
    const container = document.getElementById('ensembles-list');
    
    if (ensembles.length === 0) {
        container.innerHTML = `
            <div class="notification is-light has-text-centered">
                <span class="icon is-large has-text-grey-light">
                    <i class="fas fa-users fa-2x"></i>
                </span>
                <p class="mt-3 has-text-grey">No ensembles added yet. Create your first ensemble above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ensembles.map(ensemble => {
        const memberCount = ensemble.type === 'sectioned' 
            ? ensemble.sections.reduce((sum, section) => sum + section.members.length, 0)
            : ensemble.members.length;
        
        const typeLabel = ensemble.type === 'sectioned' ? 'Sectioned' : 'Simple List';
        const sectionCount = ensemble.type === 'sectioned' ? ensemble.sections.length : 0;
        
        return `
            <div class="card mb-4">
                <header class="card-header has-background-light">
                    <p class="card-header-title">
                        <span class="icon-text">
                            <span class="icon has-text-primary">
                                <i class="fas fa-users"></i>
                            </span>
                            <span>${ensemble.name}</span>
                        </span>
                    </p>
                    <span class="card-header-icon">
                        <span class="tag is-info is-light">${typeLabel}</span>
                    </span>
                </header>
                <div class="card-content">
                    <div class="content">
                        <p class="mb-3">
                            <strong>${memberCount}</strong> member${memberCount !== 1 ? 's' : ''}
                            ${ensemble.type === 'sectioned' ? ` across <strong>${sectionCount}</strong> section${sectionCount !== 1 ? 's' : ''}` : ''}
                        </p>
                        ${renderEnsemblePreview(ensemble)}
                    </div>
                </div>
                <footer class="card-footer">
                    <a href="#" class="card-footer-item" onclick="editEnsemble(${ensemble.id}); return false;">
                        <span class="icon-text">
                            <span class="icon"><i class="fas fa-edit"></i></span>
                            <span>Edit Members</span>
                        </span>
                    </a>
                    <a href="#" class="card-footer-item has-text-danger" onclick="deleteEnsemble(${ensemble.id}); return false;">
                        <span class="icon-text">
                            <span class="icon"><i class="fas fa-trash"></i></span>
                            <span>Delete</span>
                        </span>
                    </a>
                </footer>
            </div>
        `;
    }).join('');
}

function renderEnsemblePreview(ensemble) {
    if (ensemble.type === 'sectioned') {
        if (ensemble.sections.length === 0) {
            return '<p class="has-text-grey is-italic">No sections added yet. Click "Edit Members" to add sections.</p>';
        }
        
        return `
            <div class="columns is-multiline">
                ${ensemble.sections.slice(0, 4).map(section => `
                    <div class="column is-one-quarter">
                        <p class="has-text-weight-bold is-size-7">${section.name}</p>
                        ${section.members.slice(0, 3).map(m => `<p class="is-size-7">${m}</p>`).join('')}
                        ${section.members.length > 3 ? `<p class="is-size-7 has-text-grey">+${section.members.length - 3} more</p>` : ''}
                    </div>
                `).join('')}
                ${ensemble.sections.length > 4 ? `<div class="column is-full"><p class="has-text-grey is-size-7">+${ensemble.sections.length - 4} more sections</p></div>` : ''}
            </div>
        `;
    } else {
        if (ensemble.members.length === 0) {
            return '<p class="has-text-grey is-italic">No members added yet. Click "Edit Members" to add performers.</p>';
        }
        
        return `
            <div class="columns is-multiline">
                ${ensemble.members.slice(0, 12).map(member => `
                    <div class="column is-one-quarter">
                        <p class="is-size-7">${member}</p>
                    </div>
                `).join('')}
                ${ensemble.members.length > 12 ? `<div class="column is-full"><p class="has-text-grey is-size-7">+${ensemble.members.length - 12} more members</p></div>` : ''}
            </div>
        `;
    }
}

async function handleAddEnsemble(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    
    const name = document.getElementById('ensemble_name').value.trim();
    const type = document.querySelector('input[name="ensemble_type"]:checked').value;
    
    if (!name) {
        showNotification("Please enter an ensemble name", "warning");
        submitButton.classList.remove("is-loading");
        return;
    }
    
    const newEnsemble = {
        id: Date.now(),
        name: name,
        type: type,
        sections: type === 'sectioned' ? [] : undefined,
        members: type === 'simple' ? [] : undefined
    };
    
    // TODO: Replace with actual API call
    setTimeout(() => {
        ensembles.push(newEnsemble);
        displayEnsembles();
        form.reset();
        showNotification(`Ensemble "${name}" created! Now add members.`, "success");
        submitButton.classList.remove("is-loading");
        
        // Automatically open the editor for the new ensemble
        setTimeout(() => editEnsemble(newEnsemble.id), 500);
    }, 300);
}

function editEnsemble(ensembleId) {
    currentEnsemble = ensembles.find(e => e.id === ensembleId);
    if (!currentEnsemble) return;
    
    document.getElementById('modal-title').textContent = `Edit ${currentEnsemble.name}`;
    
    if (currentEnsemble.type === 'sectioned') {
        document.getElementById('sectioned-editor').style.display = 'block';
        document.getElementById('simple-editor').style.display = 'none';
        renderSections();
    } else {
        document.getElementById('sectioned-editor').style.display = 'none';
        document.getElementById('simple-editor').style.display = 'block';
        renderSimpleMembers();
    }
    
    document.getElementById('edit-ensemble-modal').classList.add('is-active');
}

function renderSections() {
    const container = document.getElementById('sections-container');
    
    if (!currentEnsemble.sections || currentEnsemble.sections.length === 0) {
        container.innerHTML = '<p class="has-text-grey">No sections added yet. Add a section above.</p>';
        return;
    }
    
    container.innerHTML = currentEnsemble.sections.map((section, sectionIndex) => `
        <div class="box mb-4">
            <div class="level is-mobile mb-3">
                <div class="level-left">
                    <h4 class="title is-6 level-item mb-0">${section.name}</h4>
                </div>
                <div class="level-right">
                    <button class="button is-small is-danger is-light level-item" 
                            onclick="deleteSection(${sectionIndex})">
                        <span class="icon"><i class="fas fa-trash"></i></span>
                    </button>
                </div>
            </div>
            
            <form onsubmit="addMemberToSection(event, ${sectionIndex})" class="mb-3">
                <div class="field has-addons">
                    <div class="control is-expanded">
                        <input type="text" 
                               class="input is-small" 
                               placeholder="Add member name"
                               required>
                    </div>
                    <div class="control">
                        <button type="submit" class="button is-small is-info">
                            <span class="icon is-small"><i class="fas fa-plus"></i></span>
                        </button>
                    </div>
                </div>
            </form>
            
            <div class="columns is-multiline">
                ${section.members.map((member, memberIndex) => `
                    <div class="column is-one-quarter">
                        <div class="tags has-addons mb-2">
                            <span class="tag is-light">${member}</span>
                            <a class="tag is-delete" onclick="removeMemberFromSection(${sectionIndex}, ${memberIndex})"></a>
                        </div>
                    </div>
                `).join('')}
                ${section.members.length === 0 ? '<div class="column is-full"><p class="has-text-grey is-size-7">No members yet</p></div>' : ''}
            </div>
        </div>
    `).join('');
}

function renderSimpleMembers() {
    const container = document.getElementById('simple-members-container');
    
    if (!currentEnsemble.members || currentEnsemble.members.length === 0) {
        container.innerHTML = '<p class="has-text-grey">No members added yet. Add members above.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="box">
            <div class="columns is-multiline">
                ${currentEnsemble.members.map((member, index) => `
                    <div class="column is-one-quarter">
                        <div class="tags has-addons mb-2">
                            <span class="tag is-light">${member}</span>
                            <a class="tag is-delete" onclick="removeSimpleMember(${index})"></a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function handleAddSection(e) {
    e.preventDefault();
    
    const input = document.getElementById('section_name');
    const sectionName = input.value.trim();
    
    if (!sectionName) return;
    
    if (!currentEnsemble.sections) {
        currentEnsemble.sections = [];
    }
    
    currentEnsemble.sections.push({
        name: sectionName,
        members: []
    });
    
    input.value = '';
    renderSections();
}

function deleteSection(sectionIndex) {
    if (!confirm('Delete this section and all its members?')) return;
    
    currentEnsemble.sections.splice(sectionIndex, 1);
    renderSections();
}

function addMemberToSection(e, sectionIndex) {
    e.preventDefault();
    
    const input = e.target.querySelector('input');
    const memberName = input.value.trim();
    
    if (!memberName) return;
    
    currentEnsemble.sections[sectionIndex].members.push(memberName);
    input.value = '';
    renderSections();
}

function removeMemberFromSection(sectionIndex, memberIndex) {
    currentEnsemble.sections[sectionIndex].members.splice(memberIndex, 1);
    renderSections();
}

function handleAddSimpleMember(e) {
    e.preventDefault();
    
    const input = document.getElementById('member_name_simple');
    const memberName = input.value.trim();
    
    if (!memberName) return;
    
    if (!currentEnsemble.members) {
        currentEnsemble.members = [];
    }
    
    currentEnsemble.members.push(memberName);
    input.value = '';
    renderSimpleMembers();
}

function removeSimpleMember(index) {
    currentEnsemble.members.splice(index, 1);
    renderSimpleMembers();
}

function saveEnsemble() {
    // TODO: Replace with actual API call to save ensemble
    
    // Update the ensemble in the main array
    const index = ensembles.findIndex(e => e.id === currentEnsemble.id);
    if (index !== -1) {
        ensembles[index] = currentEnsemble;
    }
    
    displayEnsembles();
    closeEnsembleModal();
    showNotification(`"${currentEnsemble.name}" saved successfully!`, "success");
}

function closeEnsembleModal() {
    document.getElementById('edit-ensemble-modal').classList.remove('is-active');
    currentEnsemble = null;
}

function deleteEnsemble(ensembleId) {
    const ensemble = ensembles.find(e => e.id === ensembleId);
    if (!ensemble) return;
    
    if (!confirm(`Delete "${ensemble.name}" and all its members? This cannot be undone.`)) {
        return;
    }
    
    // TODO: Replace with actual API call
    ensembles = ensembles.filter(e => e.id !== ensembleId);
    displayEnsembles();
    showNotification(`"${ensemble.name}" deleted`, "info");
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
    
    loadEnsemblesData(id);
    
    const addEnsembleForm = document.getElementById('add-ensemble-form');
    if (addEnsembleForm) {
        addEnsembleForm.addEventListener('submit', handleAddEnsemble);
    }
    
    const addSectionForm = document.getElementById('add-section-form');
    if (addSectionForm) {
        addSectionForm.addEventListener('submit', handleAddSection);
    }
    
    const addMemberSimpleForm = document.getElementById('add-member-simple-form');
    if (addMemberSimpleForm) {
        addMemberSimpleForm.addEventListener('submit', handleAddSimpleMember);
    }
    
    // Close modal when clicking background
    const modalBg = document.querySelector('.modal-background');
    if (modalBg) {
        modalBg.addEventListener('click', closeEnsembleModal);
    }
    
    updateNavLinks();
});