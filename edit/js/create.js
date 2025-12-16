"use strict";

// ============================================
// VALIDATION
// ============================================
function validateForm(form) {
    const title = form.querySelector('#title').value.trim();
    
    if (!title) {
        showNotification("Please enter a concert title", "danger");
        return false;
    }
    
    if (title.length < 3) {
        showNotification("Concert title must be at least 3 characters long", "warning");
        return false;
    }
    
    return true;
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = "info", duration = 4000) {
    const container = document.querySelector("main") || document.body;
    const notification = document.createElement("div");
    notification.className = `notification is-${type} is-light`;
    notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s ease";
    
    container.insertBefore(notification, container.firstChild);
    
    setTimeout(() => notification.style.opacity = "1", 10);
    
    notification.querySelector(".delete").addEventListener("click", () => {
        removeNotification(notification);
    });
    
    setTimeout(() => removeNotification(notification), duration);
}

function removeNotification(notification) {
    notification.style.opacity = "0";
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// ============================================
// FORM SUBMISSION
// ============================================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // 1. Validate
    if (!validateForm(form)) {
        return;
    }
    
    // 2. Show loading state
    submitButton.classList.add("is-loading");
    submitButton.disabled = true;
    
    // 3. Get form data
    const title = form.querySelector('#title').value.trim();
    
    // 4. Make API call (TODO - currently simulated)
    // const response = await fetch('/api/concerts', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ title })
    // });
    
    // 5. Simulate success
    setTimeout(() => {
        const newConcertId = Math.floor(Math.random() * 10000);
        showNotification("Concert created successfully!", "success");
        
        // 6. Redirect to edit page
        setTimeout(() => {
            window.location.href = `./title.html?id=${newConcertId}`;
        }, 1000);
    }, 500);
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Attach form handler
    const form = document.querySelector("form");
    form.addEventListener("submit", handleFormSubmit);
    
    // 2. Auto-focus title input
    const titleInput = document.querySelector("#title");
    titleInput.focus();
    
    // 3. Add character counter
    const maxLength = 100;
    const helpText = document.createElement("p");
    helpText.className = "help";
    titleInput.parentElement.appendChild(helpText);
    
    const updateCounter = () => {
        const remaining = maxLength - titleInput.value.length;
        helpText.textContent = `${remaining} characters remaining`;
        helpText.className = remaining < 20 
            ? "help has-text-warning" 
            : "help has-text-grey";
    };
    
    titleInput.addEventListener("input", updateCounter);
    titleInput.maxLength = maxLength;
    updateCounter();
});