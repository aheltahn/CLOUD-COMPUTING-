import Product from '../models/product.model.js';
import path from 'path';
import fs from 'fs';

const VALID_STATUSES = ['available', 'unavailable', 'out_of_stock'];

// Helper function để chuẩn hóa đường dẫn hình ảnh
const normalizeImagePath = (imagePath) => {
    if (!imagePath) return '/placeholder-product.jpg';

    // Chuyển tất cả backslash thành forward slash
    let normalizedPath = imagePath.replace(/\\/g, '/');

    // Đảm bảo đường dẫn bắt đầu bằng /uploads/
    if (normalizedPath.startsWith('uploads/')) {
        normalizedPath = '/' + normalizedPath;
    } else if (!normalizedPath.startsWith('/uploads/') && !normalizedPath.startsWith('/placeholder')) {
        // Chỉ lấy tên file từ đường dẫn
        const filename = path.basename(normalizedPath);
        normalizedPath = '/uploads/' + filename;
    }

    return normalizedPath;
};

// Helper function để kiểm tra file tồn tại ở nhiều vị trí có thể
const checkFileExists = (filename) => {
    // Kiểm tra các vị trí có thể chứa file
    const possibleLocations = [
        path.join(process.cwd(), 'uploads', filename),
        path.join(process.cwd(), 'backend/uploads', filename),
        path.join(process.cwd(), '../uploads', filename)
    ];

    // Kiểm tra từng vị trí
    for (const location of possibleLocations) {
        if (fs.existsSync(location)) {
            console.log('✅ File found at:', location);
            return true;
        }
    }

    console.log('❌ File not found in any location:', filename);
    return false;
};

// Tạo sản phẩm mới
export const createProduct = async (req, res) => {
    try {
        const { status, inventory } = req.body;
        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }
        if (inventory !== undefined && inventory < 0) {
            return res.status(400).json({ message: 'Inventory must be >= 0.' });
        }
        let variant = req.body.variant;
        if (typeof variant === 'string') {
            try {
                variant = JSON.parse(variant);
            } catch (e) {
                return res.status(400).json({ message: 'Variant must be a valid JSON array.' });
            }
        }
        let imagePath = '/placeholder-product.jpg'; // Giá trị mặc định
        if (req.file) {
            // Chuẩn hóa đường dẫn hình ảnh ngay từ đầu
            imagePath = normalizeImagePath('uploads/' + req.file.filename);

            // Log để debug
            console.log('File uploaded:', {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                normalizedPath: imagePath
            });

            // Kiểm tra file tồn tại
            if (!checkFileExists(req.file.filename)) {
                return res.status(500).json({ message: 'Failed to save uploaded image.' });
            }
        }
        const product = new Product({
            ...req.body,
            tenantId: req.tenantId,
            variant,
            image: imagePath // Sử dụng đường dẫn đã chuẩn hóa
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
};

// Lấy danh sách sản phẩm với pagination và filters
export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = '',
            status = '',
            category = '',
            size = '',
            color = '',
            sortBy = 'newest',
            priceMin = '',
            priceMax = ''
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let filter = {};
        if (req.tenantId) {
            filter.tenantId = req.tenantId;
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        // Logic lọc theo Size và Color trong mảng variant
        if (size || color) {
            filter.variant = { $elemMatch: {} };
            if (size) filter.variant.$elemMatch.size = size;
            if (color) filter.variant.$elemMatch.color = { $regex: new RegExp(color, 'i') };
        }

        if (search) {
            filter.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Logic lọc trạng thái thông minh
        if (status === 'available') {
            // Khả dụng: Trạng thái available VÀ còn hàng
            filter.status = 'available';
            filter.inventory = { $gt: 0 };
        } else if (status === 'out_of_stock') {
            // Hết hàng: Trạng thái out_of_stock HOẶC inventory = 0 (nhưng không phải unavailable)
            filter.$and = [
                { status: { $ne: 'unavailable' } },
                {
                    $or: [
                        { status: 'out_of_stock' },
                        { inventory: { $lte: 0 } }
                    ]
                }
            ];
        } else if (status && status !== 'all') {
            // Các trạng thái khác (như unavailable)
            filter.status = status;
        }

        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = parseInt(priceMin);
            if (priceMax) filter.price.$lte = parseInt(priceMax);
        }

        let sort = {};
        switch (sortBy) {
            case 'price_asc':
                sort.price = 1;
                break;
            case 'price_desc':
                sort.price = -1;
                break;
            case 'name_asc':
                sort.productName = 1;
                break;
            case 'name_desc':
                sort.productName = -1;
                break;
            case 'oldest':
                sort.createdAt = 1;
                break;
            case 'newest':
            default:
                sort.createdAt = -1;
                break;
        }

        const products = await Product
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        // Chuẩn hóa đường dẫn hình ảnh cho tất cả sản phẩm
        const normalizedProducts = products.map(product => {
            const productObj = product.toObject();
            productObj.image = normalizeImagePath(productObj.image);
            return productObj;
        });

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limitNum);

        res.json({
            products: normalizedProducts,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalOrders: totalProducts, // Cần đồng nhất với tên trường ở frontend nếu cần
                totalProducts,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy tất cả thuộc tính (màu, size) hiện có trong hệ thống
export const getProductAttributes = async (req, res) => {
    try {
        let filter = {};
        if (req.tenantId) {
            filter.tenantId = req.tenantId;
        }
        
        const colors = await Product.distinct('variant.color', filter);
        const sizes = await Product.distinct('variant.size', filter);
        
        const validColors = colors.filter(c => c && c.trim() !== '').sort();
        const validSizes = sizes.filter(s => s && s.trim() !== '').sort();

        res.json({ colors: validColors, sizes: validSizes });
    } catch (error) {
        console.error('Error getting attributes:', error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy chi tiết sản phẩm
export const getProductById = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.tenantId) query.tenantId = req.tenantId;
        const product = await Product.findOne(query);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Chuẩn hóa đường dẫn hình ảnh
        const productObj = product.toObject();
        productObj.image = normalizeImagePath(productObj.image);

        res.json(productObj);
    } catch (error) {
        console.error('Error getting product by ID:', error);
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
    try {
        const { status, inventory } = req.body;

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        if (inventory !== undefined && inventory < 0) {
            return res.status(400).json({ message: 'Inventory must be >= 0.' });
        }

        let updateData = {};

        if (status !== undefined) updateData.status = status;
        if (inventory !== undefined) updateData.inventory = inventory;

        if (req.body.variant !== undefined) {
            if (typeof req.body.variant === 'string') {
                try {
                    updateData.variant = JSON.parse(req.body.variant);
                } catch (e) {
                    return res.status(400).json({ message: 'Variant must be a valid JSON array.' });
                }
            } else {
                updateData.variant = req.body.variant;
            }
        }

        if (req.file) {
            // Chuẩn hóa đường dẫn hình ảnh khi cập nhật
            updateData.image = normalizeImagePath('uploads/' + req.file.filename);

            // Log để debug
            console.log('New image uploaded:', {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                normalizedPath: updateData.image
            });

            // Kiểm tra file tồn tại
            if (!checkFileExists(req.file.filename)) {
                return res.status(500).json({ message: 'Failed to save uploaded image.' });
            }
        }

        if (req.body.productName !== undefined) {
            updateData.productName = req.body.productName;
        }

        const allowedFields = ['price', 'description', 'category'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const query = { _id: req.params.id };
        if (req.tenantId) query.tenantId = req.tenantId;
        
        const product = await Product.findOneAndUpdate(query, updateData, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Chuẩn hóa đường dẫn hình ảnh trong kết quả trả về
        const productObj = product.toObject();
        productObj.image = normalizeImagePath(productObj.image);

        res.json(productObj);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
};

// Xóa sản phẩm (chỉ cập nhật status thành 'unavailable')
export const deleteProduct = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.tenantId) query.tenantId = req.tenantId;

        const product = await Product.findOneAndUpdate(
            query,
            { status: 'unavailable' },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Chuẩn hóa đường dẫn hình ảnh trong kết quả trả về
        const productObj = product.toObject();
        productObj.image = normalizeImagePath(productObj.image);

        res.json({ message: 'Product set to unavailable', product: productObj });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
};