/* Main App Controller */

const bankService = new BankService();

// DOM Elements
const views = {
    login: document.getElementById('login-section'),
    register: document.getElementById('register-section'),
    dashboard: document.getElementById('dashboard-section')
};

const forms = {
    login: document.getElementById('login-form'),
    register: document.getElementById('register-form')
};

const modals = {
    otp: document.getElementById('otp-modal'),
    bill: document.getElementById('bill-modal')
};

// Initial State Check
document.addEventListener('DOMContentLoaded', () => {
    const user = bankService.getCurrentUser();
    if (user) {
        showDashboard(user);
    } else {
        switchView('login');
    }

    startClock();
});

// View Switcher
function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
}

// --- Auth Handling ---

// Link Listeners
document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('register');
});

document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('login');
});

// Register
forms.register.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const fullName = document.getElementById('reg-fullname').value;
    const countryCode = document.getElementById('reg-country-code').value;
    const mobileRaw = document.getElementById('reg-mobile').value;
    const accountNum = document.getElementById('reg-account').value;
    const ifsc = document.getElementById('reg-ifsc').value.toUpperCase(); // Ensure uppercase

    // --- Validation Logic ---

    // Mobile: Must be 10 digits
    if (mobileRaw.length !== 10) {
        alert("Phone number must be exactly 10 digits!");
        return;
    }
    const fullMobile = `${countryCode} ${mobileRaw}`;

    // Account Number: Must be 12 digits
    if (accountNum.length !== 12) {
        alert("Account number must be exactly 12 digits!");
        return;
    }

    // IFSC: Must be 11 alphanumeric
    const ifscRegex = /^[A-Z0-9]{11}$/;
    if (!ifscRegex.test(ifsc)) {
        alert("IFSC code must be exactly 11 alphanumeric characters!");
        return;
    }

    // Password Strength Check
    if (password.length < 4) {
        alert("Password is too weak. Please add more characters.");
        return;
    }

    try {
        bankService.register(username, password, fullName, fullMobile, accountNum, ifsc);
        alert("Registration Successful! Please Login.");
        switchView('login');
        forms.register.reset();
        // Reset strength bar
        document.getElementById('strength-bar').style.width = '0';
        document.getElementById('strength-text').textContent = 'Strength: None';
    } catch (err) {
        alert(err.message);
    }
});

// Login Flow with OTP
let pendingLoginUser = null;

forms.login.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        // Validation first (simulated)
        const user = bankService.users.find(u => u.username === username && u.authenticate(password));
        if (!user) throw new Error("Invalid Credentials");

        pendingLoginUser = user;
        initiateOTP();
    } catch (err) {
        alert(err.message);
    }
});

// OTP Logic
let currentOTP = null;

function initiateOTP() {
    currentOTP = bankService.generateOTP();
    document.getElementById('generated-otp-display').textContent = currentOTP;
    modals.otp.classList.add('active');
}

document.getElementById('verify-otp-btn').addEventListener('click', () => {
    const input = document.getElementById('otp-input').value;
    if (input === currentOTP) {
        modals.otp.classList.remove('active');
        bankService.setCurrentUser(pendingLoginUser);
        showDashboard(pendingLoginUser);
        forms.login.reset();
        document.getElementById('otp-input').value = '';
    } else {
        alert("Incorrect OTP!");
    }
});

// Password Strength Meter
document.getElementById('reg-password').addEventListener('input', function () {
    const val = this.value;
    const bar = document.getElementById('strength-bar');
    const text = document.getElementById('strength-text');
    let strength = 0;

    if (val.length > 5) strength++;
    if (val.length > 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    let color = 'red';
    let width = '20%';
    let label = 'Weak';

    if (strength > 2) { color = 'orange'; width = '60%'; label = 'Medium'; }
    if (strength > 4) { color = 'var(--success)'; width = '100%'; label = 'Strong'; }

    bar.style.backgroundColor = color;
    bar.style.width = width;
    text.textContent = `Strength: ${label}`;
});

// --- Dashboard Logic ---

function showDashboard(user) {
    document.getElementById('user-name-display').textContent = user.username;
    updateBalanceDisplay(user);
    updateTransactionList(user);
    switchView('dashboard');
}

document.getElementById('logout-btn').addEventListener('click', () => {
    bankService.logout();
    switchView('login');
});

function updateBalanceDisplay(user) {
    document.getElementById('balance-display').textContent = user.balance.toFixed(2);
}

function updateTransactionList(user) {
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';

    if (user.transactions.length === 0) {
        list.innerHTML = '<li style="text-align:center; padding:1rem; color: #888;">No transactions yet</li>';
        return;
    }

    user.transactions.forEach(t => {
        const li = document.createElement('li');
        li.className = `transaction-item t-${t.type}`;

        const icon = t.type === 'deposit' ? '<i class="fas fa-arrow-down"></i>' : '<i class="fas fa-arrow-up"></i>';
        const sign = t.type === 'deposit' ? '+' : '-';

        li.innerHTML = `
            <div style="display:flex; align-items:center;">
                <div class="t-icon">${icon}</div>
                <div>
                    <div style="font-weight:bold; text-transform:capitalize;">${t.type}</div>
                    <div class="t-date">${new Date(t.date).toLocaleString()}</div>
                </div>
            </div>
            <div class="t-amount">${sign}$${t.amount.toFixed(2)}</div>
        `;
        list.appendChild(li);
    });
}

// Transactions
document.getElementById('deposit-btn').addEventListener('click', () => handleTransaction('deposit'));
document.getElementById('withdraw-btn').addEventListener('click', () => handleTransaction('withdraw'));

function handleTransaction(type) {
    const amountInput = document.getElementById('amount-input');
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    try {
        const user = bankService.getCurrentUser();
        const transaction = new Transaction(type, amount);
        user.addTransaction(transaction);
        bankService.saveUsers(); // Persist

        updateBalanceDisplay(user);
        updateTransactionList(user);
        amountInput.value = '';

        showBill(transaction, user);

    } catch (err) {
        alert(err.message);
    }
}

// Bill Generation
function showBill(transaction, user) {
    const modal = modals.bill;
    const content = document.getElementById('bill-content');

    content.innerHTML = `
        <p><strong>Bank:</strong> SAIRAM BANK</p>
        <p><strong>Date:</strong> ${transaction.getFormattedDate()}</p>
        <p><strong>Transaction ID:</strong> ${transaction.id}</p>
        <hr style="border-color: rgba(255,255,255,0.1); margin: 10px 0;">
        <p><strong>User:</strong> ${user.username}</p>
        <p><strong>Type:</strong> ${transaction.type.toUpperCase()}</p>
        <p style="font-size: 1.2rem; margin-top: 10px;"><strong>Amount:</strong> $${transaction.amount.toFixed(2)}</p>
        <p><strong>New Balance:</strong> $${user.balance.toFixed(2)}</p>
    `;

    modal.classList.add('active');
}

document.getElementById('close-bill-btn').addEventListener('click', () => {
    modals.bill.classList.remove('active');
});

// Clock
function startClock() {
    const clock = document.getElementById('clock');
    setInterval(() => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }, 1000);
}

// Password Toggle Logic
function setupPasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if (toggle && input) {
        toggle.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);

            toggle.classList.toggle('fa-eye');
            toggle.classList.toggle('fa-eye-slash');
        });
    }
}

setupPasswordToggle('toggle-login-password', 'login-password');
setupPasswordToggle('toggle-reg-password', 'reg-password');
