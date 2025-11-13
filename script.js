// Variabel Global
let currentUser = null;
let currentPage = 'landingPage';
let currentProduct = null;
let editingUserId = null;
let editingProductId = null;
let firebaseInitialized = false;

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Dimuat - Memulai inisialisasi');
    
    initializeApp();
    
    // Buat semua fungsi dapat diakses global untuk onclick handlers
    window.showPage = showPage;
    window.switchTab = switchTab;
    window.showDashboardSection = showDashboardSection;
    window.handleLogin = handleLogin;
    window.handleRegister = handleRegister;
    window.logout = logout;
    window.showForgotPassword = showForgotPassword;
    window.handleForgotPassword = handleForgotPassword;
    window.shareProduct = shareProduct;
    window.copyProductLink = copyProductLink;
    window.loadMoreProducts = loadMoreProducts;
    window.showUpgradeModal = showUpgradeModal;
    window.confirmUpgrade = confirmUpgrade;
    window.showWithdrawForm = showWithdrawForm;
    window.handleWithdraw = handleWithdraw;
    window.showAdminAccess = showAdminAccess;
    window.handleAdminAccess = handleAdminAccess;
    window.closeAdminDashboard = closeAdminDashboard;
    window.showAdminTab = showAdminTab;
    window.editUser = editUser;
    window.deleteUser = deleteUser;
    window.handleEditUser = handleEditUser;
    window.showAddProductForm = showAddProductForm;
    window.editProduct = editProduct;
    window.deleteProduct = deleteProduct;
    window.handleProductForm = handleProductForm;
    window.loadSettings = loadSettings;
    window.saveBankInfo = saveBankInfo;
    window.saveAdminContact = saveAdminContact;
    window.exportUsers = exportUsers;
    window.filterProducts = filterProducts;
    window.closeModal = closeModal;
    
    console.log('Semua fungsi terdaftar secara global');
});

async function initializeApp() {
    // Tunggu Firebase initialization
    if (window.firebaseService) {
        await window.firebaseService.initialize();
        firebaseInitialized = window.firebaseService.isInitialized();
        console.log('Firebase initialized:', firebaseInitialized);
        
        // Update status indicator
        updateFirebaseStatus(firebaseInitialized);
        
        // Setup real-time sync
        if (firebaseInitialized) {
            setupRealtimeSync();
        }
    }

    // Sembunyikan loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1000);

    // Cek sesi yang ada
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showPage('dashboardPage');
        updateDashboard();
    } else {
        showPage('landingPage');
    }

    // Inisialisasi data jika belum ada
    initializeData();
    
    // Generate testimonials
    generateTestimonials();
    
    // Generate notifications
    generateNotifications();
    
    // Setup auto-refresh untuk update real-time
    setInterval(checkForUpdates, 5000);
}

// Setup Real-time Sync
function setupRealtimeSync() {
    if (!window.firebaseService) return;

    // Sync users
    window.firebaseService.syncUsers((users) => {
        console.log('Users synced from Firebase:', users);
        // Update admin table jika sedang di halaman admin
        if (currentPage === 'adminDashboard') {
            loadUsers();
        }
    });

    // Sync products
    window.firebaseService.syncProducts((products) => {
        console.log('Products synced from Firebase:', products);
        // Update product grid jika sedang di halaman dashboard
        if (currentPage === 'dashboardPage') {
            loadProducts();
        }
    });

    // Sync settings
    window.firebaseService.syncSettings((settings) => {
        console.log('Settings synced from Firebase:', settings);
        // Update dashboard jika settings berubah
        if (currentPage === 'dashboardPage') {
            updateDashboard();
        }
    });
}

// Update Firebase Status Indicator
function updateFirebaseStatus(connected) {
    const statusElement = document.getElementById('firebaseStatus');
    const statusText = document.getElementById('firebaseStatusText');
    
    if (statusElement && statusText) {
        if (connected) {
            statusElement.className = 'firebase-status connected';
            statusText.textContent = 'Connected';
        } else {
            statusElement.className = 'firebase-status disconnected';
            statusText.textContent = 'Offline';
        }
    }
}

// Manajemen Data
function initializeData() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                phone: '08123456789',
                password: 'admin123',
                membership: 'Mytic',
                clicks: 1250,
                orders: 89,
                balance: 15000000,
                linksShared: 234
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        
        // Sync ke Firebase jika tersedia
        if (window.firebaseService && firebaseInitialized) {
            window.firebaseService.updateUsers(defaultUsers);
        }
    }

    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            {
                id: 1,
                name: 'Smartphone Android Pro',
                price: 5000000,
                commission: 10,
                url: 'https://example.com/phone1',
                image: 'https://picsum.photos/seed/android-smartphone-pro/300/200.jpg'
            },
            {
                id: 2,
                name: 'Laptop Gaming Ultra',
                price: 15000000,
                commission: 15,
                url: 'https://example.com/laptop1',
                image: 'https://picsum.photos/seed/gaming-laptop-ultra/300/200.jpg'
            },
            {
                id: 3,
                name: 'Smartwatch Premium',
                price: 3000000,
                commission: 12,
                url: 'https://example.com/watch1',
                image: 'https://picsum.photos/seed/premium-smartwatch/300/200.jpg'
            },
            {
                id: 4,
                name: 'Headphone Wireless Pro',
                price: 1500000,
                commission: 8,
                url: 'https://example.com/headphone1',
                image: 'https://picsum.photos/seed/wireless-headphone-pro/300/200.jpg'
            },
            {
                id: 5,
                name: 'Tablet Pro 12inch',
                price: 8000000,
                commission: 10,
                url: 'https://example.com/tablet1',
                image: 'https://picsum.photos/seed/pro-tablet-12inch/300/200.jpg'
            },
            {
                id: 6,
                name: 'Camera Mirrorless',
                price: 12000000,
                commission: 12,
                url: 'https://example.com/camera1',
                image: 'https://picsum.photos/seed/mirrorless-camera-pro/300/200.jpg'
            },
            {
                id: 7,
                name: 'Gaming Console',
                price: 6000000,
                commission: 10,
                url: 'https://example.com/console1',
                image: 'https://picsum.photos/seed/gaming-console-new/300/200.jpg'
            },
            {
                id: 8,
                name: 'Smart TV 55inch',
                price: 10000000,
                commission: 8,
                url: 'https://example.com/tv1',
                image: 'https://picsum.photos/seed/smart-tv-55inch/300/200.jpg'
            },
            {
                id: 9,
                name: 'Drone 4K Camera',
                price: 7000000,
                commission: 15,
                url: 'https://example.com/drone1',
                image: 'https://picsum.photos/seed/4k-camera-drone/300/200.jpg'
            },
            {
                id: 10,
                name: 'Power Bank 20000mAh',
                price: 500000,
                commission: 5,
                url: 'https://example.com/powerbank1',
                image: 'https://picsum.photos/seed/powerbank-20000mah/300/200.jpg'
            },
            {
                id: 11,
                name: 'Bluetooth Speaker',
                price: 800000,
                commission: 6,
                url: 'https://example.com/speaker1',
                image: 'https://picsum.photos/seed/bluetooth-speaker-premium/300/200.jpg'
            },
            {
                id: 12,
                name: 'Fitness Tracker',
                price: 1200000,
                commission: 8,
                url: 'https://example.com/fitness1',
                image: 'https://picsum.photos/seed/fitness-tracker-pro/300/200.jpg'
            },
            {
                id: 13,
                name: 'USB-C Hub Pro',
                price: 600000,
                commission: 5,
                url: 'https://example.com/hub1',
                image: 'https://picsum.photos/seed/usb-c-hub-pro/300/200.jpg'
            },
            {
                id: 14,
                name: 'Wireless Mouse',
                price: 300000,
                commission: 4,
                url: 'https://example.com/mouse1',
                image: 'https://picsum.photos/seed/wireless-mouse-ergonomic/300/200.jpg'
            },
            {
                id: 15,
                name: 'Mechanical Keyboard',
                price: 1500000,
                commission: 10,
                url: 'https://example.com/keyboard1',
                image: 'https://picsum.photos/seed/mechanical-keyboard-rgb/300/200.jpg'
            },
            {
                id: 16,
                name: 'Monitor 4K 27inch',
                price: 9000000,
                commission: 8,
                url: 'https://example.com/monitor1',
                image: 'https://picsum.photos/seed/4k-monitor-27inch/300/200.jpg'
            },
            {
                id: 17,
                name: 'Webcam HD Pro',
                price: 1200000,
                commission: 6,
                url: 'https://example.com/webcam1',
                image: 'https://picsum.photos/seed/hd-webcam-pro/300/200.jpg'
            },
            {
                id: 18,
                name: 'Microphone USB',
                price: 800000,
                commission: 5,
                url: 'https://example.com/mic1',
                image: 'https://picsum.photos/seed/usb-microphone-studio/300/200.jpg'
            },
            {
                id: 19,
                name: 'Router WiFi 6',
                price: 1500000,
                commission: 7,
                url: 'https://example.com/router1',
                image: 'https://picsum.photos/seed/wifi6-router-gigabit/300/200.jpg'
            },
            {
                id: 20,
                name: 'External SSD 1TB',
                price: 2000000,
                commission: 8,
                url: 'https://example.com/ssd1',
                image: 'https://picsum.photos/seed/external-ssd-1tb/300/200.jpg'
            }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
        
        // Sync ke Firebase jika tersedia
        if (window.firebaseService && firebaseInitialized) {
            window.firebaseService.updateProducts(defaultProducts);
        }
    }

    if (!localStorage.getItem('settings')) {
        const defaultSettings = {
            bankInfo: {
                bankName: 'BCA',
                accountNumber: '1234567890',
                adminName: 'Admin AffiliatePro'
            },
            membershipPrices: {
                Warrior: 0,
                Master: 500000,
                Grandmaster: 1500000,
                Epic: 3000000,
                Legend: 5000000,
                Mytic: 10000000
            },
            membershipCommissions: {
                Warrior: 5,
                Master: 8,
                Grandmaster: 12,
                Epic: 15,
                Legend: 18,
                Mytic: 25
            },
            adminContact: 'https://wa.me/628123456789',
            withdrawEnabled: true
        };
        localStorage.setItem('settings', JSON.stringify(defaultSettings));
        
        // Sync ke Firebase jika tersedia
        if (window.firebaseService && firebaseInitialized) {
            window.firebaseService.updateSettings(defaultSettings);
        }
    }
}

// Navigasi Halaman
function showPage(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    document.getElementById(pageId).classList.add('active');
    currentPage = pageId;

    // Inisialisasi spesifik halaman
    if (pageId === 'dashboardPage') {
        updateDashboard();
        loadProducts();
        loadMembership();
    } else if (pageId === 'adminDashboard') {
        loadAdminData();
    }
}

// Switch Tab (Auth)
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => btn.classList.remove('active'));

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabBtns[0].classList.add('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        tabBtns[1].classList.add('active');
    }
}

// Switch Section Dashboard
function showDashboardSection(section) {
    const sections = document.querySelectorAll('.dashboard-section');
    const navBtns = document.querySelectorAll('.nav-btn');

    sections.forEach(s => s.classList.remove('active'));
    navBtns.forEach(btn => btn.classList.remove('active'));

    if (section === 'overview') {
        document.getElementById('overviewSection').classList.add('active');
        navBtns[0].classList.add('active');
    } else if (section === 'products') {
        document.getElementById('productsSection').classList.add('active');
        navBtns[1].classList.add('active');
        loadProducts();
    } else if (section === 'membership') {
        document.getElementById('membershipSection').classList.add('active');
        navBtns[2].classList.add('active');
        loadMembership();
    }
}

// Autentikasi
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (user) {
        // Login berhasil meskipun password salah (sesuai permintaan)
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showPage('dashboardPage');
        showMessage('Login berhasil!', 'success');
    } else {
        showMessage('Email tidak ditemukan!', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showMessage('Password tidak cocok!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.email === email)) {
        showMessage('Email sudah terdaftar!', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username,
        email,
        phone,
        password,
        membership: 'Warrior',
        clicks: 0,
        orders: 0,
        balance: 0,
        linksShared: 0
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Sync ke Firebase
    if (window.firebaseService && firebaseInitialized) {
        window.firebaseService.updateUsers(users);
    }
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showPage('dashboardPage');
    showMessage('Registrasi berhasil!', 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showPage('landingPage');
    showMessage('Anda telah logout', 'success');
}

// Lupa Password
function showForgotPassword() {
    document.getElementById('forgotPasswordModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmPassword) {
        showMessage('Password tidak cocok!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Sync ke Firebase
        if (window.firebaseService && firebaseInitialized) {
            window.firebaseService.updateUsers(users);
        }
        
        showMessage('Password berhasil direset!', 'success');
        closeModal();
    } else {
        showMessage('Email tidak ditemukan!', 'error');
    }
}

// Fungsi Dashboard
function updateDashboard() {
    if (!currentUser) return;
    
    document.getElementById('userDisplayName').textContent = currentUser.username;
    document.getElementById('userMembership').textContent = currentUser.membership;
    document.getElementById('clickCount').textContent = currentUser.clicks || 0;
    document.getElementById('orderCount').textContent = currentUser.orders || 0;
    document.getElementById('balance').textContent = formatCurrency(currentUser.balance || 0);
    document.getElementById('linksShared').textContent = currentUser.linksShared || 0;
    
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const commissionRate = settings.membershipCommissions?.[currentUser.membership] || 5;
    document.getElementById('commissionRate').textContent = commissionRate + '%';
}

// Produk
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const userCommission = settings.membershipCommissions?.[currentUser.membership] || 5;
    
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    products.slice(0, 10).forEach(product => {
        const isLocked = product.commission > userCommission;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://picsum.photos/seed/product-placeholder/300/200.jpg'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">Harga: ${formatCurrency(product.price)}</p>
                <p class="product-commission">Komisi: ${product.commission}%</p>
                <div class="product-actions">
                    ${isLocked ? 
                        `<button class="locked" onclick="showUpgradeModal()">
                            <i class="fas fa-lock"></i> Upgrade
                        </button>` :
                        `<button class="unlocked" onclick="shareProduct(${product.id})">
                            <i class="fas fa-share"></i> Share
                        </button>`
                    }
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

function loadMoreProducts() {
    showMessage('Upgrade membership untuk melihat lebih banyak produk!', 'error');
}

function shareProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        currentProduct = product;
        document.getElementById('productModalTitle').textContent = product.name;
        document.getElementById('productModalImage').src = product.image;
        document.getElementById('productModalName').textContent = product.name;
        document.getElementById('productModalPrice').textContent = formatCurrency(product.price);
        document.getElementById('productModalCommission').textContent = product.commission + '%';
        
        document.getElementById('productModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
        
        // Update links shared count
        currentUser.linksShared = (currentUser.linksShared || 0) + 1;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Sync ke Firebase
        if (window.firebaseService && firebaseInitialized) {
            window.firebaseService.updateUser(currentUser.id, { linksShared: currentUser.linksShared });
        }
        
        updateDashboard();
    }
}

function copyProductLink() {
    if (currentProduct) {
        const affiliateLink = `${currentProduct.url}?ref=${currentUser.id}`;
        navigator.clipboard.writeText(affiliateLink).then(() => {
            showMessage('Link berhasil disalin!', 'success');
        });
    }
}

// Membership
function loadMembership() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const membershipGrid = document.getElementById('membershipGrid');
    membershipGrid.innerHTML = '';
    
    const levels = ['Warrior', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mytic'];
    
    levels.forEach(level => {
        const isCurrentLevel = currentUser.membership === level;
        const price = settings.membershipPrices?.[level] || 0;
        const commission = settings.membershipCommissions?.[level] || 0;
        
        const card = document.createElement('div');
        card.className = `membership-card ${isCurrentLevel ? 'current' : ''}`;
        card.innerHTML = `
            <div class="membership-level">${level}</div>
            <div class="membership-commission">Komisi: ${commission}%</div>
            <div class="membership-price">Harga: ${price === 0 ? 'Gratis' : formatCurrency(price)}</div>
            ${!isCurrentLevel ? 
                `<button class="btn btn-primary btn-full" onclick="showUpgradeModal('${level}')">
                    Upgrade ke ${level}
                </button>` : ''
            }
        `;
        membershipGrid.appendChild(card);
    });
}

function showUpgradeModal(level = null) {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const bankInfo = settings.bankInfo || {};
    
    document.getElementById('upgradeBankInfo').innerHTML = `
        <p><strong>Bank:</strong> ${bankInfo.bankName || 'BCA'}</p>
        <p><strong>Rekening:</strong> ${bankInfo.accountNumber || '1234567890'}</p>
        <p><strong>Atas Nama:</strong> ${bankInfo.adminName || 'Admin AffiliatePro'}</p>
    `;
    
    document.getElementById('upgradeWhatsAppBtn').onclick = () => {
        window.open(settings.adminContact || 'https://wa.me/628123456789', '_blank');
    };
    
    document.getElementById('upgradeModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function confirmUpgrade() {
    showMessage('Silakan transfer dan hubungi admin untuk konfirmasi!', 'success');
    closeModal();
}

// Withdraw
function showWithdrawForm() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    if (!settings.withdrawEnabled) {
        showMessage('Penarikan sedang dinonaktifkan!', 'error');
        return;
    }
    
    if (currentUser.balance < 50000) {
        showMessage('Minimal penarikan Rp 50.000!', 'error');
        return;
    }
    
    if (currentUser.membership === 'Warrior') {
        showMessage('Upgrade membership untuk bisa melakukan penarikan!', 'error');
        return;
    }
    
    document.getElementById('withdrawModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function handleWithdraw(event) {
    event.preventDefault();
    
    const name = document.getElementById('withdrawName').value;
    const account = document.getElementById('withdrawAccount').value;
    const bank = document.getElementById('withdrawBank').value;
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    
    if (amount > currentUser.balance) {
        showMessage('Saldo tidak mencukupi!', 'error');
        return;
    }
    
    // TIDAK memotong saldo user - hanya menampilkan notifikasi
    showMessage(`Permintaan penarikan sebesar ${formatCurrency(amount)} telah diterima! Silakan upgrade membership untuk memproses penarikan.`, 'success');
    
    // Tampilkan modal upgrade membership
    setTimeout(() => {
        closeModal();
        showUpgradeModal();
    }, 2000);
}

// Fungsi Admin
function showAdminAccess() {
    document.getElementById('adminAccessModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function handleAdminAccess(event) {
    event.preventDefault();
    
    const code = document.getElementById('adminCode').value;
    
    if (code === '521389') {
        showPage('adminDashboard');
        closeModal();
    } else {
        showMessage('Kode akses salah!', 'error');
    }
}

function closeAdminDashboard() {
    showPage('dashboardPage');
}

function showAdminTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'users') {
        document.getElementById('usersTab').classList.add('active');
        tabBtns[0].classList.add('active');
        loadUsers();
    } else if (tab === 'products') {
        document.getElementById('productsTab').classList.add('active');
        tabBtns[1].classList.add('active');
        loadAdminProducts();
    } else if (tab === 'settings') {
        document.getElementById('settingsTab').classList.add('active');
        tabBtns[2].classList.add('active');
        loadSettings();
    }
}

function loadAdminData() {
    loadUsers();
    loadAdminProducts();
    loadSettings();
}

function loadUsers() {
    console.log('=== FUNGSI LOAD USERS DIPANGGIL ===');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('Users dari localStorage:', users);
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) {
        console.log('ERROR: usersTableBody tidak ditemukan!');
        return;
    }
    
    tbody.innerHTML = '';
    console.log('Tabel dibersihkan, menambahkan users...');
    
    users.forEach((user, index) => {
        console.log(`Menambahkan user ${index + 1}:`, user);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.membership}</td>
            <td>${user.clicks || 0}</td>
            <td>${user.orders || 0}</td>
            <td>${formatCurrency(user.balance || 0)}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('=== FUNGSI LOAD USERS SELESAI ===');
}

function editUser(userId) {
    console.log('=== FUNGSI EDIT USER DIPANGGIL ===');
    console.log('editUser dipanggil dengan userId:', userId);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (user) {
        console.log('User ditemukan:', user);
        editingUserId = userId;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserPhone').value = user.phone;
        document.getElementById('editUserMembership').value = user.membership;
        document.getElementById('editUserClicks').value = user.clicks || 0;
        document.getElementById('editUserOrders').value = user.orders || 0;
        document.getElementById('editUserBalance').value = user.balance || 0;
        
        const modal = document.getElementById('editUserModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            console.log('Membuka modal edit user');
            modal.classList.add('active');
            overlay.classList.add('active');
        } else {
            console.log('ERROR: Modal atau overlay tidak ditemukan');
        }
    } else {
        console.log('User tidak ditemukan dengan ID:', userId);
    }
    console.log('=== FUNGSI EDIT USER SELESAI ===');
}

function handleEditUser(event) {
    event.preventDefault();
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === editingUserId);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            email: document.getElementById('editUserEmail').value,
            phone: document.getElementById('editUserPhone').value,
            membership: document.getElementById('editUserMembership').value,
            clicks: parseInt(document.getElementById('editUserClicks').value),
            orders: parseInt(document.getElementById('editUserOrders').value),
            balance: parseInt(document.getElementById('editUserBalance').value)
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Sync ke Firebase
        if (window.firebaseService && firebaseInitialized) {
            window.firebaseService.updateUsers(users);
        }
        
        // Update current user jika mengedit diri sendiri
        if (currentUser && currentUser.id === editingUserId) {
            currentUser = users[userIndex];
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateDashboard();
        }
        
        loadUsers();
        showMessage('User berhasil diperbarui!', 'success');
        closeModal();
    }
}

function deleteUser(userId) {
    console.log('=== FUNGSI DELETE USER DIPANGGIL ===');
    console.log('deleteUser dipanggil dengan userId:', userId);
    
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
        console.log('User mengkonfirmasi penghapusan');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        // Sync ke Firebase
        if (window.firebaseService && firebaseInitialized) {
            window.firebaseService.updateUsers(filteredUsers);
        }
        
        console.log('User dihapus, memuat ulang tabel...');
        loadUsers();
        showMessage('User berhasil dihapus!', 'success');
    } else {
        console.log('User membatalkan penghapusan');
    }
    console.log('=== FUNGSI DELETE USER SELESAI ===');
}

function loadAdminProducts() {
    console.log('loadAdminProducts dipanggil');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.commission}%</td>
            <td>${product.url}</td>
            <td>${product.image}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddProductForm() {
    editingProductId = null;
    document.getElementById('productFormTitle').textContent = 'Tambah Produk';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCommission').value = '';
    document.getElementById('productUrl').value = '';
    document.getElementById('productImageUrl').value = '';
    
    document.getElementById('productFormModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        editingProductId = productId;
        document.getElementById('productFormTitle').textContent = 'Edit Produk';
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCommission').value = product.commission;
        document.getElementById('productUrl').value = product.url;
        document.getElementById('productImageUrl').value = product.image;
        
        document.getElementById('productFormModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    }
}

function deleteProduct(productId) {
    console.log('=== FUNGSI DELETE PRODUCT DIPANGGIL ===');
    console.log('deleteProduct dipanggil dengan productId:', productId);
    
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        console.log('User mengkonfirmasi penghapusan produk');
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const filteredProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(filteredProducts));
        
        // Sync ke Firebase
        if (window.firebaseService && firebaseInitialized) {
            window.firebaseService.updateProducts(filteredProducts);
        }
        
        console.log('Produk dihapus, memuat ulang tabel...');
        loadAdminProducts();
        showMessage('Produk berhasil dihapus!', 'success');
    } else {
        console.log('User membatalkan penghapusan produk');
    }
    console.log('=== FUNGSI DELETE PRODUCT SELESAI ===');
}

function handleProductForm(event) {
    event.preventDefault();
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const productData = {
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        commission: parseInt(document.getElementById('productCommission').value),
        url: document.getElementById('productUrl').value,
        image: document.getElementById('productImageUrl').value
    };
    
    if (editingProductId) {
        // Edit produk yang ada
        const productIndex = products.findIndex(p => p.id === editingProductId);
        if (productIndex !== -1) {
            products[productIndex] = { ...products[productIndex], ...productData };
        }
    } else {
        // Tambah produk baru
        productData.id = Date.now();
        products.push(productData);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    // Sync ke Firebase
    if (window.firebaseService && firebaseInitialized) {
        window.firebaseService.updateProducts(products);
    }
    
    loadAdminProducts();
    loadProducts(); // Refresh produk user
    showMessage('Produk berhasil disimpan!', 'success');
    closeModal();
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    // Load info bank
    document.getElementById('bankName').value = settings.bankInfo?.bankName || '';
    document.getElementById('bankAccount').value = settings.bankInfo?.accountNumber || '';
    document.getElementById('adminName').value = settings.bankInfo?.adminName || '';
    
    // Load pengaturan membership
    const membershipSettings = document.getElementById('membershipSettings');
    membershipSettings.innerHTML = '';
    
    const levels = ['Warrior', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mytic'];
    levels.forEach(level => {
        const price = settings.membershipPrices?.[level] || 0;
        const commission = settings.membershipCommissions?.[level] || 0;
        
        const settingItem = document.createElement('div');
        settingItem.className = 'membership-setting-item';
        settingItem.innerHTML = `
            <label>${level}</label>
            <input type="number" id="price_${level}" placeholder="Harga" value="${price}">
            <input type="number" id="commission_${level}" placeholder="Komisi %" value="${commission}">
        `;
        membershipSettings.appendChild(settingItem);
    });
    
    // Load kontak admin
    document.getElementById('adminContact').value = settings.adminContact || '';
    
    // Load kontrol withdraw
    document.getElementById('withdrawEnabled').checked = settings.withdrawEnabled || false;
    
    // Update tombol WhatsApp
    document.getElementById('whatsappBtn').href = settings.adminContact || 'https://wa.me/628123456789';
}

function saveBankInfo(event) {
    event.preventDefault();
    
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    settings.bankInfo = {
        bankName: document.getElementById('bankName').value,
        accountNumber: document.getElementById('bankAccount').value,
        adminName: document.getElementById('adminName').value
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Sync ke Firebase
    if (window.firebaseService && firebaseInitialized) {
        window.firebaseService.updateSettings(settings);
    }
    
    showMessage('Info rekening berhasil disimpan!', 'success');
}

function saveAdminContact(event) {
    event.preventDefault();
    
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    settings.adminContact = document.getElementById('adminContact').value;
    
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Sync ke Firebase
    if (window.firebaseService && firebaseInitialized) {
        window.firebaseService.updateSettings(settings);
    }
    
    document.getElementById('whatsappBtn').href = settings.adminContact;
    showMessage('Kontak admin berhasil disimpan!', 'success');
}

// Simpan pengaturan membership
document.addEventListener('DOMContentLoaded', function() {
    const membershipSettings = document.getElementById('membershipSettings');
    if (membershipSettings) {
        membershipSettings.addEventListener('change', function() {
            const settings = JSON.parse(localStorage.getItem('settings')) || {};
            settings.membershipPrices = {};
            settings.membershipCommissions = {};
            
            const levels = ['Warrior', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mytic'];
            levels.forEach(level => {
                const priceInput = document.getElementById(`price_${level}`);
                const commissionInput = document.getElementById(`commission_${level}`);
                
                if (priceInput) {
                    settings.membershipPrices[level] = parseInt(priceInput.value) || 0;
                }
                if (commissionInput) {
                    settings.membershipCommissions[level] = parseInt(commissionInput.value) || 0;
                }
            });
            
            localStorage.setItem('settings', JSON.stringify(settings));
            
            // Sync ke Firebase
            if (window.firebaseService && firebaseInitialized) {
                window.firebaseService.updateSettings(settings);
            }
            
            showMessage('Pengaturan membership berhasil disimpan!', 'success');
        });
    }
    
    // Kontrol withdraw
    const withdrawEnabled = document.getElementById('withdrawEnabled');
    if (withdrawEnabled) {
        withdrawEnabled.addEventListener('change', function() {
            const settings = JSON.parse(localStorage.getItem('settings')) || {};
            settings.withdrawEnabled = this.checked;
            localStorage.setItem('settings', JSON.stringify(settings));
            
            // Sync ke Firebase
            if (window.firebaseService && firebaseInitialized) {
                window.firebaseService.updateSettings(settings);
            }
            
            showMessage('Kontrol penarikan berhasil diperbarui!', 'success');
        });
    }
});

// Testimonials
function generateTestimonials() {
    const testimonials = [
        { name: 'Budi Santoso', text: 'Sudah 3 bulan bergabung, komisi selalu tepat waktu!' },
        { name: 'Siti Nurhaliza', text: 'Mudah sekali dapat uang dari HP, recommended!' },
        { name: 'Ahmad Fauzi', text: 'Program affiliate terbaik yang pernah saya ikuti.' },
        { name: 'Dewi Lestari', text: 'Komisi besar dan produknya berkualitas.' },
        { name: 'Rudi Hermawan', text: 'Sudah withdraw 5 kali, lancar semua!' },
        { name: 'Maya Sari', text: 'Modal HP saja sudah bisa dapat penghasilan.' },
        { name: 'Doni Prasetyo', text: 'Admin responsif, komisi selalu dibayar.' },
        { name: 'Lina Wijaya', text: 'Produknya laku keras, gampang jualnya.' },
        { name: 'Hendra Kusuma', text: 'Best affiliate program 2025 memang ini!' },
        { name: 'Ratna Permata', text: 'Dari nol sekarang sudah punya penghasilan tetap.' },
        { name: 'Fajar Nugroho', text: 'Upgrade membership worth it banget!' },
        { name: 'Indah Puspita', text: 'Sistemnya transparan, komisi jelas.' },
        { name: 'Bayu Setiawan', text: 'Rekomendasi banget buat cari tambahan.' },
        { name: 'Sarah Amalia', text: 'Sudah beli motor dari komisi affiliate.' },
        { name: 'Rizki Hidayat', text: 'Program yang bagus dan terpercaya.' }
    ];
    
    const track = document.getElementById('testimonialsTrack');
    if (track) {
        track.innerHTML = '';
        
        // Generate testimonials dua kali untuk scroll yang mulus
        [...testimonials, ...testimonials].forEach((testimonial, index) => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-avatar">${testimonial.name.charAt(0)}</div>
                    <div>
                        <div class="testimonial-name">${testimonial.name}</div>
                        <div class="testimonial-rating">
                            <i class="fas fa-star" style="color: gold;"></i>
                            <i class="fas fa-star" style="color: gold;"></i>
                            <i class="fas fa-star" style="color: gold;"></i>
                            <i class="fas fa-star" style="color: gold;"></i>
                            <i class="fas fa-star" style="color: gold;"></i>
                        </div>
                    </div>
                </div>
                <div class="testimonial-text">"${testimonial.text}"</div>
            `;
            track.appendChild(card);
        });
    }
}

// Notifications
function generateNotifications() {
    const notifications = [
        '8812*****04 epic Rp 42.300.000',
        '7654*****12 legend Rp 28.500.000',
        '5432*****09 mytic Rp 15.750.000',
        '9876*****15 epic Rp 31.200.000',
        '2345*****08 grandmaster Rp 12.800.000',
        '6789*****11 master Rp 8.900.000',
        '1357*****14 legend Rp 25.600.000',
        '8642*****03 mytic Rp 18.900.000',
        '9753*****10 epic Rp 22.400.000',
        '2468*****07 grandmaster Rp 11.300.000'
    ];
    
    const scroll = document.getElementById('notificationsScroll');
    if (scroll) {
        scroll.innerHTML = '';
        
        [...notifications, ...notifications].forEach(notification => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success); margin-right: 8px;"></i> ${notification}`;
            scroll.appendChild(item);
        });
    }
}

// Update Real-time
function checkForUpdates() {
    if (currentUser && currentPage === 'dashboardPage') {
        updateDashboard();
    }
}

// Fungsi Modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modalOverlay').classList.remove('active');
}

// Fungsi Utility
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showMessage(message, type) {
    // Buat elemen pesan
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.zIndex = '3000';
    messageDiv.style.padding = '12px 24px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.fontSize = '14px';
    messageDiv.style.fontWeight = '600';
    messageDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    
    document.body.appendChild(messageDiv);
    
    // Hapus otomatis setelah 3 detik
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Fungsi Export
function exportUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const csv = convertToCSV(users);
    downloadCSV(csv, 'users.csv');
    showMessage('Data user berhasil diexport!', 'success');
}

function convertToCSV(data) {
    const headers = ['ID', 'Username', 'Email', 'Phone', 'Membership', 'Clicks', 'Orders', 'Balance'];
    const rows = data.map(user => [
        user.id,
        user.username,
        user.email,
        user.phone,
        user.membership,
        user.clicks || 0,
        user.orders || 0,
        user.balance || 0
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Filter Produk
function filterProducts(filter) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    if (filter === 'all') {
        filterBtns[0].classList.add('active');
        loadProducts();
    } else if (filter === 'available') {
        filterBtns[1].classList.add('active');
        // Load hanya produk yang tersedia untuk level user
        const settings = JSON.parse(localStorage.getItem('settings')) || {};
        const userCommission = settings.membershipCommissions?.[currentUser.membership] || 5;
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const availableProducts = products.filter(p => p.commission <= userCommission);
        
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';
        
        availableProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='https://picsum.photos/seed/product-placeholder/300/200.jpg'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">Harga: ${formatCurrency(product.price)}</p>
                    <p class="product-commission">Komisi: ${product.commission}%</p>
                    <div class="product-actions">
                        <button class="unlocked" onclick="shareProduct(${product.id})">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }
}

// Mencegah kembali ke landing page saat refresh
window.addEventListener('beforeunload', function() {
    if (currentUser) {
        localStorage.setItem('lastPage', currentPage);
    }
});

window.addEventListener('load', function() {
    const lastPage = localStorage.getItem('lastPage');
    if (lastPage && currentUser) {
        showPage(lastPage);
    }
});

// Tutup modal saat klik di luar
document.getElementById('modalOverlay').addEventListener('click', closeModal);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});