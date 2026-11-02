import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
cached = global.mongoose = {
conn: null,
promise: null,
};
}

export const connectDB = async () => {
const uri = process.env.MONGODB_URI;

if (!uri) {
console.error('MONGODB_URI is missing.');
return false;
}

if (cached.conn && mongoose.connection.readyState === 1) {
return true;
}

try {
if (!cached.promise) {
cached.promise = mongoose.connect(uri, {
serverSelectionTimeoutMS: 10000,
bufferCommands: false,
});
}

```
cached.conn = await cached.promise;

console.log('MongoDB connected successfully.');

return true;
```

} catch (error) {
cached.promise = null;
cached.conn = null;

```
console.error('MongoDB connection failed:', error.message);

return false;
```

}
};
