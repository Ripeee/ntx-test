function calculateShippingCost(destination, weight, priority) {
    if (destination !== "international" && destination !== "domestic") {
        return "Invalid destination";
    }
    if (typeof weight !== "number" || weight <= 0) {
        return "Invalid weight";
    }
    if (priority !== "standard" && priority !== "express" && priority !== "priority") {
        return "Invalid priority";
    }
    
    let baseCost = 0;
                
    if (destination == "international") {
        if (priority == "standard") {
            baseCost = 15;
        } else if (priority == "express") {
            baseCost = 25;
        } else if (priority == "prority") {
            baseCost = 50;
        }
    } else if (destination == "domestic") {
        if (priority == "standard") {
            baseCost = 5;
        } else if (priority == "express") {
            baseCost = 10;
        } else if (priority == "prority") {
            baseCost = 20;
        }
    }

    let totalCost = baseCost * weight;

    if (destination == "domestic" && weight > 10) {
        totalCost += 10;
    } else if (destination == "international" && weight > 5) {
        totalCost += 50;
    }

    return totalCost;
}

console.log(calculateShippingCost("international", 6, "express")); // Contoh: tujuan internasional, berat 10kg, prioritas express