class User {
    constructor(username, password, fullName, mobile, accountNumber, ifsc, balance = 0, transactions = []) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.mobile = mobile;
        this.accountNumber = accountNumber;
        this.ifsc = ifsc;
        this.balance = parseFloat(balance);
        this.transactions = transactions;
    }

    authenticate(inputPassword) {
        return this.password === inputPassword;
    }

    addTransaction(transaction) {
        this.transactions.unshift(transaction); // Add to beginning
        if (transaction.type === 'deposit') {
            this.balance += transaction.amount;
        } else if (transaction.type === 'withdraw') {
            if (this.balance >= transaction.amount) {
                this.balance -= transaction.amount;
            } else {
                throw new Error("Insufficient funds");
            }
        }
    }
}
