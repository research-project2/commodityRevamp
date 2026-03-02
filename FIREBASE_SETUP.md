# Firebase Setup Guide - Email/Password Authentication

## ✅ Sudah Dikonfigurasi Otomatis:
- ✅ Firebase SDK (`@react-native-firebase/*`) sudah ter-install di `package.json`
- ✅ `SimpleAuthContext.js` sudah menggunakan React Native Firebase
- ✅ `firebase/index.js` sudah export auth instance dengan benar
- ✅ `android/build.gradle` sudah tambah Google Services dependency
- ✅ `android/app/build.gradle` sudah apply google-services plugin

---

## 🔴 YANG MASIH PERLU DILAKUKAN - MANUAL:

### **Step 1: Buka Firebase Console**
1. Buka https://console.firebase.google.com
2. Klik **"Create Project"** (jika belum ada) atau pilih project yang sudah ada
3. Isikan nama project: `commodityRevamp` atau nama lain sesuai preferensi

### **Step 2: Setup Android App di Firebase**
1. Di Firebase Console, klik **"+ Add app"** → Pilih **Android**
2. Isikan **Android Package Name**: `com.commodityrevamp`
3. Isikan **Debug signing certificate SHA-1**:
   ```
   Jalankan command di folder project:
   cd android
   ./gradlew signingReport
   ```
   Copy nilai SHA-1 dari output (contoh: `AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12`)

4. Klik **"Register app"**
5. **DOWNLOAD `google-services.json`**
6. **COPY file ke:** `android/app/google-services.json` (di folder project ini)

### **Step 3: Setup iOS App di Firebase (Optional, tapi recommended)**
1. Di Firebase Console, klik **"+ Add app"** → Pilih **iOS**
2. Isikan **Bundle ID**: `com.commodityrevamp` (sesuaikan dengan Info.plist)
3. Klik **"Register app"**
4. **DOWNLOAD `GoogleService-Info.plist`**
5. Buka **Xcode** → `ios/commodityRevamp.xcodeproj`
6. Drag-drop file `GoogleService-Info.plist` ke project Xcode (pastikan "Copy if needed" dicentang)

### **Step 4: Enable Email/Password Authentication**
1. Buka Firebase Console → Pilih project kamu
2. Sidebar kiri → **Authentication**
3. Tab **"Sign-in method"**
4. Cari **"Email/Password"** 
5. Klik untuk expand, lalu switch **ON** tombol yang berwarna biru
6. Klik **"Save"**

---

## 🚀 Testing Autentikasi Email/Password

Setelah setup selesai:

1. **Android:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

2. **iOS:**
   ```bash
   cd ios
   pod install
   cd ..
   npm run ios
   ```

3. **Test di App:**
   - Klik **"Sign Up"**
   - Isikan: 
     - Display Name: `Test User`
     - Email: `test@example.com`
     - Password: `password123`
     - Confirm Password: `password123`
   - Klik **"Daftar"**
   - Setelah sukses, akan otomatis navigate ke Home screen
   - Klik **"Logout"** untuk kembali ke SignIn

---

## 🆘 Troubleshooting

**Error: "Firebase App named '[DEFAULT]' already exists"**
- Solusi: Delete `node_modules` dan `package-lock.json`, lalu `npm install` lagi

**Error: "Service not available"**
- Pastikan internet connection aktif
- Pastikan `google-services.json` sudah di `android/app/`

**Error: "Permission denied" pada Android build**
```bash
# Windows
cd android && gradlew.bat clean && cd ..

# Mac/Linux
cd android && ./gradlew clean && cd ..
```

---

## 📝 File yang Sudah Diupdate:

1. **src/firebase/index.js** ✅
   - Now properly imports React Native Firebase
   - Exports auth, database, storage

2. **src/context/SimpleAuthContext.js** ✅
   - Updated to use React Native Firebase auth methods
   - Email/Password validation included
   - Proper error handling for Firebase error codes

3. **android/build.gradle** ✅
   - Added Google Services classpath dependency

4. **android/app/build.gradle** ✅
   - Added google-services plugin

---

## 💡 Features yang Sudah Ready:

- ✅ Email/Password Login
- ✅ Email/Password Signup dengan validation
- ✅ Logout functionality
- ✅ Error handling & user feedback via Alert
- ✅ Loading states pada buttons
- ✅ Automatic navigation based on auth state
- ✅ User data storage (uid, email, name, photoURL)
- ✅ Protected routes (hanya bisa akses Home jika sudah login)

---

## 📱 Authenticating Users Flow:

```
SignIn Screen
   ↓ (user ketik email & password)
   ↓ (klik "Sign In")
   ↓
Firebase Authentication
   ↓ (validate di Firebase)
   ↓
AuthContext updated (isLoggedIn = true, user = userData)
   ↓
App.js listen ke AuthContext changes
   ↓
Navigation switch: AuthStack → AppStack
   ↓
Home Screen ditampilkan dengan greeting
```

---

Setelah download google-services.json dan enable Email/Password auth di Firebase Console, semuanya akan berjalan! 🎉
