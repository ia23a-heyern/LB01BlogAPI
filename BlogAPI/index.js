// BlogAPI JavaScript Funktionalität

// Globale Variablen
let posts = [
    {
        id: 1,
        title: "Willkommen bei BlogAPI",
        content: "Dies ist der erste Post in unserem Blog-System. BlogAPI bietet eine einfache und intuitive Möglichkeit, Blog-Posts zu verwalten. Mit unserem System können Sie Posts erstellen, bearbeiten, löschen und durchsuchen.",
        image_path: null,
        user_id: 1
    },
    {
        id: 2,
        title: "Features unserer Plattform",
        content: "Unsere BlogAPI-Plattform bietet zahlreiche Features: Sichere Validierung aller Eingaben, Upload von Bildern in JPEG und PNG Format, responsive Design für alle Geräte, und unterschiedliche Benutzerrollen für optimale Sicherheit.",
        image_path: null,
        user_id: 1
    }
];

let currentUser = null;
let nextPostId = 3;

// Navigation zwischen Seiten
function loadPage(page) {
    const content = document.getElementById('content');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Entferne active class von allen Links
    navLinks.forEach(link => link.classList.remove('current-page'));

    switch(page) {
        case 'posts':
            content.innerHTML = getPostsPage();
            if (navLinks[1]) navLinks[1].classList.add('current-page');
            break;
        case 'create':
            content.innerHTML = getCreatePostPage();
            if (navLinks[2]) navLinks[2].classList.add('current-page');
            setupFormHandlers();
            break;
        case 'login':
            content.innerHTML = getLoginPage();
            if (navLinks[3]) navLinks[3].classList.add('current-page');
            break;
        case 'post':
            // Wird durch showPost() aufgerufen
            break;
        default:
            content.innerHTML = getHomePage();
            if (navLinks[0]) navLinks[0].classList.add('current-page');
    }
}

// Seiten-Templates
function getHomePage() {
    return `
        <section class="hero">
            <h1><i class="fas fa-blog"></i> Willkommen bei BlogAPI</h1>
            <p>Ihre moderne Plattform für das Verwalten von Blog-Posts</p>
        </section>

        <div class="cards">
            <div class="card">
                <h3><i class="fas fa-list"></i> Posts anzeigen</h3>
                <p>Durchsuchen Sie alle verfügbaren Blog-Posts und lesen Sie interessante Inhalte.</p>
                <a href="javascript:loadPage('posts')" class="btn">Alle Posts ansehen</a>
            </div>

            <div class="card">
                <h3><i class="fas fa-plus-circle"></i> Neuen Post erstellen</h3>
                <p>Erstellen Sie neue Blog-Posts mit Titel, Inhalt und optionalen Bildern.</p>
                <a href="javascript:loadPage('create')" class="btn">Post erstellen</a>
            </div>

            <div class="card">
                <h3><i class="fas fa-user-shield"></i> Admin-Bereich</h3>
                <p>Verwalten Sie Posts als Administrator - bearbeiten und löschen Sie Inhalte.</p>
                <a href="javascript:loadPage('login')" class="btn">Anmelden</a>
            </div>
        </div>

        <section class="features">
            <h2><i class="fas fa-star"></i> Features</h2>
            <div class="feature-list">
                <div class="feature-item">
                    <i class="fas fa-shield-alt"></i>
                    <h4>Sichere Validierung</h4>
                    <p>Umfassende Eingabevalidierung für alle Formulare</p>
                </div>
                <div class="feature-item">
                    <i class="fas fa-image"></i>
                    <h4>Bild-Upload</h4>
                    <p>Unterstützung für JPEG/PNG Bilder bis 5MB</p>
                </div>
                <div class="feature-item">
                    <i class="fas fa-mobile-alt"></i>
                    <h4>Responsive Design</h4>
                    <p>Optimiert für alle Geräte und Bildschirmgrößen</p>
                </div>
                <div class="feature-item">
                    <i class="fas fa-users"></i>
                    <h4>Benutzerrollen</h4>
                    <p>Unterschiedliche Zugriffsrechte für User und Admins</p>
                </div>
            </div>
        </section>
    `;
}

function getPostsPage() {
    let postsHtml = `
        <section class="hero">
            <h1><i class="fas fa-list"></i> Alle Blog-Posts</h1>
            <p>Entdecken Sie interessante Artikel und Beiträge</p>
        </section>

        <div class="cards">
    `;

    posts.forEach(post => {
        postsHtml += `
            <div class="card">
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
                <a href="javascript:showPost(${post.id})" class="btn">Vollständig lesen</a>
                ${currentUser && currentUser.role === 'admin' ? `
                    <a href="javascript:editPost(${post.id})" class="btn" style="margin-left: 10px; background: linear-gradient(45deg, #28a745, #20c997);">Bearbeiten</a>
                    <a href="javascript:deletePost(${post.id})" class="btn" style="margin-left: 10px; background: linear-gradient(45deg, #dc3545, #e74c3c);">Löschen</a>
                ` : ''}
            </div>
        `;
    });

    postsHtml += `
        </div>
        <div style="text-align: center; margin-top: 2rem;">
            <a href="javascript:loadPage('create')" class="btn">
                <i class="fas fa-plus"></i> Neuen Post erstellen
            </a>
        </div>
    `;

    return postsHtml;
}

function getCreatePostPage() {
    return `
        <section class="hero">
            <h1><i class="fas fa-plus-circle"></i> Neuen Post erstellen</h1>
            <p>Teilen Sie Ihre Gedanken und Ideen mit der Welt</p>
        </section>

        <div class="card" style="max-width: 800px; margin: 0 auto;">
            <form id="createPostForm" onsubmit="createPost(event)">
                <div class="form-field">
                    <label for="title">
                        Titel <span style="color: red;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        required 
                        maxlength="255"
                        placeholder="Geben Sie einen aussagekräftigen Titel ein"
                    >
                    <div id="titleError" class="error-message"></div>
                </div>

                <div class="form-field">
                    <label for="content">
                        Inhalt <span style="color: red;">*</span>
                    </label>
                    <textarea 
                        id="content" 
                        name="content" 
                        required 
                        rows="10"
                        maxlength="5000"
                        placeholder="Schreiben Sie hier Ihren Artikel (mindestens 10 Zeichen, maximal 5000 Zeichen)"
                    ></textarea>
                    <div class="char-counter">
                        <span id="contentCounter">0</span>/5000 Zeichen
                    </div>
                    <div id="contentError" class="error-message"></div>
                </div>

                <div class="form-field">
                    <label for="image">
                        Bild (optional)
                    </label>
                    <input 
                        type="file" 
                        id="image" 
                        name="image" 
                        accept="image/jpeg,image/jpg,image/png"
                    >
                    <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">
                        Erlaubte Formate: JPEG, PNG | Maximale Größe: 5MB
                    </div>
                    <div id="imageError" class="error-message"></div>
                </div>

                <div style="text-align: center;">
                    <button type="submit" class="btn" style="margin-right: 1rem;">
                        <i class="fas fa-save"></i> Post erstellen
                    </button>
                    <a href="javascript:loadPage('posts')" class="btn" style="background: linear-gradient(45deg, #6c757d, #5a6268);">
                        <i class="fas fa-times"></i> Abbrechen
                    </a>
                </div>
            </form>
        </div>
    `;
}

function getLoginPage() {
    return `
        <section class="hero">
            <h1><i class="fas fa-sign-in-alt"></i> Anmeldung</h1>
            <p>Melden Sie sich an, um Posts zu verwalten</p>
        </section>

        <div class="card" style="max-width: 500px; margin: 0 auto;">
            <form id="loginForm" onsubmit="login(event)">
                <div class="form-field">
                    <label for="username">
                        Benutzername <span style="color: red;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required 
                        placeholder="Benutzername eingeben"
                    >
                    <div id="usernameError" class="error-message"></div>
                </div>

                <div class="form-field">
                    <label for="password">
                        Passwort <span style="color: red;">*</span>
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required 
                        placeholder="Passwort eingeben"
                    >
                    <div id="passwordError" class="error-message"></div>
                </div>

                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <button type="submit" class="btn">
                        <i class="fas fa-sign-in-alt"></i> Anmelden
                    </button>
                </div>

                <div class="info-message">
                    <h4 style="margin-bottom: 0.5rem;">Test-Zugangsdaten:</h4>
                    <p style="margin: 0;">
                        <strong>Admin:</strong> Max15 | <strong>Passwort:</strong> 12334<br>
                        <strong>User:</strong> User1 | <strong>Passwort:</strong> pass123
                    </p>
                </div>
            </form>

            ${currentUser ? `
                <div class="success-message" style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 0.5rem;">Angemeldet als:</h4>
                    <p style="margin: 0;">${escapeHtml(currentUser.username)} (${currentUser.role})</p>
                    <button onclick="logout()" class="btn" style="margin-top: 1rem; background: linear-gradient(45deg, #dc3545, #e74c3c);">
                        <i class="fas fa-sign-out-alt"></i> Abmelden
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// Post-Funktionen
function createPost(event) {
    event.preventDefault();

    const form = event.target;
    const title = form.title.value.trim();
    const content = form.content.value.trim();
    const imageFile = form.image.files[0];

    // Validierung
    let isValid = true;

    // Titel validieren
    if (!title) {
        showError('titleError', 'Titel ist ein Pflichtfeld');
        isValid = false;
    } else if (title.length > 255) {
        showError('titleError', 'Titel darf maximal 255 Zeichen haben');
        isValid = false;
    } else {
        hideError('titleError');
    }

    // Content validieren
    if (!content) {
        showError('contentError', 'Inhalt ist ein Pflichtfeld');
        isValid = false;
    } else if (content.length < 10) {
        showError('contentError', 'Inhalt muss mindestens 10 Zeichen haben');
        isValid = false;
    } else if (content.length > 5000) {
        showError('contentError', 'Inhalt darf maximal 5000 Zeichen haben');
        isValid = false;
    } else {
        hideError('contentError');
    }

    // Bild validieren (wenn vorhanden)
    if (imageFile) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(imageFile.type)) {
            showError('imageError', 'Nur JPEG und PNG Dateien sind erlaubt');
            isValid = false;
        } else if (imageFile.size > maxSize) {
            showError('imageError', 'Datei ist zu groß (max. 5MB)');
            isValid = false;
        } else {
            hideError('imageError');
        }
    }

    if (isValid) {
        // Post erstellen
        const newPost = {
            id: nextPostId++,
            title: title,
            content: content,
            image_path: imageFile ? `uploads/${imageFile.name}` : null,
            user_id: currentUser ? currentUser.id : 1
        };

        posts.unshift(newPost);

        // Erfolg anzeigen
        showSuccessMessage('Post wurde erfolgreich erstellt!');
        setTimeout(() => loadPage('posts'), 1500);
    }
}

function showPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const content = document.getElementById('content');
    content.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <a href="javascript:loadPage('posts')" class="btn" style="margin-bottom: 2rem; background: linear-gradient(45deg, #6c757d, #5a6268);">
                <i class="fas fa-arrow-left"></i> Zurück zu allen Posts
            </a>
            
            <div class="card">
                <h1 style="color: #667eea; margin-bottom: 1rem;">${escapeHtml(post.title)}</h1>
                ${post.image_path ? `<img src="${post.image_path}" alt="${escapeHtml(post.title)}" style="max-width: 100%; height: auto; border-radius: 10px; margin-bottom: 1rem;">` : ''}
                <div style="line-height: 1.8; font-size: 1.1rem;">
                    ${escapeHtml(post.content).replace(/\n/g, '<br>')}
                </div>
                
                ${currentUser && currentUser.role === 'admin' ? `
                    <div style="margin-top: 2rem; text-align: center; border-top: 1px solid #eee; padding-top: 1rem;">
                        <a href="javascript:editPost(${post.id})" class="btn" style="margin-right: 1rem; background: linear-gradient(45deg, #28a745, #20c997);">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </a>
                        <a href="javascript:deletePost(${post.id})" class="btn" style="background: linear-gradient(45deg, #dc3545, #e74c3c);">
                            <i class="fas fa-trash"></i> Löschen
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const content = document.getElementById('content');
    content.innerHTML = `
        <section class="hero">
            <h1><i class="fas fa-edit"></i> Post bearbeiten</h1>
            <p>Bearbeiten Sie den ausgewählten Blog-Post</p>
        </section>

        <div class="card" style="max-width: 800px; margin: 0 auto;">
            <form id="editPostForm" onsubmit="updatePost(event, ${postId})">
                <div class="form-field">
                    <label for="editTitle">
                        Titel <span style="color: red;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="editTitle" 
                        name="title" 
                        required 
                        value="${escapeHtml(post.title)}"
                        maxlength="255"
                        placeholder="Geben Sie einen aussagekräftigen Titel ein"
                    >
                    <div id="editTitleError" class="error-message"></div>
                </div>

                <div class="form-field">
                    <label for="editContent">
                        Inhalt <span style="color: red;">*</span>
                    </label>
                    <textarea 
                        id="editContent" 
                        name="content" 
                        required 
                        rows="10"
                        maxlength="5000"
                        placeholder="Schreiben Sie hier Ihren Artikel (mindestens 10 Zeichen, maximal 5000 Zeichen)"
                    >${escapeHtml(post.content)}</textarea>
                    <div class="char-counter">
                        <span id="editContentCounter">${post.content.length}</span>/5000 Zeichen
                    </div>
                    <div id="editContentError" class="error-message"></div>
                </div>

                <div class="form-field">
                    <label for="editImage">
                        Bild (optional)
                    </label>
                    ${post.image_path ? `
                        <div style="margin-bottom: 1rem;">
                            <img src="${post.image_path}" alt="Aktuelles Bild" style="max-width: 200px; height: auto; border-radius: 5px;">
                            <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Aktuelles Bild - Wählen Sie eine neue Datei, um es zu ersetzen</p>
                        </div>
                    ` : ''}
                    <input 
                        type="file" 
                        id="editImage" 
                        name="image" 
                        accept="image/jpeg,image/jpg,image/png"
                    >
                    <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">
                        Erlaubte Formate: JPEG, PNG | Maximale Größe: 5MB
                    </div>
                    <div id="editImageError" class="error-message"></div>
                </div>

                <div style="text-align: center;">
                    <button type="submit" class="btn" style="margin-right: 1rem;">
                        <i class="fas fa-save"></i> Änderungen speichern
                    </button>
                    <a href="javascript:showPost(${postId})" class="btn" style="background: linear-gradient(45deg, #6c757d, #5a6268);">
                        <i class="fas fa-times"></i> Abbrechen
                    </a>
                </div>
            </form>
        </div>
    `;

    // Setup form handlers für edit form
    setupEditFormHandlers();
}

function updatePost(event, postId) {
    event.preventDefault();

    const form = event.target;
    const title = form.title.value.trim();
    const content = form.content.value.trim();
    const imageFile = form.image.files[0];

    // Validierung
    let isValid = true;

    // Titel validieren
    if (!title) {
        showError('editTitleError', 'Titel ist ein Pflichtfeld');
        isValid = false;
    } else if (title.length > 255) {
        showError('editTitleError', 'Titel darf maximal 255 Zeichen haben');
        isValid = false;
    } else {
        hideError('editTitleError');
    }

    // Content validieren
    if (!content) {
        showError('editContentError', 'Inhalt ist ein Pflichtfeld');
        isValid = false;
    } else if (content.length < 10) {
        showError('editContentError', 'Inhalt muss mindestens 10 Zeichen haben');
        isValid = false;
    } else if (content.length > 5000) {
        showError('editContentError', 'Inhalt darf maximal 5000 Zeichen haben');
        isValid = false;
    } else {
        hideError('editContentError');
    }

    // Bild validieren (wenn vorhanden)
    if (imageFile) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(imageFile.type)) {
            showError('editImageError', 'Nur JPEG und PNG Dateien sind erlaubt');
            isValid = false;
        } else if (imageFile.size > maxSize) {
            showError('editImageError', 'Datei ist zu groß (max. 5MB)');
            isValid = false;
        } else {
            hideError('editImageError');
        }
    }

    if (isValid) {
        // Post aktualisieren
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts[postIndex].title = title;
            posts[postIndex].content = content;
            if (imageFile) {
                posts[postIndex].image_path = `uploads/${imageFile.name}`;
            }
        }

        // Erfolg anzeigen
        showSuccessMessage('Post wurde erfolgreich aktualisiert!');
        setTimeout(() => showPost(postId), 1500);
    }
}

function deletePost(postId) {
    if (confirm('Sind Sie sicher, dass Sie diesen Post löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts.splice(postIndex, 1);
            showSuccessMessage('Post wurde erfolgreich gelöscht!');
            setTimeout(() => loadPage('posts'), 1500);
        }
    }
}

// Login/Logout Funktionen
function login(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    // Validierung
    let isValid = true;

    if (!username) {
        showError('usernameError', 'Benutzername ist erforderlich');
        isValid = false;
    } else {
        hideError('usernameError');
    }

    if (!password) {
        showError('passwordError', 'Passwort ist erforderlich');
        isValid = false;
    } else {
        hideError('passwordError');
    }

    if (isValid) {
        // Simulierte Benutzer-Authentifizierung
        if (username === 'Max15' && password === '12334') {
            currentUser = { id: 1, username: 'Max15', role: 'admin' };
            showSuccessMessage('Erfolgreich als Administrator angemeldet!');
            updateNavigation();
            setTimeout(() => loadPage('posts'), 1500);
        } else if (username === 'User1' && password === 'pass123') {
            currentUser = { id: 2, username: 'User1', role: 'user' };
            showSuccessMessage('Erfolgreich als Benutzer angemeldet!');
            updateNavigation();
            setTimeout(() => loadPage('posts'), 1500);
        } else {
            showError('passwordError', 'Ungültige Anmeldedaten');
        }
    }
}

function logout() {
    currentUser = null;
    updateNavigation();
    showSuccessMessage('Sie wurden erfolgreich abgemeldet!');
    setTimeout(() => loadPage('home'), 1500);
}

function updateNavigation() {
    const nav = document.querySelector('.nav-links');
    if (nav) {
        nav.innerHTML = `
            <li><a href="javascript:loadPage('home')">Startseite</a></li>
            <li><a href="javascript:loadPage('posts')">Alle Posts</a></li>
            <li><a href="javascript:loadPage('create')">Post erstellen</a></li>
            ${currentUser ?
            `<li><a href="javascript:logout()" style="background: #dc3545; color: white; border-radius: 20px;">${escapeHtml(currentUser.username)} (Abmelden)</a></li>` :
            `<li><a href="javascript:loadPage('login')">Login</a></li>`
        }
        `;
    }
}

// Form Handler Setup
function setupFormHandlers() {
    // Character counter für Content
    const contentField = document.getElementById('content');
    if (contentField) {
        contentField.addEventListener('input', function() {
            const counter = document.getElementById('contentCounter');
            if (counter) {
                counter.textContent = this.value.length;

                // Färbung basierend auf Länge
                if (this.value.length > 4500) {
                    counter.style.color = '#dc3545';
                } else if (this.value.length > 4000) {
                    counter.style.color = '#ffc107';
                } else {
                    counter.style.color = '#666';
                }
            }
        });
    }
}

function setupEditFormHandlers() {
    // Character counter für Edit Content
    const editContentField = document.getElementById('editContent');
    if (editContentField) {
        editContentField.addEventListener('input', function() {
            const counter = document.getElementById('editContentCounter');
            if (counter) {
                counter.textContent = this.value.length;

                // Färbung basierend auf Länge
                if (this.value.length > 4500) {
                    counter.style.color = '#dc3545';
                } else if (this.value.length > 4000) {
                    counter.style.color = '#ffc107';
                } else {
                    counter.style.color = '#666';
                }
            }
        });
    }
}

// Hilfsfunktionen
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');

        // Feld als fehlerhaft markieren
        const field = errorElement.closest('.form-field');
        if (field) {
            field.classList.add('error');
        }
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.remove('show');

        // Fehler-Markierung entfernen
        const field = errorElement.closest('.form-field');
        if (field) {
            field.classList.remove('error');
        }
    }
}

function showSuccessMessage(message) {
    // Erstelle temporäre Erfolgsmeldung
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    document.body.appendChild(successDiv);

    // Entferne nach 3 Sekunden
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility Funktionen
function formatDate(date) {
    return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // ESC zum Schließen von Modals/Zurück
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal');
        if (activeModal) {
            activeModal.style.display = 'none';
        }
    }
});

// Animations CSS (wird dynamisch hinzugefügt)
const animationStyles = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Füge Animationen zum Head hinzu
if (!document.getElementById('animation-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'animation-styles';
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
}

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    // Standard-Seite laden
    loadPage('home');

    // Service Worker registrieren (optional für PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
});

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showSuccessMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
});

// Unhandled Promise Rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    e.preventDefault();
});