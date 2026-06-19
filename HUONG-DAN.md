# Hướng dẫn tạo video thiệp mời Hội Khóa Quốc Học 2003-2006

Bộ công cụ này tạo cho **mỗi người trong danh sách một video thiệp mời riêng**, với tên và lớp được viết lên phong bì bằng hiệu ứng chữ chạy. Toàn bộ chạy miễn phí trên GitHub, không cần cài phần mềm, không cần biết lập trình.

Video mỗi người gồm 5 cảnh: Phong bì (Mến gửi bạn + tên + lớp), Thư mời, Chương trình, Dresscode, Nhớ về nha. Dài khoảng 11,6 giây, định dạng MP4 mở được trên mọi điện thoại và đăng Facebook trực tiếp.

---

## Bước 1 - Tạo tài khoản và kho chứa trên GitHub

1. Vào https://github.com đăng ký tài khoản miễn phí (nếu chưa có).
2. Bấm nút **+** góc trên phải, chọn **New repository**.
3. Đặt tên bất kỳ, ví dụ `thiep-hoikhoa`. Chọn **Private** (riêng tư) cũng được. Bấm **Create repository**.

## Bước 2 - Tải bộ công cụ lên kho

1. Giải nén file `hoikhoa-video.zip` ra một thư mục trên máy.
2. Trong trang kho vừa tạo, bấm **Add file**, chọn **Upload files**.
3. Kéo **toàn bộ** các file và thư mục bên trong (không kéo thư mục cha) vào, gồm: `assets/`, `.github/`, `template.html`, `render.mjs`, `package.json`, `danhsach.csv`, `.gitignore`, các file hướng dẫn.
4. Bấm **Commit changes**.

## Bước 3 - Điền danh sách người nhận

1. Mở Google Sheet danh sách của anh. Cần đúng **hai cột**: cột **ten** (họ và tên đầy đủ) và cột **lop** (ví dụ: 12/2, 12 Toán).
2. Trong Google Sheet: **File**, **Download**, **Comma-separated values (.csv)**.
3. Đổi tên file tải về thành `danhsach.csv`.
4. Lên kho GitHub, mở file `danhsach.csv` cũ, bấm biểu tượng thùng rác để xóa, rồi **Upload files** đưa file `danhsach.csv` mới lên.

Mẫu có sẵn trong `danhsach.csv` để anh xem đúng định dạng. Dòng đầu tiên bắt buộc là `ten,lop`.

## Bước 4 - Chạy tạo video

1. Trên kho GitHub, mở tab **Actions** (thanh ngang phía trên).
2. Bên trái chọn **Render thiệp video Hội Khóa**.
3. Bấm nút **Run workflow** (góc phải), rồi bấm **Run workflow** lần nữa trong khung hiện ra.
4. Chờ. Quá trình chạy khoảng **10-15 giây cho mỗi người** (200 người khoảng 40-50 phút, 500 người khoảng 1,5-2 giờ).

## Bước 5 - Tải video về

1. Khi dòng chạy hiện dấu tích xanh là xong. Bấm vào lần chạy đó.
2. Kéo xuống mục **Artifacts**, bấm **thiep-video-mp4** để tải file nén chứa toàn bộ video về máy.
3. Giải nén. Mỗi người một file MP4, đặt tên theo tên người (ví dụ `thu-moi-huynh-anh-thuan.mp4`).

---

## Lưu ý khi khóa đông

Một lần chạy GitHub giới hạn 6 tiếng. Nếu khóa trên khoảng **800 người**, nên chia `danhsach.csv` thành 2-3 đợt (mỗi đợt vài trăm người), chạy lần lượt và tải về từng đợt cho chắc chắn.

## Muốn chỉnh sửa nhanh (không bắt buộc)

Mở file `render.mjs`, phần **CẤU HÌNH** ở đầu:
- `DUR`: số giây mỗi cảnh (mặc định 3).
- `TRANSITIONS`: danh sách kiểu chuyển cảnh, xoay vòng theo thứ tự. Mặc định trượt ngang và trượt lên xen kẽ. Có thể đổi sang `smoothleft`, `fade`, `wipeleft`, `circleopen`.
- `XF`: thời gian mỗi lần chuyển cảnh (mặc định 0,85 giây).
- `ANIM_DUR`: số giây chữ tên và lớp hiện dần trên phong bì (mặc định 2).
- Muốn video ngắn hơn: xóa bớt dòng trong `SEQUENCE` (ví dụ bỏ dresscode). Mỗi cảnh khoảng 2,15 giây.

Muốn thêm nhạc nền: đặt một file tên `music.mp3` vào thư mục `assets/` rồi chạy lại. Nên chọn nhạc không vướng bản quyền khi đăng Facebook.
