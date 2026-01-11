// CV Generator Application
// Main application logic for CV editing, preview, and export

const app = {
    // Data model
    data: {
        personalInfo: {
            firstName: '',
            lastName: '',
            title: '',
            subtitle: '',
            location: '',
            phone: '',
            email: '',
            linkedin: ''
        },
        experience: [],
        education: [],
        softSkills: [],
        technicalSkills: [],
        certifications: []
    },

    // Paper size selection
    paperSize: 'letter', // 'letter' or 'a4'

    // CV language selection
    cvLanguage: 'es', // 'es' or 'en'

    // Bilingual translations
    translations: {
        es: {
            experience: 'EXPERIENCIA PROFESIONAL',
            education: 'EDUCACIÓN',
            softSkills: 'HABILIDADES BLANDAS',
            hardSkills: 'HABILIDADES TÉCNICAS',
            certifications: 'CERTIFICACIONES'
        },
        en: {
            experience: 'PROFESSIONAL EXPERIENCE',
            education: 'EDUCATION',
            softSkills: 'SOFT SKILLS',
            hardSkills: 'HARD SKILLS',
            certifications: 'CERTIFICATIONS'
        }
    },

    // Initialize the application
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderForm();
        this.renderPreview();
        this.loadInitialData();
    },

    // Load initial data from existing CV if available
    loadInitialData() {
        // Check if there's any saved data
        if (this.data.experience.length === 0) {
            // Load default data from the existing CV structure
            this.data.personalInfo = {
                firstName: 'Nombre',
                lastName: 'Apellido',
                title: 'Título Profesional',
                subtitle: 'Subtítulo Profesional',
                location: 'Ciudad, País',
                phone: '+1 234 567 8900',
                email: 'correo@ejemplo.com',
                linkedin: 'linkedin.com/in/usuario'
            };

            this.data.experience = [
                {
                    position: 'PUESTO DE TRABAJO',
                    company: 'Nombre de la Empresa',
                    period: 'Enero 2024 - Presente',
                    location: 'Ciudad, País',
                    responsibilities: [
                        'Descripción de la responsabilidad o logro principal en este puesto',
                        'Otra responsabilidad clave demostrando habilidades específicas',
                        'Logro cuantificable o proyecto importante realizado'
                    ]
                },
                {
                    position: 'PUESTO ANTERIOR',
                    company: 'Empresa Anterior',
                    period: 'Enero 2022 - Diciembre 2023',
                    location: 'Ciudad, País',
                    responsibilities: [
                        'Responsabilidad principal en el cargo anterior',
                        'Colaboración con equipos multidisciplinarios',
                        'Solución de problemas y mejoras implementadas'
                    ]
                }
            ];

            this.data.education = [
                {
                    degree: "TITULO UNIVERSITARIO",
                    institution: 'Nombre de la Universidad',
                    period: '2018 - 2022',
                    location: 'Ciudad, País',
                    note: 'Mención honorífica o especialidad'
                }
            ];

            this.data.softSkills = [
                {
                    category: 'Personal',
                    items: [
                        'Liderazgo',
                        'Trabajo en equipo',
                        'Resolución de problemas'
                    ]
                }
            ];

            this.data.technicalSkills = [
                {
                    category: 'Software',
                    items: ['Herramienta 1', 'Herramienta 2']
                },
                {
                    category: 'Idiomas',
                    items: ['Español (Nativo)', 'Inglés (Intermedio)']
                }
            ];

            this.data.certifications = [
                {
                    name: 'Nombre de Certificación',
                    issuer: 'Entidad Emisora'
                }
            ];

            this.saveToStorage();
        }

        this.renderForm();
        this.renderPreview();
    },

    // Setup event listeners
    setupEventListeners() {
        const form = document.getElementById('cv-form');
        form.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.updateData();
                this.renderPreview();
            }
        });

        // JSON import file input
        document.getElementById('json-import-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        this.data = JSON.parse(event.target.result);
                        this.saveToStorage();
                        this.renderForm();
                        this.renderPreview();
                        this.showToast('Información cargada correctamente!', 'success');
                    } catch (error) {
                        this.showToast('Error cargando la información.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    },

    // Update data model from form
    updateData() {
        const form = document.getElementById('cv-form');
        const formData = new FormData(form);

        // Update personal info
        this.data.personalInfo = {
            firstName: formData.get('firstName') || '',
            lastName: formData.get('lastName') || '',
            title: formData.get('title') || '',
            subtitle: formData.get('subtitle') || '',
            location: formData.get('location') || '',
            phone: formData.get('phone') || '',
            email: formData.get('email') || '',
            linkedin: formData.get('linkedin') || ''
        };

        // Update soft skills
        this.data.softSkills = [];
        let softCatIndex = 0;
        while (formData.has(`soft-category-${softCatIndex}`)) {
            const category = formData.get(`soft-category-${softCatIndex}`);
            const items = [];
            let itemIndex = 0;
            while (formData.has(`soft-item-${softCatIndex}-${itemIndex}`)) {
                const item = formData.get(`soft-item-${softCatIndex}-${itemIndex}`);
                if (item) items.push(item);
                itemIndex++;
            }
            if (category || items.length > 0) {
                this.data.softSkills.push({ category: category || '', items });
            }
            softCatIndex++;
        }

        // Update technical skills
        this.data.technicalSkills = [];
        let techIndex = 0;
        while (formData.has(`tech-category-${techIndex}`)) {
            const category = formData.get(`tech-category-${techIndex}`);
            const items = [];
            let itemIndex = 0;
            while (formData.has(`tech-item-${techIndex}-${itemIndex}`)) {
                const item = formData.get(`tech-item-${techIndex}-${itemIndex}`);
                if (item) items.push(item);
                itemIndex++;
            }
            if (category || items.length > 0) {
                this.data.technicalSkills.push({ category: category || '', items });
            }
            techIndex++;
        }

        // Update experience
        this.data.experience = [];
        let expIndex = 0;
        while (formData.has(`exp-position-${expIndex}`)) {
            const responsibilities = [];
            let respIndex = 0;
            while (formData.has(`exp-resp-${expIndex}-${respIndex}`)) {
                const resp = formData.get(`exp-resp-${expIndex}-${respIndex}`);
                if (resp) responsibilities.push(resp);
                respIndex++;
            }

            this.data.experience.push({
                position: formData.get(`exp-position-${expIndex}`) || '',
                company: formData.get(`exp-company-${expIndex}`) || '',
                period: formData.get(`exp-period-${expIndex}`) || '',
                location: formData.get(`exp-location-${expIndex}`) || '',
                responsibilities: responsibilities
            });
            expIndex++;
        }

        // Update education
        this.data.education = [];
        let eduIndex = 0;
        while (formData.has(`edu-degree-${eduIndex}`)) {
            this.data.education.push({
                degree: formData.get(`edu-degree-${eduIndex}`) || '',
                institution: formData.get(`edu-institution-${eduIndex}`) || '',
                period: formData.get(`edu-period-${eduIndex}`) || '',
                location: formData.get(`edu-location-${eduIndex}`) || '',
                note: formData.get(`edu-note-${eduIndex}`) || ''
            });
            eduIndex++;
        }

        // Update certifications
        this.data.certifications = [];
        let certIndex = 0;
        while (formData.has(`cert-name-${certIndex}`)) {
            this.data.certifications.push({
                name: formData.get(`cert-name-${certIndex}`) || '',
                issuer: formData.get(`cert-issuer-${certIndex}`) || ''
            });
            certIndex++;
        }

        this.saveToStorage();
    },

    // Render the form with current data
    renderForm() {
        const form = document.getElementById('cv-form');

        // Populate personal info
        Object.keys(this.data.personalInfo).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = this.data.personalInfo[key];
        });

        // Populate skills
        this.renderSoftSkillsList();
        this.renderTechnicalSkillsList();

        // Render experience entries
        this.renderExperienceList();

        // Render education entries
        this.renderEducationList();

        // Render certifications
        this.renderCertificationsList();
    },

    // Render experience list
    renderExperienceList() {
        const container = document.getElementById('experience-list');
        container.innerHTML = '';

        this.data.experience.forEach((exp, index) => {
            const expHTML = `
                <div class="list-item fade-in">
                    <div class="list-item-header">
                        <span class="list-item-title">Experiencia Laboral #${index + 1}</span>
                        <button type="button" class="btn btn-remove" onclick="app.removeExperience(${index})">Eliminar</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Posición</label>
                        <input type="text" class="form-input" name="exp-position-${index}" value="${exp.position || ''}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Empresa</label>
                            <input type="text" class="form-input" name="exp-company-${index}" value="${exp.company || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Periodo</label>
                            <input type="text" class="form-input" name="exp-period-${index}" value="${exp.period || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ubicación</label>
                        <input type="text" class="form-input" name="exp-location-${index}" value="${exp.location || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Responsabilidades (una por línea)</label>
                        ${exp.responsibilities.map((resp, rIndex) => `
                            <input type="text" class="form-input mb-1" name="exp-resp-${index}-${rIndex}" value="${resp}" placeholder="Responsabilidad ${rIndex + 1}">
                        `).join('')}
                        <button type="button" class="btn btn-add" onclick="app.addResponsibility(${index})">+ Agregar Responsabilidad</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', expHTML);
        });
    },

    // Render education list
    renderEducationList() {
        const container = document.getElementById('education-list');
        container.innerHTML = '';

        this.data.education.forEach((edu, index) => {
            const eduHTML = `
                <div class="list-item fade-in">
                    <div class="list-item-header">
                        <span class="list-item-title">Educación #${index + 1}</span>
                        <button type="button" class="btn btn-remove" onclick="app.removeEducation(${index})">Eliminar</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Grado</label>
                        <input type="text" class="form-input" name="edu-degree-${index}" value="${edu.degree || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Institución</label>
                        <input type="text" class="form-input" name="edu-institution-${index}" value="${edu.institution || ''}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Periodo</label>
                            <input type="text" class="form-input" name="edu-period-${index}" value="${edu.period || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ubicación</label>
                            <input type="text" class="form-input" name="edu-location-${index}" value="${edu.location || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notas (opcional)</label>
                        <input type="text" class="form-input" name="edu-note-${index}" value="${edu.note || ''}" placeholder="Información adicional">
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', eduHTML);
        });
    },

    // Render certifications list
    renderCertificationsList() {
        const container = document.getElementById('certifications-list');
        container.innerHTML = '';

        this.data.certifications.forEach((cert, index) => {
            const certHTML = `
                <div class="list-item fade-in">
                    <div class="list-item-header">
                        <span class="list-item-title">Certificación #${index + 1}</span>
                        <button type="button" class="btn btn-remove" onclick="app.removeCertification(${index})">Eliminar</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nombre de la certificación</label>
                        <input type="text" class="form-input" name="cert-name-${index}" value="${cert.name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Organización que otorga la certificación</label>
                        <input type="text" class="form-input" name="cert-issuer-${index}" value="${cert.issuer || ''}">
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', certHTML);
        });
    },

    // Add/Remove methods
    addExperience() {
        this.data.experience.push({
            position: '',
            company: '',
            period: '',
            location: '',
            responsibilities: ['']
        });
        this.renderExperienceList();
        this.saveToStorage();
    },

    removeExperience(index) {
        this.data.experience.splice(index, 1);
        this.renderForm();
        this.renderPreview();
    },

    addResponsibility(expIndex) {
        this.updateData(); // Save current state first
        this.data.experience[expIndex].responsibilities.push('');
        this.renderExperienceList();
    },

    addEducation() {
        this.data.education.push({
            degree: '',
            institution: '',
            period: '',
            location: '',
            note: ''
        });
        this.renderEducationList();
        this.saveToStorage();
    },

    removeEducation(index) {
        this.data.education.splice(index, 1);
        this.renderForm();
        this.renderPreview();
    },

    addCertification() {
        this.data.certifications.push({
            name: '',
            issuer: ''
        });
        this.renderCertificationsList();
        this.saveToStorage();
    },

    removeCertification(index) {
        this.data.certifications.splice(index, 1);
        this.renderForm();
        this.renderPreview();
    },

    // Render soft skills list
    renderSoftSkillsList() {
        const container = document.getElementById('soft-skills-list');
        if (!container) return;
        container.innerHTML = '';

        this.data.softSkills.forEach((category, catIndex) => {
            const categoryHTML = `
                <div class="list-item fade-in">
                    <div class="list-item-header">
                        <span class="list-item-title">Categoría #${catIndex + 1}</span>
                        <button type="button" class="btn btn-remove" onclick="app.removeSoftCategory(${catIndex})">Eliminar</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nombre de Categoría</label>
                        <input type="text" class="form-input" name="soft-category-${catIndex}" value="${category.category || ''}" placeholder="ej., Personal, Comunicación">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Habilidades en esta categoría</label>
                        ${category.items.map((item, itemIndex) => `
                            <div class="skill-item">
                                <input type="text" class="form-input mb-1" name="soft-item-${catIndex}-${itemIndex}" value="${item}" placeholder="Habilidad ${itemIndex + 1}">
                                <button type="button" class="btn-skill-remove" onclick="app.removeSoftItem(${catIndex}, ${itemIndex})" title="Eliminar habilidad">×</button>
                            </div>
                        `).join('')}
                        <button type="button" class="btn btn-add" onclick="app.addSoftItem(${catIndex})">+ Agregar Habilidad</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', categoryHTML);
        });
    },

    // Render technical skills list
    renderTechnicalSkillsList() {
        const container = document.getElementById('technical-skills-list');
        if (!container) return;
        container.innerHTML = '';

        this.data.technicalSkills.forEach((category, catIndex) => {
            const categoryHTML = `
                <div class="list-item fade-in">
                    <div class="list-item-header">
                        <span class="list-item-title">Categoría #${catIndex + 1}</span>
                        <button type="button" class="btn btn-remove" onclick="app.removeTechnicalCategory(${catIndex})">Eliminar</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nombre de la categoría</label>
                        <input type="text" class="form-input" name="tech-category-${catIndex}" value="${category.category || ''}" placeholder="e.g., Programming, Languages, Tools">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Habilidades en esta categoría</label>
                        ${category.items.map((item, itemIndex) => `
                            <div class="skill-item">
                                <input type="text" class="form-input mb-1" name="tech-item-${catIndex}-${itemIndex}" value="${item}" placeholder="Habilidad ${itemIndex + 1}">
                                <button type="button" class="btn-skill-remove" onclick="app.removeTechnicalItem(${catIndex}, ${itemIndex})" title="Eliminar habilidad">×</button>
                            </div>
                        `).join('')}
                        <button type="button" class="btn btn-add" onclick="app.addTechnicalItem(${catIndex})">+ Agregar Habilidad</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', categoryHTML);
        });
    },

    // Skills management methods
    addSoftCategory() {
        this.data.softSkills.push({
            category: '',
            items: ['']
        });
        this.renderSoftSkillsList();
        this.saveToStorage();
    },

    removeSoftCategory(index) {
        this.data.softSkills.splice(index, 1);
        this.renderSoftSkillsList();
        this.updateData();
        this.renderPreview();
    },

    addSoftItem(categoryIndex) {
        this.updateData(); // Save current state first
        this.data.softSkills[categoryIndex].items.push('');
        this.renderSoftSkillsList();
    },

    removeSoftItem(categoryIndex, itemIndex) {
        this.updateData(); // Save current state first
        this.data.softSkills[categoryIndex].items.splice(itemIndex, 1);
        this.renderSoftSkillsList();
        this.renderPreview();
    },

    addTechnicalCategory() {
        this.data.technicalSkills.push({
            category: '',
            items: ['']
        });
        this.renderTechnicalSkillsList();
        this.saveToStorage();
    },

    removeTechnicalCategory(index) {
        this.data.technicalSkills.splice(index, 1);
        this.renderTechnicalSkillsList();
        this.updateData();
        this.renderPreview();
    },

    addTechnicalItem(categoryIndex) {
        this.updateData(); // Save current state first
        this.data.technicalSkills[categoryIndex].items.push('');
        this.renderTechnicalSkillsList();
    },

    removeTechnicalItem(categoryIndex, itemIndex) {
        this.updateData(); // Save current state first
        this.data.technicalSkills[categoryIndex].items.splice(itemIndex, 1);
        this.renderTechnicalSkillsList();
        this.renderPreview();
    },

    // Render CV Preview
    renderPreview() {
        const preview = document.getElementById('cv-preview');
        const p = this.data.personalInfo;

        const linkedinURL = p.linkedin.startsWith('http')
            ? p.linkedin
            : `https://www.linkedin.com/in/${p.linkedin}`;

        preview.innerHTML = `
            <header>
                <div class="personal__info">
                    <h1>${p.firstName} <span>${p.lastName}</span></h1>
                    ${p.title ? `<h2>${p.title} ${p.subtitle ? `<span>| ${p.subtitle}</span>` : ''}</h2>` : ''}
                    ${p.location ? `<p><img class='icon' src="./img/location.svg" onerror="this.style.display='none'"/> ${p.location}</p>` : ''}
                    ${p.phone ? `<p><img class='icon' src="./img/phone.svg" onerror="this.style.display='none'"/> ${p.phone}</p>` : ''}
                    ${p.email ? `<p><img class='icon' src="./img/mail.svg" onerror="this.style.display='none'"/><a href="mailto:${p.email}"> ${p.email}</a></p>` : ''}
                    ${p.linkedin ? `<p><img class='icon' src="./img/linkedin.svg" onerror="this.style.display='none'"/><a href="${linkedinURL}" target="_blank"> ${p.linkedin}</a></p>` : ''}
                </div>
            </header>

            <main>
                <div class="column left__col">
                    ${this.data.experience.length > 0 ? `
                    <section>
                        <h2>${this.translations[this.cvLanguage].experience}</h2>
                        ${this.data.experience.map(exp => `
                            <div class="subsection">
                                <h3 style="display: inline-block;">${exp.position}</h3>
                                <h4>${exp.company}</h4>
                                <h5>${exp.period}${exp.location ? ` | ${exp.location}` : ''}</h5>
                                ${exp.responsibilities.map(resp => resp ? `<p class="list__item">${resp}</p>` : '').join('')}
                            </div>
                        `).join('')}
                    </section>
                    ` : ''}

                    ${this.data.education.length > 0 ? `
                    <section>
                        <h2>${this.translations[this.cvLanguage].education}</h2>
                        ${this.data.education.map(edu => `
                            <div class="subsection">
                                <h3>${edu.degree}</h3>
                                <h4>${edu.institution}</h4>
                                <p>${edu.period}${edu.location ? ` | ${edu.location}` : ''}</p>
                                ${edu.note ? `<p class="note">(${edu.note})</p>` : ''}
                            </div>
                        `).join('')}
                    </section>
                    ` : ''}
                </div>

                <div class="column right__col">
                    ${this.data.softSkills.length > 0 ? `
                    <section>
                        <h2>${this.translations[this.cvLanguage].softSkills}</h2>
                        ${this.data.softSkills.map(category => `
                            <div class="subsection">
                                ${category.category ? `<h3>${category.category.toUpperCase()}</h3>` : ''}
                                ${category.items.map(item =>
            item.trim() ? `<p class="list__item">${item.trim()}</p>` : ''
        ).join('')}
                            </div>
                        `).join('')}
                    </section>
                    ` : ''}

                    ${this.data.technicalSkills.length > 0 ? `
                    <section>
                        <h2>${this.translations[this.cvLanguage].hardSkills}</h2>
                        ${this.data.technicalSkills.map(category => `
                            <div class="subsection">
                                ${category.category ? `<h3>${category.category.toUpperCase()}</h3>` : ''}
                                ${category.items.map(item =>
            item.trim() ? `<p class="list__item">${item.trim()}</p>` : ''
        ).join('')}
                            </div>
                        `).join('')}
                    </section>
                    ` : ''}

                    ${this.data.certifications.length > 0 ? `
                    <section>
                        <h2>${this.translations[this.cvLanguage].certifications}</h2>
                        ${this.data.certifications.map(cert => `
                            <div class="subsection">
                                <p class="list__item">${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}</p>
                            </div>
                        `).join('')}
                    </section>
                    ` : ''}
                </div>
            </main>
        `;
    },

    // Set paper size
    setPaperSize(size) {
        this.paperSize = size;
        this.updatePreviewSize();
        this.showToast(`Tamaño: ${size.toUpperCase()}`, 'success');
    },

    // Update preview size based on paper format
    updatePreviewSize() {
        const preview = document.getElementById('cv-preview');
        if (this.paperSize === 'a4') {
            // A4: 210mm x 297mm = 794px x 1123px at 96 DPI
            preview.style.width = '794px';
            preview.style.minHeight = '1123px';
        } else {
            // Letter: 8.5in x 11in = 816px x 1056px at 96 DPI
            preview.style.width = '816px';
            preview.style.minHeight = '1056px';
        }
    },

    // Set CV language
    setCVLanguage(lang) {
        this.cvLanguage = lang;
        this.renderPreview();
        const langName = lang === 'es' ? 'Español' : 'English';
        this.showToast(`Idioma del CV: ${langName}`, 'success');
    },

    // Export to PDF using selected paper size
    async exportPDF() {
        const format = this.paperSize;
        this.showToast('Generando PDF...', 'success');

        const element = document.getElementById('cv-preview');
        const firstName = this.data.personalInfo.firstName || 'CV';
        const lastName = this.data.personalInfo.lastName || '';
        const filename = `${firstName}_${lastName}_CV.pdf`.replace(/\s+/g, '_');

        // Hide icons temporarily to prevent tainted canvas error
        const icons = element.querySelectorAll('.icon');
        icons.forEach(icon => {
            icon.style.display = 'none';
        });

        // Configure options based on format
        const options = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                allowTaint: false,
                logging: false
            },
            jsPDF: {
                unit: 'in',
                format: format === 'a4' ? 'a4' : 'letter',
                orientation: 'portrait'
            }
        };

        try {
            await html2pdf().set(options).from(element).save();
            this.showToast(`PDF exportado (${format.toUpperCase()})!`, 'success');
        } catch (error) {
            this.showToast('Error generando PDF. Intenta nuevamente.', 'error');
            console.error('Error exportando PDF:', error);
        } finally {
            // Restore icons
            icons.forEach(icon => {
                icon.style.display = '';
            });
        }
    },

    // Export to JSON
    exportJSON() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cv_data_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully!', 'success');
    },

    // Import from JSON
    importJSON() {
        document.getElementById('json-import-input').click();
    },

    // Local storage methods
    saveToStorage() {
        try {
            localStorage.setItem('cvData', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('cvData');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    },

    // Toast notifications
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

