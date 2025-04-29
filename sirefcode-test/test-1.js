function calculateTax(income, age, dependents) {
	// Validation
	if (typeof income !== "number" || income < 0) {
		return "Invalid income";
	}
	if (typeof age !== "number" || age < 0) {
		return "Invalid age";
	}
	if (typeof dependents !== "number" || dependents < 0) {
		return "Invalid dependents";
	}

	// Rule a: Age less than 18
	if (age < 18) {
		return "Not eligible for tax";
	}

	// Recursive helper to calculate base tax
	function recursiveTax(currentIncome) {
		if (currentIncome <= 10000) {
			return currentIncome * 0.1;
		} else if (currentIncome <= 50000) {
			return currentIncome * 0.2;
		} else {
			return currentIncome * 0.3;
		}
	}

	// Step 1: Calculate base tax
	let tax = recursiveTax(income);

	// Step 2: Deduct $500 per dependent
	tax -= dependents * 500;

	// Step 3: Apply senior citizen discount (20%)
	if (age >= 65) {
		tax *= 0.8;
	}

	// Step 4: Minimum tax is $0
	return Math.max(tax, 0);            
}

// Example usage:
console.log(calculateTax(100000, 70, 2)); // Contoh: income $60k, umur 70, 2 tanggungan
console.log(calculateTax(10000, 30, 1)); // Contoh: income $8k, umur 30, 1 tanggungan
console.log(calculateTax(20000, 17, 0)); // Contoh: umur kurang dari 18
console.log(calculateTax(-5000, 25, 0)); // Contoh: income negatif
