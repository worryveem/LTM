# LTM - Reactive Streams Simulation

Dự án gồm **Backend** (Spring Boot 3 / Java 17) và **Frontend** (React + Vite).

---

## Cấu trúc thư mục chuẩn (Project Structure)

```text
LTM/
├── pom.xml                                  # Cấu hình Maven Backend
├── mvnw / mvnw.cmd                          # Maven wrapper
├── src/                                     # Mã nguồn Backend (Spring Boot)
│   ├── main/
│   │   ├── java/com/LTM/LTM/
│   │   │   ├── LtmApplication.java          # File khởi chạy chính (@SpringBootApplication)
│   │   │   ├── config/WebSocketConfig.java  # Cấu hình WebSocket endpoint (/ws/stream)
│   │   │   ├── controller/                  # REST API Controller (/api/control)
│   │   │   ├── model/                       # Data models & Enums
│   │   │   ├── service/                     # StreamingSimulationService (Reactive Flux / Engine)
│   │   │   └── websocket/                   # WebSocket Handler
│   │   └── resources/
│   │       └── application.properties       # Cấu hình server port: 8080
│   └── test/                                # Unit & Integration tests
├── frontend/                                # Mã nguồn Frontend (React + Vite)
│   ├── package.json                         # Scripts & dependencies
│   ├── vite.config.js                       # Cấu hình Vite (Port 5174)
│   ├── src/                                 # UI components, animations, styles
│   └── public/
└── test-backend.cjs                         # Script Node.js test WebSocket backend
```

---

## Hướng dẫn chạy dự án

### 1. Chạy Backend (Spring Boot - Port 8080)

**Cách 1: Chạy từ IntelliJ IDEA / Eclipse**
- Mở file `src/main/java/com/LTM/LTM/LtmApplication.java`
- Bấm nút **Run** (biểu tượng ▶️ màu xanh) ở class `LtmApplication`.

**Cách 2: Chạy từ Terminal (PowerShell / CMD)**
Tại thư mục gốc dự án:
```powershell
.\mvnw.cmd spring-boot:run
```

---

### 2. Chạy Frontend (React + Vite - Port 5174)

Tại thư mục gốc dự án, mở một terminal riêng:
```powershell
cd frontend
npm install   # (chỉ cần chạy lần đầu)
npm run dev
```
Sau đó truy cập trình duyệt tại: **http://localhost:5174**

---

### 3. Kiểm tra kết nối nhanh (Backend Test Script)
Khi Backend đang chạy, bạn có thể chạy file test Node.js:
```powershell
node test-backend.cjs
```
