class Transaction {
    constructor(type, amount, description = '') {
        this.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.type = type; // 'deposit' or 'withdraw'
        this.amount = parseFloat(amount);
        this.date = new Date();
        this.description = description;
    }

    getFormattedDate() {
        return this.date.toLocaleString();
    }
}
