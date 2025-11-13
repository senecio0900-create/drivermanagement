// Messages Page - Tab Switching and Messaging Functionality
(function() {
    'use strict';

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initMessageTabs();
        initConversationItems();
        initSendMessage();
        initChatMenu();
        initMobileSidebar();
    });

    // Tab Switching
    function initMessageTabs() {
        const tabs = document.querySelectorAll('.message-tab');
        const pinnedSection = document.getElementById('pinnedSection');
        const allMessagesSection = document.getElementById('allMessagesSection');
        const inboxSection = document.getElementById('inboxSection');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');

                // Get the tab type
                const tabType = this.getAttribute('data-tab');

                // Show/hide sections based on tab
                if (tabType === 'all') {
                    // Show Pinned and All Messages sections
                    pinnedSection.style.display = 'block';
                    allMessagesSection.style.display = 'block';
                    inboxSection.style.display = 'none';
                } else if (tabType === 'inbox') {
                    // Show only Inbox section
                    pinnedSection.style.display = 'none';
                    allMessagesSection.style.display = 'none';
                    inboxSection.style.display = 'block';
                }
            });
        });
    }

    // Conversation Item Click
    function initConversationItems() {
        const conversationItems = document.querySelectorAll('.conversation-item');

        conversationItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all items
                conversationItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');

                // Get user info
                const userName = this.getAttribute('data-user');
                const userTime = this.getAttribute('data-time');

                // Update chat header (optional - could load different conversation)
                updateChatHeader(userName);

                // Scroll to bottom of messages
                scrollToBottom();
            });
        });
    }

    // Update Chat Header
    function updateChatHeader(userName) {
        const chatUserName = document.querySelector('.chat-user-details h3');
        if (chatUserName) {
            chatUserName.textContent = userName;
        }

        // Get initials for avatar
        const initials = userName.split(' ').map(n => n[0]).join('');
        const chatAvatar = document.querySelector('.chat-avatar');
        if (chatAvatar) {
            chatAvatar.textContent = initials;
        }
    }

    // Send Message
    function initSendMessage() {
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');

        if (sendButton && messageInput) {
            sendButton.addEventListener('click', sendMessage);
            
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    }

    function sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const chatMessages = document.getElementById('chatMessages');

        if (!messageInput || !chatMessages) return;

        const messageText = messageInput.value.trim();
        
        if (messageText === '') return;

        // Create message element
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper sent';

        const currentTime = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });

        messageWrapper.innerHTML = `
            <div class="message-bubble">
                <p>${escapeHtml(messageText)}</p>
                <span class="message-time">${currentTime} <i class="fa-solid fa-check-double"></i></span>
            </div>
        `;

        // Append to chat
        chatMessages.appendChild(messageWrapper);

        // Clear input
        messageInput.value = '';

        // Scroll to bottom
        scrollToBottom();
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Scroll to Bottom
    function scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }

    // Chat Menu Button
    function initChatMenu() {
        const chatMenuBtn = document.getElementById('chatMenuBtn');
        const chatMenuDropdown = document.getElementById('chatMenuDropdown');
        const pinBtn = document.getElementById('pinConversationBtn');
        const deleteBtn = document.getElementById('deleteConversationBtn');
        
        if (chatMenuBtn && chatMenuDropdown) {
            // Toggle dropdown
            chatMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                chatMenuDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!chatMenuDropdown.contains(e.target) && e.target !== chatMenuBtn) {
                    chatMenuDropdown.classList.remove('show');
                }
            });

            // Pin Conversation
            if (pinBtn) {
                pinBtn.addEventListener('click', function() {
                    const chatUserName = document.querySelector('.chat-user-details h3');
                    if (chatUserName) {
                        const isPinned = this.textContent.includes('Unpin');
                        if (isPinned) {
                            this.innerHTML = '<i class="fa-solid fa-thumbtack"></i><span>Pin Conversation</span>';
                            alert('Conversation unpinned');
                        } else {
                            this.innerHTML = '<i class="fa-solid fa-thumbtack"></i><span>Unpin Conversation</span>';
                            alert('Conversation pinned to top');
                        }
                    }
                    chatMenuDropdown.classList.remove('show');
                });
            }

            // Delete Conversation
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    const chatUserName = document.querySelector('.chat-user-details h3');
                    if (chatUserName) {
                        const confirmDelete = confirm(`Are you sure you want to delete the conversation with ${chatUserName.textContent}?\n\nThis action cannot be undone.`);
                        if (confirmDelete) {
                            alert('Conversation deleted');
                            // Here you would typically call an API to delete the conversation
                        }
                    }
                    chatMenuDropdown.classList.remove('show');
                });
            }
        }
    }

    // Search Functionality
    const searchInput = document.getElementById('messageSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const conversationItems = document.querySelectorAll('.conversation-item');

            conversationItems.forEach(item => {
                const userName = item.getAttribute('data-user').toLowerCase();
                const preview = item.querySelector('.conversation-preview').textContent.toLowerCase();

                if (userName.includes(searchTerm) || preview.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Mobile Sidebar Toggle
    function initMobileSidebar() {
        const mobileContactsBtn = document.getElementById('mobileContactsBtn');
        const mobileCloseBtn = document.getElementById('mobileCloseSidebarBtn');
        const messagesSidebar = document.querySelector('.messages-sidebar');

        // Open sidebar when contact button is clicked
        if (mobileContactsBtn) {
            mobileContactsBtn.addEventListener('click', function() {
                if (messagesSidebar) {
                    messagesSidebar.classList.add('mobile-show');
                }
            });
        }

        // Close sidebar when close button is clicked
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', function() {
                if (messagesSidebar) {
                    messagesSidebar.classList.remove('mobile-show');
                }
            });
        }

        // Close sidebar when a conversation is selected (mobile only)
        const conversationItems = document.querySelectorAll('.conversation-item');
        conversationItems.forEach(item => {
            item.addEventListener('click', function() {
                // Check if we're on mobile (window width <= 768px)
                if (window.innerWidth <= 768 && messagesSidebar) {
                    messagesSidebar.classList.remove('mobile-show');
                }
            });
        });
    }

})();
