/**
 * JourneoLink Driver Dashboard - Layout & UI Interactions
 * Handles sidebar toggle, modal logic, and active page detection
 */

(function() {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    // Modal elements
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');
    const modalOverlay = logoutModal ? logoutModal.querySelector('.modal-overlay') : null;
    
    // Create sidebar overlay for mobile
    let sidebarOverlay = document.getElementById('sidebarOverlay');
    if (!sidebarOverlay) {
        sidebarOverlay = document.createElement('div');
        sidebarOverlay.id = 'sidebarOverlay';
        sidebarOverlay.className = 'sidebar-overlay';
        document.body.appendChild(sidebarOverlay);
    }

    // ========================================
    // Sidebar Toggle Logic
    // ========================================
    function toggleSidebar() {
        if (!sidebar || !mainContent) return;
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // Handle mobile overlay
        if (window.innerWidth <= 768 && sidebarOverlay) {
            sidebarOverlay.classList.toggle('active');
        }
    }

    // Desktop sidebar toggle (MENU header)
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
        menuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSidebar();
            }
        });
    }

    // Mobile hamburger menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking overlay on mobile
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('collapsed')) {
                toggleSidebar();
            }
        });
    }

    // Restore sidebar state from localStorage
    function restoreSidebarState() {
        // On desktop, sidebar is always visible by default (CSS handles this)
        // On mobile, always start with sidebar off-screen
        if (window.innerWidth > 768) {
            // Desktop: Don't use collapsed class - let CSS show sidebar naturally
            if (sidebar) sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('expanded');
        } else {
            // Mobile: ensure sidebar starts off-screen and overlay is hidden
            if (sidebar) sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('expanded');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        }
    }

    // ========================================
    // Active Page Detection
    // ========================================
    function setActivePage() {
        const currentPage = document.body.getAttribute('data-page');
        if (!currentPage) return;

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');
            if (itemPage === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ========================================
    // Logout Modal Logic
    // ========================================
    function showModal() {
        if (logoutModal) {
            logoutModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
    }

    function hideModal() {
        if (logoutModal) {
            logoutModal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scroll
        }
    }

    // Show modal when logout button clicked
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
        });
    }

    // Hide modal when cancel clicked
    if (cancelLogout) {
        cancelLogout.addEventListener('click', hideModal);
    }

    // Hide modal when clicking overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', hideModal);
    }

    // Confirm logout action
    if (confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            console.log('Logging out...');
            
            // Clear any stored user data
            localStorage.removeItem('userToken');
            localStorage.removeItem('userName');
            sessionStorage.clear();
            
            // Redirect to landing page
            window.location.href = 'index.html';
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && logoutModal && logoutModal.classList.contains('show')) {
            hideModal();
        }
    });

    // ========================================
    // Window Resize Handler
    // ========================================
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // On resize to desktop, show sidebar and hide overlay
            // On resize to mobile, hide sidebar and overlay
            if (window.innerWidth > 768) {
                // Desktop: Hide overlay and ensure sidebar is visible
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
                
                // Remove mobile state classes to show sidebar
                if (sidebar && sidebar.classList.contains('collapsed')) {
                    sidebar.classList.remove('collapsed');
                }
                if (mainContent && mainContent.classList.contains('expanded')) {
                    mainContent.classList.remove('expanded');
                }
            } else {
                // Mobile: ensure sidebar is off-screen and overlay is hidden
                if (sidebar && sidebar.classList.contains('collapsed')) {
                    sidebar.classList.remove('collapsed');
                }
                if (mainContent && mainContent.classList.contains('expanded')) {
                    mainContent.classList.remove('expanded');
                }
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            }
        }, 150);
    });

    // ========================================
    // Schedule Page Tab Switching
    // ========================================
    function initScheduleTabs() {
        const scheduleTabs = document.querySelectorAll('.schedule-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        if (scheduleTabs.length === 0) return; // Not on schedule page
        
        scheduleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                scheduleTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding content
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // ========================================
    // Initialization
    // ========================================
    function init() {
        restoreSidebarState();
        setActivePage();
        initScheduleTabs();
        
        console.log('JourneoLink Driver Dashboard initialized');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
