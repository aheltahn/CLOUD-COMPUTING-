import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['available', 'unavailable', 'out_of_stock'],
        default: 'available'
    },
    inventory: {
        type: Number,
        default: 0,
        min: 0
    },
    variant: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;