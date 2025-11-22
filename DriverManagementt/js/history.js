// Compliance History Page - Tab Switching and Filtering
(function() {
    'use strict';

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initHistoryTabs();
        initTransactionHistory();
    });

    // History Tab Switching
    function initHistoryTabs() {
        const tabs = document.querySelectorAll('.history-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');

                // Get the tab type
                const tabType = this.getAttribute('data-tab');

                // Hide all tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });

                // Show the selected tab content
                const targetContent = document.getElementById(tabType);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });     
        });
    }

    // Transaction History - No specific filtering needed for now
    // Can be extended in the future for date range filtering, payment method filtering, etc.
    function initTransactionHistory() {
        // Placeholder for future transaction history features
        console.log('Transaction History tab initialized');
    }

    // Action Button Click Handler (for Reports/Complaints)
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const complaintId = row.cells[0].textContent;
            const passenger = row.cells[1].textContent;
            const complaintType = row.cells[2].textContent;
            const description = row.cells[3].textContent;
            const date = row.cells[4].textContent;
            
            // Show the report details modal
            showReportDetailsModal(complaintId, passenger, complaintType, description, date);
        });
    });

    // Report Details Modal Functions
    function showReportDetailsModal(complaintId, passenger, complaintType, description, date) {
        const modal = document.getElementById('reportDetailsModal');
        
        if (!modal) return;

        // Populate modal with data
        document.getElementById('modalComplaintId').textContent = complaintId;
        document.getElementById('modalPassenger').textContent = passenger;
        document.getElementById('modalComplaintType').textContent = complaintType;
        document.getElementById('modalDescription').textContent = getFullDescription(description);
        document.getElementById('modalComplaintDate').textContent = `Date: ${date} 14:30`;
        
        // Set route based on passenger (sample data)
        document.getElementById('modalRoute').textContent = 'Metro Manila to Quezon City';

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideReportDetailsModal() {
        const modal = document.getElementById('reportDetailsModal');
        
        if (!modal) return;

        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function getFullDescription(shortDesc) {
        // Convert truncated description to full description
        if (shortDesc.includes('Bus arrived 20mins late')) {
            return 'Bus arrived 20 minutes late. This caused me to miss an important meeting. The driver did not provide any updates or apology.';
        }
        return shortDesc;
    }

    // Close modal button
    const closeModalBtn = document.getElementById('closeReportModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideReportDetailsModal);
    }

    // Close modal when clicking overlay
    const modalOverlay = document.querySelector('.report-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', hideReportDetailsModal);
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('reportDetailsModal');
            if (modal && modal.classList.contains('show')) {
                hideReportDetailsModal();
            }
        }
    });

})();
