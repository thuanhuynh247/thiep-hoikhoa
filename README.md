# Thiệp mời video Hội Khóa Quốc Học 2003–2006

Tự động tạo video thư mời cá nhân (MP4 H.264) cho từng người theo danh sách tên + lớp,
render bằng GitHub Actions — không cần cài gì trên máy.

## Cách dùng

1. **Tạo repo GitHub mới**, tải toàn bộ thư mục này lên (kéo–thả file vào repo cũng được).
2. **Sửa danh sách**: mở `danhsach.csv`, điền theo mẫu hai cột `ten,lop`
   (xuất trực tiếp từ Google Sheet: File → Download → CSV).
3. (Tùy chọn) **Thêm nhạc nền**: bỏ file `assets/music.mp3` vào. Không có thì video không tiếng.
4. Vào tab **Actions** trên repo → chọn **Render thiệp video Hội Khóa** → bấm **Run workflow**.
5. Chạy xong, tải gói **thiep-video-mp4** ở mục Artifacts — chứa toàn bộ file MP4.

## Tùy chỉnh (mở `render.mjs`, phần CẤU HÌNH ở đầu)

- `DUR` — số giây mỗi slide (mặc định 3).
- `XF` — thời gian chuyển cảnh (mặc định 0.6).
- `SEQUENCE` — thứ tự slide. Muốn video **ngắn gọn** thì rút bớt, ví dụ chỉ giữ:
  ```
  { bg: 'assets/1-phongbi.jpg' },
  { name: true },                  // slide thư mời cá nhân
  { bg: 'assets/6-nhovenha.jpg' },
  ```
  → video ~7 giây thay vì 15 giây.

## Lưu ý

- Vị trí tên nằm trên slide phong bì (`assets/1-phongbi.jpg`), thay dòng "Gửi: bạn thân mến". Nếu thay ảnh nền khác,
  cần chỉnh tọa độ khối tên trong `template.html` (phần `#namebox`).
- Video xuất ra là **MP4 H.264 / yuv420p 1920×1080** — mở được trên mọi điện thoại và đăng Facebook trực tiếp.
- Mỗi video ~4–5 MB. 500 người ≈ 2 GB; nếu artifact quá nặng, chia danh sách thành nhiều đợt.

## Hiệu ứng & thời gian render

- Phong bì có hiệu ứng chữ chạy: tên và lớp hiện dần (fade-in) trong ~2 giây đầu, "Mến Gửi Bạn" giữ nguyên.
- Chuyển cảnh đa dạng giữa các slide: trượt ngang và trượt lên xen kẽ (slideleft, smoothup).
- Thời gian render trên GitHub Actions khoảng 10–15 giây/người. ~500 người ≈ 1,5–2 giờ (trong giới hạn 6 giờ mỗi lần chạy).
- Nếu khóa rất đông (trên ~800 người), chia `danhsach.csv` thành 2–3 đợt và chạy lần lượt cho an toàn.
