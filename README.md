# Elo Scoring System & League Leaderboard

## Mô tả dự án

Dự án xây dựng hệ thống quản lý giải đấu và tính điểm Elo cho các trò chơi dạng đội nhóm (5v5), gồm backend (Node.js/Express/MongoDB) và frontend (Next.js/React). Hệ thống hỗ trợ tạo trận, ghép đội, tính toán Elo, thống kê và hiển thị bảng xếp hạng.

---

## 1. Mô hình dữ liệu (Models)

### Player (Người chơi)
- **name**: Tên người chơi (unique)
- **currentElo**: Điểm Elo hiện tại (mặc định 1000)
- **matchesPlayed, wins, losses**: Số trận, số trận thắng/thua
- **preferredPosition**: Vị trí ưa thích (Top, Jungle, Mid, ADC, Support)
- **winStreak, loseStreak**: Chuỗi thắng/thua liên tiếp
- **positionStats**: Thống kê theo từng vị trí
- **seasonStats**: Thống kê theo từng mùa giải
- **lastMatchDate, isActive**: Ngày trận gần nhất, trạng thái hoạt động

### Match (Trận đấu)
- **matchDate**: Ngày diễn ra trận
- **isRandom**: Trận ghép ngẫu nhiên hay custom
- **duration**: Thời lượng trận
- **seasonId**: Tham chiếu mùa giải
- **teams**: Hai đội (blue, red), mỗi đội gồm:
  - **players**: Danh sách người chơi (playerId, vị trí, eloBefore, eloAfter, eloChange, performanceStats, ...), các chỉ số hiệu suất (kills, deaths, assists, damage, gold, cs)
  - **averageElo**: Elo trung bình đội
  - **expectedWinRate**: Tỉ lệ thắng dự đoán
- **winnerTeamColor**: Đội thắng ('blue' hoặc 'red')

---

## 2. Cách tính Elo

- **Elo cơ bản**: Dựa trên Elo trung bình hai đội, tính tỉ lệ thắng dự đoán cho mỗi đội bằng công thức:
  ```
  expectedWinRate = 1 / (1 + 10^((eloB - eloA)/400))
  ```
- **Sau trận đấu**:  
  - Đội thắng nhận thêm điểm, đội thua bị trừ điểm.
  - Mỗi người chơi có thể được điều chỉnh thêm dựa trên các hệ số:
    - **performanceFactor**: Hệ số hiệu suất cá nhân (dựa trên KDA, chỉ số đóng góp, v.v.).
    - **positionFactor**: Hệ số vị trí (cấu hình theo từng mùa giải, ví dụ: Mid = 1.1, Support = 0.9,...).
    - **streakFactor**: Hệ số chuỗi thắng/thua (thắng liên tiếp tăng hệ số, thua liên tiếp giảm hệ số, ví dụ: 1.05 cho mỗi trận thắng liên tiếp, tối đa 1.2).
  - Công thức cập nhật Elo cho từng người chơi:
    ```
    Elo mới = Elo cũ + (K * (kết quả thực tế - expectedWinRate)) * performanceFactor * positionFactor * streakFactor
    ```
    - **K**: Hệ số mặc định (ví dụ: 32 hoặc cấu hình theo mùa giải)
    - **kết quả thực tế**: 1 nếu thắng, 0 nếu thua
    - **expectedWinRate**: Tỉ lệ thắng dự đoán của đội
    - **Các hệ số**:
      - **performanceFactor**: Tính toán dựa trên đóng góp cá nhân (ví dụ: KDA, điểm tham gia hạ gục, v.v.)
      - **positionFactor**: Lấy từ cấu hình mùa giải (season.settings.positionFactors)
      - **streakFactor**: Tăng nhẹ nếu đang có chuỗi thắng, giảm nếu chuỗi thua

- **Cập nhật**:  
  - Cập nhật Elo, số trận, thắng/thua, chuỗi thắng/thua, thống kê theo vị trí cho từng người chơi.

---

## 3. Cách tạo và ghép trận

- **Tạo trận ngẫu nhiên**:
  1. Chọn đúng 10 người chơi.
  2. Xáo trộn và cân bằng đội dựa trên Elo (snake draft).
  3. Gán vị trí cho từng người chơi (Top, Jungle, Mid, ADC, Support).
  4. Tính Elo trung bình và tỉ lệ thắng dự đoán cho mỗi đội.
  5. Lưu trận vào database, chờ cập nhật kết quả.

- **Cập nhật kết quả trận**:
  1. Nhận kết quả (đội thắng, thời lượng, hiệu suất từng người chơi).
  2. Cập nhật performanceStats, leftEarly cho từng người chơi.
  3. Tính toán Elo mới cho từng người chơi dựa trên kết quả và các hệ số.
  4. Cập nhật lại Elo, thống kê, chuỗi thắng/thua cho từng người chơi.

---

## 4. Hướng dẫn cài đặt

### Backend
```bash
cd backend
npm install
npm start
```
- Cấu hình MongoDB trong `backend/src/config/database.js`

### Frontend
```bash
cd league-leaderboard
npm install
npm run dev
```

---



