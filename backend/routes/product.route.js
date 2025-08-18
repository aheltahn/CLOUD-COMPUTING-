/**
 * Đây là file định nghĩa các route (đường dẫn API) cho resource "product" (sản phẩm).
 * File này sử dụng Express Router để tổ chức các endpoint liên quan đến sản phẩm,
 * đồng thời cấu hình Multer để xử lý upload file ảnh sản phẩm.
 */

import express from 'express'; // Import framework Express để tạo router.
import multer from 'multer';   // Import Multer để xử lý upload file.
import path from 'path';       // Import path để thao tác với đường dẫn file.
import fs from 'fs';           // Import fs để thao tác với file hệ thống.
import { fileURLToPath } from 'url'; // Dùng để lấy __dirname trong ES modules.
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller.js'; // Import các controller xử lý logic cho từng route.

const router = express.Router(); // Tạo một instance router của Express.

// Lấy đường dẫn tuyệt đối của file hiện tại (__filename) và thư mục chứa nó (__dirname) trong môi trường ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lấy đường dẫn tuyệt đối của thư mục gốc project
const projectRoot = path.resolve(__dirname, '../..');

// Kiểm tra cả hai vị trí có thể của thư mục uploads
const uploadsInBackend = path.join(__dirname, '../../uploads');
const uploadsInRoot = path.join(projectRoot, 'uploads');

console.log('Route uploads directory:', uploadsInRoot);

// Xác định thư mục uploads thực tế để sử dụng
let actualUploadsDir;
if (fs.existsSync(uploadsInRoot)) {
    actualUploadsDir = uploadsInRoot;
    console.log('Using project root uploads directory:', actualUploadsDir);
} else if (fs.existsSync(uploadsInBackend)) {
    actualUploadsDir = uploadsInBackend;
    console.log('Using backend uploads directory:', actualUploadsDir);
} else {
    // Nếu cả hai không tồn tại, tạo mới trong thư mục gốc
    actualUploadsDir = uploadsInRoot;
    fs.mkdirSync(actualUploadsDir, { recursive: true });
    console.log('Created uploads directory:', actualUploadsDir);
}

// Cấu hình Multer để lưu file upload vào thư mục uploads với tên file an toàn, duy nhất.
const storage = multer.diskStorage({
    // Định nghĩa thư mục lưu file upload.
    destination: function (req, file, cb) {
        console.log('Multer will save file to:', actualUploadsDir);
        cb(null, actualUploadsDir);
    },
    // Định nghĩa cách đặt tên file upload.
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất bằng cách nối tên trường, timestamp và số ngẫu nhiên, giữ lại extension gốc.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
        cb(null, fileName);
    }
});

// Khởi tạo middleware upload với cấu hình:
// - Chỉ cho phép file ảnh (mimetype bắt đầu bằng 'image/')
// - Giới hạn dung lượng file tối đa 5MB
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Chỉ cho phép upload file ảnh.
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Định nghĩa các route cho sản phẩm:

// 1. Tạo sản phẩm mới (có thể upload ảnh)
//    - POST /api/products
//    - Middleware upload.single('image') xử lý upload 1 file ảnh với field name là 'image'
//    - Controller createProduct xử lý logic tạo sản phẩm
router.post('/', upload.single('image'), createProduct);

// 2. Lấy danh sách tất cả sản phẩm
//    - GET /api/products
//    - Controller getProducts trả về danh sách sản phẩm
router.get('/', getProducts);

// 3. Lấy chi tiết một sản phẩm theo id
//    - GET /api/products/:id
//    - Controller getProductById trả về chi tiết sản phẩm
router.get('/:id', getProductById);

// 4. Cập nhật sản phẩm (có thể upload ảnh mới)
//    - PUT /api/products/:id
//    - Middleware upload.single('image') xử lý upload ảnh mới nếu có
//    - Controller updateProduct xử lý cập nhật thông tin sản phẩm
router.put('/:id', upload.single('image'), updateProduct);

// 5. Xóa sản phẩm (thực chất chỉ cập nhật status thành 'unavailable')
//    - DELETE /api/products/:id
//    - Controller deleteProduct xử lý logic xóa (ẩn) sản phẩm
router.delete('/:id', deleteProduct);

// Xuất router để sử dụng ở file app.js hoặc index.js
export default router;