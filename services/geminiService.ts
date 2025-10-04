import OpenAI from "openai";

if (!process.env.API_KEY) {
    console.warn("Biến môi trường API_KEY chưa được thiết lập. Các tính năng của OpenAI API sẽ bị vô hiệu hóa.");
}

const openai = new OpenAI({ 
    apiKey: process.env.API_KEY!,
    dangerouslyAllowBrowser: true 
});

export const generateSqlSchema = async (description: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve("```sql\n-- API_KEY chưa được cấu hình. Vui lòng thiết lập biến môi trường API_KEY để sử dụng OpenAI API.\n```");
    }
    try {
        const prompt = `Dựa trên mô tả về phần mềm quản lý hợp đồng sau đây, hãy viết một bộ câu lệnh SQL đầy đủ, an toàn và có thể chạy lại nhiều lần (idempotent) cho PostgreSQL.

Mô tả: "${description}"

---
### QUY TẮC BẮT BUỘC KHI TẠO KỊCH BẢN ###
1.  **IDEMPOTENT SCRIPT**: Kịch bản phải có khả năng chạy lại mà không gây lỗi nếu các đối tượng đã tồn tại.
    *   Sử dụng \`CREATE TABLE IF NOT EXISTS ...\` cho tất cả các bảng.
    *   Sử dụng \`INSERT ... ON CONFLICT DO NOTHING\` cho dữ liệu ban đầu.
    *   Sử dụng \`CREATE INDEX IF NOT EXISTS ...\` cho tất cả các chỉ mục.
    *   Giữ lại \`CREATE OR REPLACE VIEW ...\` cho VIEW.
2.  **TUỲ CHỌN DỌN DẸP**: Ở đầu kịch bản, thêm vào các câu lệnh \`DROP ... IF EXISTS\` nhưng **phải được comment lại** (\`-- DROP ...\`). Điều này cho phép người dùng chủ động dọn dẹp nếu họ muốn bắt đầu lại từ đầu.
---

### YÊU CẦU CHI TIẾT VỀ CẤU TRÚC ###

1.  **Bảng \`contracts\` (Hợp đồng gốc)**:
    *   Các trường: \`id\` (UUID, PK), \`contract_number\` (TEXT, UNIQUE), \`owner_name\`, \`ward\`, \`sheet_number\`, \`plot_number\`, \`is_branch\`, \`status\` (TEXT), \`notes\`, \`cancellation_reason\` (TEXT), \`created_at\`, \`updated_at\`.
    *   Bảng này KHÔNG chứa thông tin thanh lý.

2.  **Bảng \`liquidations\` (Thông tin Thanh lý)**:
    *   Các trường: \`id\` (UUID, PK), \`contract_id\` (UUID, khóa ngoại tham chiếu đến \`contracts.id\`), \`liquidation_number\` (TEXT, UNIQUE), \`liquidation_date\` (TIMESTAMPTZ), \`is_cancelled\` (BOOLEAN, default \`false\`), \`cancellation_reason\` (TEXT), \`created_at\`.
    *   Sử dụng \`ON DELETE CASCADE\` trên khóa ngoại.

3.  **Bảng \`yearly_sequences\` (Quản lý cấp số theo năm)**:
    *   **Mục đích**: Để quản lý các số thứ tự được reset hàng năm.
    *   **Các cột**: \`sequence_name\` (TEXT), \`year\` (INT), \`last_value\` (INT).
    *   **Khóa chính**: PRIMARY KEY (\`sequence_name\`, \`year\`).
    *   **Lưu ý**: Bảng này không cần dữ liệu khởi tạo. Dòng đầu tiên cho mỗi năm sẽ được tạo tự động khi hàm cấp số được gọi.

4.  **Bảng \`contract_history\` (Lịch sử)**:
    *   Các trường: \`id\`, \`contract_id\` (khóa ngoại tới \`contracts.id\`), \`timestamp\`, \`action\`, \`details\`.

5.  **VIEW \`contracts_with_details\` (CỰC KỲ QUAN TRỌNG)**:
    *   Tạo một \`VIEW\` tên là \`contracts_with_details\`.
    *   **Logic Join**: VIEW này phải \`LEFT JOIN\` từ \`contracts\` (\`c\`) sang một subquery của \`liquidations\` (\`l\`). Subquery này phải sử dụng \`ROW_NUMBER() OVER(PARTITION BY contract_id ORDER BY created_at DESC) as rn\` để tìm ra bản ghi thanh lý **mới nhất** cho mỗi hợp đồng, và chỉ join với các bản ghi có \`rn = 1\`.
    *   **Các cột trả về**: Tất cả các cột từ \`contracts\`, các cột chính từ \`liquidations\` (đổi tên nếu cần để tránh xung đột), và một cột \`cancellation_reason\` hợp nhất.

6.  **Tối ưu hóa**: Tạo index cho các cột khóa ngoại và các cột thường được tìm kiếm.

7.  **Output**: Trả về một khối code SQL hợp lệ, có chú thích rõ ràng, theo đúng thứ tự.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        return response.choices[0].message.content || "Không thể tạo SQL.";
    } catch (error) {
        console.error("Lỗi khi tạo lược đồ SQL:", error);
        return "Lỗi khi tạo SQL. Vui lòng kiểm tra console để biết chi tiết.";
    }
};

export const generateBackendCode = async (description: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve("```javascript\n// API_KEY chưa được cấu hình. Vui lòng thiết lập biến môi trường API_KEY để sử dụng OpenAI API.\n```");
    }
    try {
        const prompt = `Dựa trên mô tả và yêu cầu sau, hãy viết các hàm cơ sở dữ liệu PostgreSQL (RPC) để xử lý TOÀN BỘ logic nghiệp vụ.

Mô tả: "${description}"

**Bối cảnh CSDL**:
-   Bảng \`contracts\`: Chứa thông tin hợp đồng gốc.
-   Bảng \`liquidations\`: Chứa thông tin thanh lý.
-   Bảng \`yearly_sequences\`: Chứa số đếm tự tăng, reset theo năm.

---
### QUY TẮC BẮT BUỘC ###

#### 1. ĐỊNH DẠNG SỐ (NUMBER FORMATTING)
- **Số Hợp đồng**: Phải có định dạng \`[số thứ tự]/[năm 2 chữ số].HĐ.[mã]\`. Ví dụ: \`01/25.HĐ.LK\`.
- **Số Thanh lý**: Phải có định dạng \`[số thứ tự]/[năm 2 chữ số].TL.[mã]\`. Ví dụ: \`05/25.TL.BV\`.
- **Số thứ tự**: Bắt đầu từ 1 mỗi năm và được đệm bằng số 0 để có ít nhất 2 chữ số (ví dụ: \`01\`, \`02\`, ..., \`10\`).
- **Mã Phường**: Chỉ được sử dụng khi hợp đồng KHÔNG phải của chi nhánh. Sử dụng bảng ánh xạ sau bên trong hàm bằng câu lệnh \`CASE\`:
    - 'Phường Bình Lộc' -> 'BL'
    - 'Phường Long Khánh' -> 'LK'
    - 'Phường Bảo Vinh' -> 'BV'
    - 'Phường Xuân Lập' -> 'XL'
    - 'Phường Hàng Gòn' -> 'HG'
    - Nếu không khớp, sử dụng 'XX' làm mã mặc định.
- **Mã Chi nhánh (CỰC KỲ QUAN TRỌNG)**: Nếu hợp đồng thuộc chi nhánh (\`is_branch\` là \`true\`), mã địa bàn PHẢI LUÔN LUÔN là \`'CNLK'\`, bất kể phường nào được chọn. Ví dụ: \`05/25.HĐ.CNLK\`.

#### 2. LOGIC CẤP SỐ (NUMBER GENERATION LOGIC)
- **Logic tại Backend**: Toàn bộ logic cấp số phải được thực hiện trong các hàm PostgreSQL.
- **Reset hàng năm**: Số thứ tự cho cả hợp đồng và thanh lý phải được reset về 1 vào đầu mỗi năm mới.
- **Phương pháp an toàn**: Bắt buộc sử dụng bảng \`yearly_sequences\` với câu lệnh \`INSERT ... ON CONFLICT (sequence_name, year) DO UPDATE SET last_value = yearly_sequences.last_value + 1 RETURNING last_value;\`. Đây là cách an toàn nhất để vừa tạo dòng mới cho năm, vừa tăng số cho năm hiện tại. TUYỆT ĐỐI KHÔNG DÙNG \`SELECT MAX(...)\`.
- **Tính Độc lập**: Chuỗi số hợp đồng và thanh lý là hoàn toàn độc lập.
- **Không Tái sử dụng**: Số thanh lý đã bị hủy thì **KHÔNG ĐƯỢC PHÉP TÁI SỬ DỤNG**. Khi thanh lý lại, phải cấp số MỚI.

---
Yêu cầu chi tiết cho 5 hàm RPC bằng ngôn ngữ PL/pgSQL:

1.  **Hàm \`create_new_contract\`**:
    *   **Logic**:
        1.  Kiểm tra tham số \`p_is_branch\`.
        2.  Nếu là \`true\`, gán mã cuối cùng là \`'CNLK'\`.
        3.  Nếu là \`false\`, lấy mã phường từ tham số \`p_ward\` (sử dụng \`CASE\` statement).
        4.  Lấy số thứ tự mới cho năm hiện tại từ bảng \`yearly_sequences\` một cách an toàn.
        5.  Tạo chuỗi số hợp đồng theo đúng định dạng (\`LPAD(..., 2, '0')\`, \`TO_CHAR(now(), 'YY')\`).
        6.  \`INSERT\` vào \`contracts\`.
        7.  Tạo lịch sử.
    *   **Tham số**: p_ward TEXT, p_owner_name TEXT, p_sheet_number TEXT, p_plot_number TEXT, p_is_branch BOOLEAN, p_notes TEXT.

2.  **Hàm \`liquidate_contract\`**:
    *   **Logic BẮT BUỘC**:
        1.  Kiểm tra hợp đồng ở trạng thái 'Đang hiệu lực'.
        2.  Lấy thông tin \`ward\` và \`is_branch\` của hợp đồng từ bảng \`contracts\`.
        3.  Kiểm tra giá trị \`is_branch\` đã lấy.
        4.  Nếu là \`true\`, gán mã cuối cùng là \`'CNLK'\`.
        5.  Nếu là \`false\`, lấy mã phường từ cột \`ward\` đã lấy (sử dụng \`CASE\` statement).
        6.  Lấy số thứ tự thanh lý MỚI cho năm hiện tại từ \`yearly_sequences\`.
        7.  Tạo chuỗi số thanh lý theo đúng định dạng.
        8.  \`INSERT\` một bản ghi **MỚI** vào bảng \`liquidations\`.
        9.  \`UPDATE\` trạng thái của hợp đồng trong \`contracts\` thành 'Đã thanh lý'.
        10. Tạo lịch sử 'Thanh lý'.
    *   **Tham số**: p_contract_id UUID.

3.  **Hàm \`cancel_liquidation\`**:
    *   **Logic**:
        1.  Tìm bản ghi thanh lý mới nhất, chưa bị hủy trong \`liquidations\`.
        2.  \`UPDATE\` bản ghi \`liquidations\` đó, đặt \`is_cancelled = TRUE\` và ghi lại \`cancellation_reason\`.
        3.  \`UPDATE\` trạng thái trong \`contracts\` trở lại 'Đang hiệu lực'.
        4.  Tạo lịch sử 'Hủy thanh lý'.
    *   **Tham số**: p_contract_id UUID, p_reason TEXT.

4.  **Hàm \`update_contract_details\`**:
    *   **Logic**: \`UPDATE\` các trường trong bảng \`contracts\` và tạo bản ghi lịch sử.
    *   **Tham số**: p_contract_id UUID, p_ward TEXT, p_owner_name TEXT, p_sheet_number TEXT, p_plot_number TEXT, p_is_branch BOOLEAN, p_notes TEXT.

5.  **Hàm \`cancel_contract\`**:
    *   **Logic**:
        1.  \`UPDATE\` bảng \`contracts\`.
        2.  Set \`status\` thành 'Đã hủy'.
        3.  Lưu \`p_reason\` vào cột \`cancellation_reason\` của bảng \`contracts\`.
        4.  Tạo bản ghi lịch sử.
    *   **Tham số**: p_contract_id UUID, p_reason TEXT.

---
**Cấu trúc Output**: Trình bày mã nguồn dưới dạng các câu lệnh \`CREATE OR REPLACE FUNCTION ...\` rõ ràng, có chú thích.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        return response.choices[0].message.content || "Không thể tạo mã nguồn backend.";
    } catch (error) {
        console.error("Lỗi khi tạo mã nguồn backend:", error);
        return "Lỗi khi tạo mã nguồn backend. Vui lòng kiểm tra console để biết chi tiết.";
    }
};