// library.js
const Library = {
    allItems: [],
    filteredItems: [],
    currentPage: 0,
    itemsPerPage: 6, // 3 per page (left/right)
    currentFilter: 'all',
    
    init: async function() {
        try {
            const response = await fetch('/api/library');
            const data = await response.json();
            if (data.success) {
                // Add a "category" field for easier rendering
                const spells = (data.spells || []).map(s => ({ ...s, category: 'spell' }));
                const potions = (data.potions || []).map(p => ({ ...p, category: 'potion' }));
                
                // Sort alphabetically by name
                this.allItems = [...spells, ...potions].sort((a, b) => a.name.localeCompare(b.name));
                this.filteredItems = [...this.allItems];
                
                this.renderPages();
            }
        } catch (e) {
            console.error('Failed to load library:', e);
        }
    },
    
    setFilter: function(filterType) {
        this.currentFilter = filterType;
        
        // Update tab visuals
        document.querySelectorAll('.lib-tab').forEach(tab => tab.classList.remove('active'));
        // Find tab that was clicked based on filterType
        const tabs = document.querySelectorAll('.lib-tab');
        if (filterType === 'all') tabs[0].classList.add('active');
        if (filterType === 'spells') tabs[1].classList.add('active');
        if (filterType === 'potions') tabs[2].classList.add('active');
        if (filterType === 'dark') tabs[3].classList.add('active');
        
        this.applyFilters();
    },
    
    filter: function() {
        this.applyFilters();
    },
    
    applyFilters: function() {
        const query = (document.getElementById('library-search').value || '').toLowerCase();
        
        this.filteredItems = this.allItems.filter(item => {
            // Check type filter
            if (this.currentFilter === 'spells' && item.category !== 'spell') return false;
            if (this.currentFilter === 'potions' && item.category !== 'potion') return false;
            if (this.currentFilter === 'dark' && !item.isDarkMagic) return false;
            
            // Check search query
            if (!query) return true;
            
            return (
                item.name.toLowerCase().includes(query) ||
                (item.incantation && item.incantation.toLowerCase().includes(query)) ||
                (item.effect && item.effect.toLowerCase().includes(query))
            );
        });
        
        this.currentPage = 0; // Reset to page 1
        this.renderPages();
    },
    
    renderPages: function() {
        const leftContainer = document.getElementById('library-page-left');
        const rightContainer = document.getElementById('library-page-right');
        
        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';
        
        const startIndex = this.currentPage * this.itemsPerPage;
        const pageItems = this.filteredItems.slice(startIndex, startIndex + this.itemsPerPage);
        
        // Split into left and right
        const leftItems = pageItems.slice(0, 3);
        const rightItems = pageItems.slice(3, 6);
        
        if (pageItems.length === 0) {
            leftContainer.innerHTML = '<p style="text-align:center; margin-top:2rem;">No magical knowledge found matching your criteria...</p>';
        }
        
        leftItems.forEach(item => {
            leftContainer.appendChild(this.createEntryElement(item));
        });
        
        rightItems.forEach(item => {
            rightContainer.appendChild(this.createEntryElement(item));
        });
        
        // Update page numbers
        document.getElementById('page-num-left').textContent = (this.currentPage * 2) + 1;
        document.getElementById('page-num-right').textContent = (this.currentPage * 2) + 2;
        
        // Update buttons
        document.getElementById('lib-prev-btn').disabled = this.currentPage === 0;
        document.getElementById('lib-next-btn').disabled = (startIndex + this.itemsPerPage) >= this.filteredItems.length;
        
        if (this.currentPage === 0) {
            document.getElementById('lib-prev-btn').style.opacity = '0.5';
        } else {
            document.getElementById('lib-prev-btn').style.opacity = '1';
        }
        
        if ((startIndex + this.itemsPerPage) >= this.filteredItems.length) {
            document.getElementById('lib-next-btn').style.opacity = '0.5';
        } else {
            document.getElementById('lib-next-btn').style.opacity = '1';
        }
    },
    
    createEntryElement: function(item) {
        const div = document.createElement('div');
        div.className = 'lib-entry ' + (item.isDarkMagic ? 'dark-magic' : '');
        
        let metaHtml = '';
        if (item.category === 'spell') {
            metaHtml = `<div class="lib-meta">${item.type} | <span class="lib-incantation">"${item.incantation}"</span></div>`;
        } else if (item.category === 'potion') {
            metaHtml = `<div class="lib-meta">${item.type}</div>`;
        }
        
        let extraHtml = '';
        if (item.ingredients && item.ingredients.length > 0) {
            extraHtml = `<div style="font-size: 0.85rem; margin-top: 0.5rem; color: #6d4c41;"><strong>Ingredients:</strong> ${item.ingredients.join(', ')}</div>`;
        }
        
        div.innerHTML = `
            <div class="lib-title">${item.name}</div>
            ${metaHtml}
            <div class="lib-effect">${item.effect}</div>
            ${extraHtml}
        `;
        
        return div;
    },
    
    nextPage: function() {
        if ((this.currentPage + 1) * this.itemsPerPage < this.filteredItems.length) {
            this.currentPage++;
            this.renderPages();
            if (typeof clickAudio !== 'undefined' && clickAudio) clickAudio.play().catch(e=>{});
        }
    },
    
    prevPage: function() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.renderPages();
            if (typeof clickAudio !== 'undefined' && clickAudio) clickAudio.play().catch(e=>{});
        }
    }
};

// Listen for view changes to load data when user opens library
document.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'view-library') {
        if (Library.allItems.length === 0) {
            Library.init();
        }
    }
});
