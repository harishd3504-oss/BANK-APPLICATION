class BankService {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
    }

    loadUsers() {
        const usersData = localStorage.getItem('sairambank_users');
        const parsedUsers = usersData ? JSON.parse(usersData) : [];
        // Rehydrate User objects (needed to have methods)
        return parsedUsers.map(u => {
            // Updated constructor usage
            const user = new User(u.username, u.password, u.fullName, u.mobile, u.accountNumber, u.ifsc, u.balance);
            // Rehydrate transactions
            user.transactions = u.transactions.map(t => {
                const tr = new Transaction(t.type, t.amount, t.description);
                tr.id = t.id;
                tr.date = new Date(t.date);
                return tr;
            });
            return user;
        });
    }

    saveUsers() {
        localStorage.setItem('sairambank_users', JSON.stringify(this.users));
    }

    register(username, password, fullName, mobile, accountNumber, ifsc) {
        if (this.users.find(u => u.username === username)) {
            throw new Error("Username already taken");
        }
        // Validate Account Number Uniqueness (optional but good practice)
        if (this.users.find(u => u.accountNumber === accountNumber)) {
            throw new Error("Account number already registered");
        }

        const newUser = new User(username, password, fullName, mobile, accountNumber, ifsc);
        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username);
        if (user && user.authenticate(password)) {
            return user;
        }
        throw new Error("Invalid username or password");
    }

    setCurrentUser(user) {
        this.currentUser = user;
        // In a real app we might use a session token, here we stick to in-memory for simpler session
        // or we could save 'currentUser' index to localStorage to persist after reload
        localStorage.setItem('sairambank_current_user', user ? user.username : '');
    }

    getCurrentUser() {
        // Try to recover session
        if (!this.currentUser) {
            const storedUsername = localStorage.getItem('sairambank_current_user');
            if (storedUsername) {
                this.currentUser = this.users.find(u => u.username === storedUsername);
            }
        }
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('sairambank_current_user');
    }

    generateOTP() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
}
