// BlogAPI JavaScript - Vollständige Version mit Navigation
// Alle Funktionen wurden konsolidiert und Fehler behoben

// Globale Variablen
let posts = [
    {
        id: 1,
        title: "Willkommen bei BlogAPI",
        content: "Dies ist der erste Post in unserem Blog-System. BlogAPI bietet eine einfache und intuitive Möglichkeit, Blog-Posts zu verwalten. Mit unserem System können Sie Posts erstellen, bearbeiten, löschen und durchsuchen.",
        image_path: null,
        user_id: 1,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        title: "Features unserer Plattform",
        content: "Unsere BlogAPI-Plattform bietet zahlreiche Features: Sichere Validierung aller Eingaben, Upload von Bildern in JPEG und PNG Format, responsive Design für alle Geräte, und unterschiedliche Benutzerrollen für optimale Sicherheit.",
        image_path: null,
        user_id: 1,
        created_at: new Date().toISOString()
    }
];

let currentUser = null;
let nextPostId = 3;

// NAVIGATION ZWISCHEN SEITEN (von index.js)
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

// SEITEN-TEMPLATES (von index.js)
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
                    
                    <!-- Image Preview -->
                    <div id="imagePreview" style="display: none; margin-top: 1rem;">
                        <img id="previewImg" style="max-width: 200px; height: auto; border-radius: 5px;" alt="Vorschau">
                        <button type="button" onclick="removeImage()" style="display: block; margin-top: 0.5rem; background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer;">
                            <i class="fas fa-times"></i> Bild entfernen
                        </button>
                    </div>
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

// VALIDIERUNGS-FUNKTIONEN
function validateTitle(title) {
    const trimmed = title.trim();

    if (!trimmed) {
        return { valid: false, message: 'Titel ist ein Pflichtfeld' };
    }

    if (trimmed.length < 3) {
        return { valid: false, message: 'Titel muss mindestens 3 Zeichen haben' };
    }

    if (trimmed.length > 255) {
        return { valid: false, message: 'Titel darf maximal 255 Zeichen haben' };
    }

    return { valid: true, message: '' };
}

function validateContent(content) {
    const trimmed = content.trim();

    if (!trimmed) {
        return { valid: false, message: 'Inhalt ist ein Pflichtfeld' };
    }

    if (trimmed.length < 10) {
        return { valid: false, message: 'Inhalt muss mindestens 10 Zeichen haben' };
    }

    if (trimmed.length > 5000) {
        return { valid: false, message: 'Inhalt darf maximal 5000 Zeichen haben' };
    }

    return { valid: true, message: '' };
}

function validateImage(file) {
    if (!file) {
        return { valid: true, message: '' }; // Optional field
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, message: 'Nur JPEG und PNG Dateien sind erlaubt' };
    }

    if (file.size > maxSize) {
        return { valid: false, message: 'Datei ist zu groß (max. 5MB)' };
    }

    return { valid: true, message: '' };
}

// ERROR HANDLING
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');

        const field = errorElement.closest('.form-field');
        if (field) {
            field.classList.add('error');
        }
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');

        const field = errorElement.closest('.form-field');
        if (field) {
            field.classList.remove('error');
        }
    }
}

function showSuccessMessage(message) {
    const existing = document.querySelectorAll('.temp-success-message');
    existing.forEach(el => el.remove());

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message temp-success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    document.body.appendChild(successDiv);

    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }
    }, 3000);
}

// POST-FUNKTIONEN (korrigiert für SPA)
function createPost(event) {
    event.preventDefault();

    const form = event.target;
    const title = form.title.value;
    const content = form.content.value;
    const imageFile = form.image.files[0];

    let isValid = true;

    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
        showError('titleError', titleValidation.message);
        isValid = false;
    } else {
        hideError('titleError');
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
        showError('contentError', contentValidation.message);
        isValid = false;
    } else {
        hideError('contentError');
    }

    const imageValidation = validateImage(imageFile);
    if (!imageValidation.valid) {
        showError('imageError', imageValidation.message);
        isValid = false;
    } else {
        hideError('imageError');
    }

    if (isValid) {
        const newPost = {
            id: nextPostId++,
            title: title.trim(),
            content: content.trim(),
            image_path: imageFile ? `uploads/${imageFile.name}` : null,
            user_id: currentUser ? currentUser.id : 1,
            created_at: new Date().toISOString()
        };

        posts.unshift(newPost);
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

    setupEditFormHandlers();
}

function updatePost(event, postId) {
    event.preventDefault();

    const form = event.target;
    const title = form.title.value;
    const content = form.content.value;
    const imageFile = form.image.files[0];

    let isValid = true;

    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
        showError('editTitleError', titleValidation.message);
        isValid = false;
    } else {
        hideError('editTitleError');
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
        showError('editContentError', contentValidation.message);
        isValid = false;
    } else {
        hideError('editContentError');
    }

    const imageValidation = validateImage(imageFile);
    if (!imageValidation.valid) {
        showError('editImageError', imageValidation.message);
        isValid = false;
    } else {
        hideError('editImageError');
    }

    if (isValid) {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts[postIndex].title = title.trim();
            posts[postIndex].content = content.trim();
            if (imageFile) {
                posts[postIndex].image_path = `uploads/${imageFile.name}`;
            }
        }

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

// LOGIN/LOGOUT FUNKTIONEN
function login(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();

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

// IMAGE HANDLING
function handleImagePreview(input) {
    const file = input.files[0];
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (file) {
        const validation = validateImage(file);

        if (!validation.valid) {
            showError('imageError', validation.message);
            input.value = '';
            if (preview) preview.style.display = 'none';
            return;
        }

        hideError('imageError');

        if (preview && previewImg) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    } else {
        hideImagePreview();
    }
}

function hideImagePreview() {
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.style.display = 'none';
    }
}

function removeImage() {
    const imageField = document.getElementById('image');
    if (imageField) {
        imageField.value = '';
        hideImagePreview();
        hideError('imageError');
    }
}

// FORM HANDLER SETUP
function setupFormHandlers() {
    const contentField = document.getElementById('content');
    if (contentField) {
        contentField.addEventListener('input', function() {
            const counter = document.getElementById('contentCounter');
            if (counter) {
                counter.textContent = this.value.length;

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

    const imageField = document.getElementById('image');
    if (imageField) {
        imageField.addEventListener('change', function() {
            handleImagePreview(this);
        });
    }
}

function setupEditFormHandlers() {
    const editContentField = document.getElementById('editContent');
    if (editContentField) {
        editContentField.addEventListener('input', function() {
            const counter = document.getElementById('editContentCounter');
            if (counter) {
                counter.textContent = this.value.length;

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

// UTILITY FUNCTIONS
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    if (!date) date = new Date();
    return new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// DELETE FUNCTIONS (für andere Seiten)
function deletePostById(postId) {
    if (!currentUser || currentUser.role !== 'admin') {
        showSuccessMessage('Sie haben keine Berechtigung, Posts zu löschen');
        return;
    }

    if (confirm('Sind Sie sicher, dass Sie diesen Post löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts.splice(postIndex, 1);
            showSuccessMessage('Post wurde erfolgreich gelöscht!');

            if (typeof loadPostsOnPage === 'function') {
                setTimeout(() => loadPostsOnPage(), 1000);
            }
        } else {
            showSuccessMessage('Post konnte nicht gefunden werden');
        }
    }
}

function loadPostsOnPage() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    let postsHtml = '';
    posts.forEach(post => {
        postsHtml += `
            <div class="card">
                <h3>${escapeHtml(post.title)}</h3>
                <p>${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
                <a href="post.html?id=${post.id}" class="btn">Vollständig lesen</a>
                ${currentUser && currentUser.role === 'admin' ? `
                    <a href="edit.html?id=${post.id}" class="btn" style="margin-left: 10px; background: linear-gradient(45deg, #28a745, #20c997);">Bearbeiten</a>
                    <button onclick="deletePostById(${post.id})" class="btn" style="margin-left: 10px; background: linear-gradient(45deg, #dc3545, #e74c3c);">Löschen</button>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = postsHtml;
}

// FUNKTIONEN FÜR ANDERE SEITEN (login.html, etc.)
function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    const loginButton = document.getElementById('loginButton');

    if (loginButton) {
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
        loginButton.disabled = true;
    }

    let isValid = true;

    if (!username) {
        showError('usernameError', 'Benutzername ist erforderlich');
        isValid = false;
    } else if (username.length < 3) {
        showError('usernameError', 'Benutzername muss mindestens 3 Zeichen haben');
        isValid = false;
    } else {
        hideError('usernameError');
    }

    if (!password) {
        showError('passwordError', 'Passwort ist erforderlich');
        isValid = false;
    } else if (password.length < 4) {
        showError('passwordError', 'Passwort muss mindestens 4 Zeichen haben');
        isValid = false;
    } else {
        hideError('passwordError');
    }

    setTimeout(() => {
        if (isValid) {
            if (username === 'Max15' && password === '12334') {
                currentUser = { id: 1, username: 'Max15', role: 'admin' };
                showSuccessMessage('Erfolgreich als Administrator angemeldet!');

                setTimeout(() => {
                    window.location.href = 'posts.html';
                }, 1500);

            } else if (username === 'User1' && password === 'pass123') {
                currentUser = { id: 2, username: 'User1', role: 'user' };
                showSuccessMessage('Erfolgreich als Benutzer angemeldet!');

                setTimeout(() => {
                    window.location.href = 'posts.html';
                }, 1500);

            } else {
                showError('passwordError', 'Ungültige Anmeldedaten. Bitte überprüfen Sie Benutzername und Passwort.');
                resetLoginButton();
            }
        } else {
            resetLoginButton();
        }
    }, 500);

    function resetLoginButton() {
        if (loginButton) {
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
            loginButton.disabled = false;
        }
    }
}

function handleLogout() {
    if (confirm('Möchten Sie sich wirklich abmelden?')) {
        currentUser = null;
        showSuccessMessage('Sie wurden erfolgreich abgemeldet!');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function handleCreatePost(event) {
    event.preventDefault();

    const form = event.target;
    const title = form.title.value;
    const content = form.content.value;
    const imageFile = form.image.files[0];

    let isValid = true;

    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
        showError('titleError', titleValidation.message);
        isValid = false;
    } else {
        hideError('titleError');
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
        showError('contentError', contentValidation.message);
        isValid = false;
    } else {
        hideError('contentError');
    }

    const imageValidation = validateImage(imageFile);
    if (!imageValidation.valid) {
        showError('imageError', imageValidation.message);
        isValid = false;
    } else {
        hideError('imageError');
    }

    if (isValid) {
        const newPost = {
            id: nextPostId++,
            title: title.trim(),
            content: content.trim(),
            image_path: imageFile ? `uploads/${imageFile.name}` : null,
            user_id: currentUser ? currentUser.id : 1,
            created_at: new Date().toISOString()
        };

        posts.unshift(newPost);
        showSuccessMessage('Post wurde erfolgreich erstellt!');

        form.reset();
        hideImagePreview();

        setTimeout(() => {
            window.location.href = 'posts.html';
        }, 1500);
    }
}

function setupCreateFormHandlers() {
    const contentField = document.getElementById('content');
    if (contentField) {
        contentField.addEventListener('input', function() {
            const counter = document.getElementById('contentCounter');
            if (counter) {
                counter.textContent = this.value.length;

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

    const imageField = document.getElementById('image');
    if (imageField) {
        imageField.addEventListener('change', function() {
            handleImagePreview(this);
        });
    }
}

function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggleIcon');

    if (passwordField && toggleIcon) {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordField.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }
}

function quickLogin(type) {
    if (type === 'admin') {
        document.getElementById('username').value = 'Max15';
        document.getElementById('password').value = '12334';
    } else {
        document.getElementById('username').value = 'User1';
        document.getElementById('password').value = 'pass123';
    }

    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

// ERROR PREVENTION
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    e.preventDefault();
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    e.preventDefault();
});

// ANIMATIONS CSS
if (!document.getElementById('animation-styles')) {
    const animationStyles = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'animation-styles';
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    // Standard-Seite laden wenn auf index.html
    if (document.getElementById('content')) {
        loadPage('home');
    }

    // Service Worker registrieren (optional für PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
});