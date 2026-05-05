const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000,
        });
        
        console.log('\n✅ MongoDB Atlas Connected Successfully!');
        console.log(`📦 Host: ${conn.connection.host}`);
        console.log(`📚 Database Name: ${conn.connection.name}`);
        console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);
        
        return conn;
    } catch (error) {
        console.error('\n❌ MongoDB Connection Failed!');
        console.error(`🚫 Error: ${error.message}`);
        console.error('\n💡 Troubleshooting Tips:');
        console.error('   1. Check if IP address is whitelisted in MongoDB Atlas');
        console.error('   2. Verify username and password are correct');
        console.error('   3. Make sure network access allows your IP\n');
        process.exit(1);
    }
};

module.exports = connectDB;