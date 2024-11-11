// Insert customer records
db.customers.insertMany([
    { name: "John Doe", email: "johndoe@example.com", address: { street: "123 Main St", city: "Springfield", zipcode: "12345" }, phone: "555-1234", registered_on: ISODate("2023-01-01T12:00:00Z") },
    { name: "Jane Smith", email: "janesmith@example.com", address: { street: "456 Elm St", city: "Shelbyville", zipcode: "54321" }, phone: "555-5678", registered_on: ISODate("2023-02-15T12:00:00Z") },
    { name: "Alice Johnson", email: "alicej@example.com", address: { street: "789 Oak St", city: "Springfield", zipcode: "12345" }, phone: "555-8765", registered_on: ISODate("2023-03-10T12:00:00Z") },
    { name: "Bob Brown", email: "bobbrown@example.com", address: { street: "321 Pine St", city: "Shelbyville", zipcode: "54321" }, phone: "555-4321", registered_on: ISODate("2023-04-20T12:00:00Z") },
    { name: "Carol White", email: "carolwhite@example.com", address: { street: "654 Maple St", city: "Springfield", zipcode: "12345" }, phone: "555-6789", registered_on: ISODate("2023-05-05T12:00:00Z") }
]);

// Example of retrieving customer IDs by name
db.customers.findOne({ name: "John Doe" })._id;
db.customers.findOne({ name: "Jane Smith" })._id;
db.customers.findOne({ name: "Alice Johnson" })._id;
db.customers.findOne({ name: "Bob Brown" })._id;
db.customers.findOne({ name: "Carol White" })._id;

// Insert order records
db.orders.insertMany([
    {
        order_code: "ODR001",
        client_id: ObjectId('67320c549ec744648a0d8190'),
        placed_on: ISODate("2023-05-15T00:00:00Z"),
        current_status: "shipped",
        products: [
            { item: "Laptop", quantity: 1, unit_price: 1500 },
            { item: "Mouse", quantity: 2, unit_price: 25 }
        ],
        total_amount: 1550
    },
    {
        order_code: "ODR002",
        client_id: ObjectId('67320c549ec744648a0d8191'),
        placed_on: ISODate("2023-06-01T00:00:00Z"),
        current_status: "pending",
        products: [
            { item: "Tablet", quantity: 1, unit_price: 300 }
        ],
        total_amount: 300
    },
    {
        order_code: "ODR003",
        client_id: ObjectId('67320c549ec744648a0d8192'),
        placed_on: ISODate("2023-06-10T00:00:00Z"),
        current_status: "delivered",
        products: [
            { item: "Keyboard", quantity: 1, unit_price: 100 },
            { item: "Monitor", quantity: 1, unit_price: 200 }
        ],
        total_amount: 300
    },
    {
        order_code: "ODR004",
        client_id: ObjectId('67320c549ec744648a0d8193'),
        placed_on: ISODate("2023-06-20T00:00:00Z"),
        current_status: "shipped",
        products: [
            { item: "Smartphone", quantity: 1, unit_price: 800 }
        ],
        total_amount: 800
    },
    {
        order_code: "ODR005",
        client_id: ObjectId('67320c549ec744648a0d8194'),
        placed_on: ISODate("2023-07-01T00:00:00Z"),
        current_status: "processing",
        products: [
            { item: "Headphones", quantity: 1, unit_price: 50 },
            { item: "Charger", quantity: 1, unit_price: 20 }
        ],
        total_amount: 70
    }
]);

// Find all orders placed by a specific customer
db.orders.find({ client_id: ObjectId('67320c549ec744648a0d8190') });

// Find a specific customer by ID
db.customers.findOne({ _id: ObjectId('67320c549ec744648a0d8190') });

// Update an order status
db.orders.updateOne(
    { order_code: "ODR001" },
    { $set: { current_status: "delivered" } }
);

// Delete an order by order code
db.orders.deleteOne({ order_code: "ODR001" });

// Aggregation to calculate total spending per customer
db.orders.aggregate([
    { $group: { _id: "$client_id", total_spent: { $sum: "$total_amount" } } },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "client_info" } },
    { $unwind: "$client_info" },
    { $project: { name: "$client_info.name", total_spent: 1, email: "$client_info.email" } }
]);

// Aggregation to get order count by current status
db.orders.aggregate([
    { $group: { _id: "$current_status", order_count: { $sum: 1 } } }
]);

// Aggregation to get the most recent order for each customer
db.orders.aggregate([
    { $sort: { placed_on: -1 } },
    { $group: { _id: "$client_id", latest_order: { $first: "$$ROOT" } } },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "client_info" } },
    { $unwind: "$client_info" },
    { $project: { name: "$client_info.name", email: "$client_info.email", order_code: "$latest_order.order_code", total_amount: "$latest_order.total_amount" } }
]);

// Aggregation to find the top order by total amount for each customer
db.orders.aggregate([
    { $sort: { total_amount: -1 } },
    { $group: { _id: "$client_id", top_order: { $first: "$$ROOT" } } },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "client_info" } },
    { $unwind: "$client_info" },
    { $project: { name: "$client_info.name", order_code: "$top_order.order_code", total_amount: "$top_order.total_amount" } }
]);

// Aggregation to get orders placed within the last 30 days
db.orders.aggregate([
    { $match: { placed_on: { $gte: ISODate(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()) } } },
    { $group: { _id: "$client_id", recent_order: { $first: "$$ROOT" } } },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "client_info" } },
    { $unwind: "$client_info" },
    { $project: { name: "$client_info.name", email: "$client_info.email", order_date: "$recent_order.placed_on" } }
]);

// Aggregation to count the quantity of each product ordered by a specific customer
db.orders.aggregate([
    { $match: { client_id: ObjectId('67320c549ec744648a0d8190') } },
    { $unwind: "$products" },
    { $group: { _id: "$products.item", quantity_ordered: { $sum: "$products.quantity" } } }
]);

// Aggregation to find top 3 customers by spending
db.orders.aggregate([
    { $group: { _id: "$client_id", total_spent: { $sum: "$total_amount" } } },
    { $sort: { total_spent: -1 } },
    { $limit: 3 },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "client_info" } },
    { $unwind: "$client_info" },
    { $project: { name: "$client_info.name", total_spent: 1, email: "$client_info.email" } }
]);

// Insert a new order for a specific customer
db.orders.insertOne({
    order_code: "ODR006",
    client_id: ObjectId("67320c549ec744648a0d8191"),
    placed_on: ISODate("2023-08-01T14:00:00Z"),
    current_status: "pending",
    products: [
        { item: "Smartphone", quantity: 1, unit_price: 700 },
        { item: "Headphones", quantity: 2, unit_price: 50 }
    ],
    total_amount: 800
});

// Aggregation to find customers with no orders
db.customers.aggregate([
    { $lookup: { from: "orders", localField: "_id", foreignField: "client_id", as: "order_history" } },
    { $match: { "order_history": { $size: 0 } } },
    { $project: { name: 1, email: 1 } }
]);

// Aggregation to calculate the average quantity of items per order
db.orders.aggregate([
    { $unwind: "$products" },
    { $group: { _id: null, avg_items: { $avg: "$products.quantity" } } },
    { $project: { avg_items: 1, _id: 0 } }
]);

// Aggregation to calculate average order total for customers in a specific city
db.orders.aggregate([
    { $lookup: { from: "customers", localField: "client_id", foreignField: "_id", as: "client_info" } },
    { $unwind: "$client_info" },
    { $match: { "client_info.address.city": "Springfield" } },
    { $group: { _id: null, avg_order_total: { $avg: "$total_amount" } } }
]);

// Aggregation to calculate total revenue from all orders
db.orders.aggregate([
    { $group: { _id: null, total_revenue: { $sum: "$total_amount" } } }
]);