// Wallet Page - Period Filtering and Transaction Management
(function() {
    'use strict';

    // Sample transaction data for different periods
    const transactionData = {
        '7days': {
            balance: '₱2,450.00',
            dailyAverage: '₱1042.86',
            totalTransactions: '10',
            highestEarning: '₱1200.00',
            subtitle: 'Last 7 days of transactions',
            transactions: [
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱450.00'
                },
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱400.00'
                },
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱250.00'
                }
            ]
        },
        '30days': {
            balance: '₱8,450.00',
            dailyAverage: '₱1342.86',
            totalTransactions: '45',
            highestEarning: '₱1700.00',
            subtitle: 'Last 30 days of transactions',
            transactions: [
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱450.00'
                },
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱400.00'
                },
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱250.00'
                }
            ]
        },
        'alltime': {
            balance: '₱45,890.00',
            dailyAverage: '₱2156.50',
            totalTransactions: '187',
            highestEarning: '₱2500.00',
            subtitle: 'All time transactions',
            transactions: [
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱450.00'
                },
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱400.00'
                },
                {
                    title: 'Trip Earnings',
                    route: 'Quezon City to Makati',
                    date: '2025-11-01',
                    time: '14:30',
                    amount: '+ ₱250.00'
                }
            ]
        }
    };

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initPeriodTabs();
    });

    // Period Tab Switching
    function initPeriodTabs() {
        const tabs = document.querySelectorAll('.period-tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');

                // Get the period type
                const period = this.getAttribute('data-period');

                // Update the wallet data
                updateWalletData(period);
            });
        });
    }

    // Update Wallet Data
    function updateWalletData(period) {
        const data = transactionData[period];

        if (!data) return;

        // Update balance and stats with animation
        animateValue('totalBalance', data.balance);
        animateValue('dailyAverage', data.dailyAverage);
        animateValue('totalTransactions', data.totalTransactions);
        animateValue('highestEarning', data.highestEarning);

        // Update subtitle
        const subtitle = document.getElementById('historySubtitle');
        if (subtitle) {
            subtitle.textContent = data.subtitle;
        }

        // Update transactions list
        updateTransactionsList(data.transactions);
    }

    // Animate value changes
    function animateValue(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Add fade effect
        element.style.opacity = '0.5';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.opacity = '1';
        }, 150);
    }

    // Update Transactions List
    function updateTransactionsList(transactions) {
        const transactionsList = document.getElementById('transactionsList');
        
        if (!transactionsList) return;

        // Fade out
        transactionsList.style.opacity = '0.5';

        setTimeout(() => {
            // Clear existing transactions
            transactionsList.innerHTML = '';

            // Add new transactions
            transactions.forEach(transaction => {
                const transactionItem = createTransactionItem(transaction);
                transactionsList.appendChild(transactionItem);
            });

            // Fade in
            transactionsList.style.opacity = '1';
        }, 150);
    }

    // Create Transaction Item Element
    function createTransactionItem(transaction) {
        const item = document.createElement('div');
        item.className = 'transaction-item';

        item.innerHTML = `
            <div class="transaction-icon">
                <i class="fa-solid fa-car"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.title}</div>
                <div class="transaction-route">${transaction.route}</div>
                <div class="transaction-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${transaction.date}</span>
                    <span><i class="fa-regular fa-clock"></i> ${transaction.time}</span>
                </div>
            </div>
            <div class="transaction-amount positive">${transaction.amount}</div>
        `;

        return item;
    }

})();
