---
description: Instructions on how to run the PUDoCS Web and Mobile applications.
---

# Running PUDoCS

The PUDoCS project is split into two main applications: a **Web Portal** and a **Mobile App**.

## Prerequisites

Ensure you have **Node.js** installed on your system.

---

## 1. Web Portal (React + Vite)

To run the web application:

1. **Navigate to the web directory**:

    ```powershell
    cd web
    ```

2. **Install dependencies** (if not already done):

    ```powershell
    npm install
    ```

3. **Start the development server**:

    ```powershell
    npm run dev
    ```

4. **Access the app**: Open the URL provided in the terminal (usually `http://localhost:5173`).

---

## 2. Mobile App (Expo)

To run the mobile application:

1. **Navigate to the mobile directory**:

    ```powershell
    cd mobile
    ```

2. **Install dependencies** (if not already done):

    ```powershell
    npm install
    ```

3. **Start the Expo server**:

    ```powershell
    npx expo start
    ```

4. **Run on a device/emulator**:
    * Press **`a`** for Android Emulator.
    * Press **`i`** for iOS Simulator.
    * Scan the QR code using the **Expo Go** app on your physical device.

---

## Troubleshooting

* **Firebase Config**: If you encounter authentication errors, ensure the `.env` or Firebase configuration files in both modules are correctly set up with your project keys.
* **Port Conflicts**: If port `5173` or `8081` is in use, the servers will automatically try the next available port.
