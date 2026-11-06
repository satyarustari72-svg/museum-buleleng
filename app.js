/**
 * MUSEUM BULELENG - SKRIP LOGIKA UTAMA LENGKAP
 * Mengelola 266 Koleksi Arsip Asli Terbagi Sesuai Ruangan:
 * - Halaman Depan & Samping (8 Foto)
 * - Ruang 1 A (38 Foto)
 * - Ruang 1 B (38 Foto)
 * - Ruang 2 A (44 Foto)
 * - Ruang 2 B (55 Foto)
 * - Ruang 3 (26 Foto)
 * - Ruang 4 (42 Foto)
 * - Ruang Lorong Lukisan (15 Foto)
 */

document.addEventListener('DOMContentLoaded', () => {

  // Pastikan data 266 koleksi termuat dari collections_data.js
  const museumCollections = window.museumCollections || [];
  console.log('Total artefak Museum Buleleng siap ditampilkan:', museumCollections.length);

  // =========================================================================
  // 1. LOGIKA GRID KOLEKSI, FILTER RUANGAN, PENCARIAN & PAGINASI CEPAT
  // =========================================================================
  const collectionGrid = document.getElementById('collectionGrid');
  const filterButtons = document.querySelectorAll('#categoryFilters .filter-btn');
  const collectionSearch = document.getElementById('collectionSearch');
  const collectionCountInfo = document.getElementById('collectionCountInfo');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const showAllBtn = document.getElementById('showAllBtn');
  const loadMoreWrapper = document.getElementById('loadMoreWrapper');
  
  // Banner Ruangan Aktif
  const roomActiveBanner = document.getElementById('roomActiveBanner');
  const roomBannerBadge = document.getElementById('roomBannerBadge');
  const roomBannerTitle = document.getElementById('roomBannerTitle');
  const roomBannerDesc = document.getElementById('roomBannerDesc');
  const roomBannerCount = document.getElementById('roomBannerCount');
  const btnResetRoomFilter = document.getElementById('btnResetRoomFilter');

  let currentRoomFilter = 'all';
  let searchQuery = '';
  const INITIAL_BATCH = 48; // Tampilkan 48 kartu per batch awal
  let displayedLimit = INITIAL_BATCH;
  let currentFilteredList = [];

  function updateRoomBanner() {
    if (!roomActiveBanner) return;
    if (currentRoomFilter === 'all') {
      roomActiveBanner.style.display = 'none';
    } else {
      const room = roomsData[currentRoomFilter];
      if (room) {
        roomActiveBanner.style.display = 'flex';
        if (roomBannerBadge) roomBannerBadge.textContent = room.badge;
        if (roomBannerTitle) roomBannerTitle.textContent = room.title;
        if (roomBannerDesc) roomBannerDesc.textContent = room.desc;
        const roomPhotosCount = museumCollections.filter(i => i.roomKey === currentRoomFilter).length;
        if (roomBannerCount) roomBannerCount.textContent = `${roomPhotosCount} Foto Asli Terverifikasi`;
      }
    }
  }

  function renderCollections(resetLimit = true) {
    if (!collectionGrid) return;

    // Filter berdasarkan ruangan dan pencarian
    currentFilteredList = museumCollections.filter(item => {
      const matchRoom = (currentRoomFilter === 'all') || (item.roomKey === currentRoomFilter);
      const query = searchQuery.toLowerCase();
      const matchSearch = item.name.toLowerCase().includes(query) ||
                          item.summary.toLowerCase().includes(query) ||
                          item.roomLabel.toLowerCase().includes(query) ||
                          item.categoryName.toLowerCase().includes(query) ||
                          item.era.toLowerCase().includes(query) ||
                          item.material.toLowerCase().includes(query);
      return matchRoom && matchSearch;
    });

    // Ketika filter ruangan tertentu dipilih, tampilkan SELURUH foto ruangan tersebut langsung!
    if (currentRoomFilter !== 'all') {
      displayedLimit = currentFilteredList.length;
    } else if (resetLimit) {
      displayedLimit = INITIAL_BATCH;
    }

    // Perbarui Banner Ruangan
    updateRoomBanner();

    // Perbarui teks jumlah hasil
    if (collectionCountInfo) {
      if (currentRoomFilter === 'all') {
        collectionCountInfo.innerHTML = `Menampilkan <strong>${Math.min(displayedLimit, currentFilteredList.length)}</strong> dari total <strong>${currentFilteredList.length}</strong> foto arsip asli Museum Buleleng`;
      } else {
        const roomName = roomsData[currentRoomFilter] ? roomsData[currentRoomFilter].badge : 'Ruangan Terpilih';
        collectionCountInfo.innerHTML = `Menampilkan seluruh <strong>${currentFilteredList.length}</strong> foto arsip asli di <strong>${roomName}</strong>`;
      }
    }

    if (currentFilteredList.length === 0) {
      collectionGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #FFFCF6; border: 1px solid #E6DCBF; border-radius: 8px;">
          <p style="font-size: 2.5rem; margin-bottom: 10px;">🔍</p>
          <h4 style="margin-bottom: 6px; font-size: 1.25rem;">Tidak Ada Koleksi yang Cocok</h4>
          <p style="font-size: 0.92rem; color: #5A4032;">Silakan coba kata kunci lain atau pilih tab ruangan lainnya di atas.</p>
        </div>
      `;
      if (loadMoreWrapper) loadMoreWrapper.style.display = 'none';
      return;
    }

    // Ambil sejumlah displayedLimit
    const sliceData = currentFilteredList.slice(0, displayedLimit);

    collectionGrid.innerHTML = sliceData.map((item, idx) => `
      <div class="item-card" data-id="${item.id}" data-index="${idx}">
        <div class="item-img-frame" role="button" tabindex="0" title="Klik untuk melihat foto lebih besar">
          <span class="item-cat-tag">${item.categoryName}</span>
          <img src="${item.image}" alt="${item.name}" class="item-actual-img" loading="lazy">
          <div class="item-img-zoom-overlay">
            <span class="zoom-icon">🔍</span>
            <span>Perbesar Foto</span>
          </div>
        </div>
        <div class="item-body">
          <span class="item-room-tag">📍 ${item.roomLabel}</span>
          <h3 class="item-title">${item.name}</h3>
          <p class="item-summary">${item.summary}</p>
          <div class="item-foot">
            <span class="item-id">${item.regNumber}</span>
            <button class="btn-text btn-open-modal" data-id="${item.id}" title="Lihat detail lengkap foto ini">
              Lihat Detail ➔
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Pengaturan tombol muat lebih banyak
    if (loadMoreWrapper) {
      if (currentRoomFilter === 'all' && displayedLimit < currentFilteredList.length) {
        loadMoreWrapper.style.display = 'flex';
        const remaining = currentFilteredList.length - displayedLimit;
        if (loadMoreBtn) {
          loadMoreBtn.textContent = `Muat Koleksi Berikutnya (+${Math.min(INITIAL_BATCH, remaining)} Foto)`;
        }
      } else {
        loadMoreWrapper.style.display = 'none';
      }
    }

    // Pasang listener klik foto & tombol detail
    document.querySelectorAll('.item-img-frame').forEach(frame => {
      frame.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.item-card');
        const id = parseInt(card.getAttribute('data-id'));
        openDetailModal(id);
      });
      frame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const card = e.currentTarget.closest('.item-card');
          const id = parseInt(card.getAttribute('data-id'));
          openDetailModal(id);
        }
      });
    });

    document.querySelectorAll('.btn-open-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        openDetailModal(id);
      });
    });
  }

  // Event Tombol Muat Lebih Banyak (+48)
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      displayedLimit += INITIAL_BATCH;
      renderCollections(false);
    });
  }

  // Event Tombol Tampilkan Seluruh 266 Koleksi Sekaligus
  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      displayedLimit = currentFilteredList.length;
      renderCollections(false);
    });
  }

  // Event Reset Filter Ruangan di Banner
  if (btnResetRoomFilter) {
    btnResetRoomFilter.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      const allBtn = document.querySelector('#categoryFilters .filter-btn[data-filter="all"]');
      if (allBtn) allBtn.classList.add('active');
      currentRoomFilter = 'all';
      renderCollections(true);
    });
  }

  // Filter Buttons Click
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoomFilter = btn.getAttribute('data-filter');
      renderCollections(true);
    });
  });

  // Search Input
  if (collectionSearch) {
    collectionSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderCollections(true);
    });
  }

  renderCollections(true);

  // =========================================================================
  // 2. MODAL LIGHTBOX DETAIL & PEMBESAR FOTO ARTEFAK
  // =========================================================================
  const detailModal = document.getElementById('detailModal');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalImgHolder = document.getElementById('modalImgHolder');
  const modalCounter = document.getElementById('modalCounter');
  const modalVerifyTag = document.getElementById('modalVerifyTag');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalReg = document.getElementById('modalReg');
  const modalEra = document.getElementById('modalEra');
  const modalMaterial = document.getElementById('modalMaterial');
  const modalRoom = document.getElementById('modalRoom');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');
  const modalFullImgLink = document.getElementById('modalFullImgLink');

  let currentModalIndex = 0;

  function updateModalContent(index) {
    if (!currentFilteredList || currentFilteredList.length === 0) return;
    
    // Pastikan index berada dalam batas yang valid
    if (index < 0) index = currentFilteredList.length - 1;
    if (index >= currentFilteredList.length) index = 0;
    currentModalIndex = index;

    const item = currentFilteredList[currentModalIndex];
    if (!item || !detailModal) return;

    modalImg.src = item.image;
    modalImg.alt = item.name;

    if (modalCounter) {
      modalCounter.textContent = `Foto ${currentModalIndex + 1} dari ${currentFilteredList.length}`;
    }
    if (modalFullImgLink) {
      modalFullImgLink.href = item.image;
    }

    modalVerifyTag.textContent = item.verificationStatus;
    modalCategory.textContent = item.categoryName + ' • ' + item.roomLabel;
    modalTitle.textContent = item.name;
    modalReg.textContent = item.regNumber;
    modalEra.textContent = item.era;
    modalMaterial.textContent = item.material;
    modalRoom.textContent = item.roomLocation;
    modalDesc.textContent = item.narrative;
  }

  function openDetailModal(id) {
    const idx = currentFilteredList.findIndex(c => c.id === id);
    if (idx === -1) return;

    updateModalContent(idx);

    detailModal.classList.add('is-open');
    detailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailModal() {
    if (!detailModal) return;
    detailModal.classList.remove('is-open');
    detailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModalContent(currentModalIndex - 1);
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModalContent(currentModalIndex + 1);
    });
  }

  // Klik foto di modal membuka foto ukuran asli
  if (modalImgHolder) {
    modalImgHolder.addEventListener('click', () => {
      const item = currentFilteredList[currentModalIndex];
      if (item) {
        window.open(item.image, '_blank');
      }
    });
  }

  if (modalClose) modalClose.addEventListener('click', closeDetailModal);
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeDetailModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!detailModal || !detailModal.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeDetailModal();
    } else if (e.key === 'ArrowLeft') {
      updateModalContent(currentModalIndex - 1);
    } else if (e.key === 'ArrowRight') {
      updateModalContent(currentModalIndex + 1);
    }
  });

  // =========================================================================
  // 3. LOGIKA PETA INTERAKTIF RUANGAN SESUAI STRUKTUR LENGKAP
  // =========================================================================
  const roomsData = {
    'halaman': {
      badge: 'HALAMAN DEPAN & SAMPING',
      verifyStatus: 'Status: Terverifikasi (8 Arsip Foto Asli)',
      title: 'Halaman Depan, Gedung Pengelola & Halaman Samping',
      desc: 'Area pintu masuk kompleks museum, gedung kantor pengelola, serta taman arkeologi terbuka tempat pelestarian peti kubur batu megalitikum (Sarkofagus) dari Desa Alas Angker, Gobleg, dan Selat.',
      items: [
        'Tampak Depan Gerbang Candi Bentar Kompleks Museum Buleleng',
        'Gedung Pengelola & Kantor Pelayanan Cagar Budaya',
        'Sarkofagus Megalitikum Desa Alas Angker (Halaman Samping)',
        'Sarkofagus Megalitikum Desa Gobleg Kecamatan Banjar',
        'Sarkofagus Megalitikum Desa Selat Kecamatan Sukasada',
        'Foto Dokumentasi Sudut Halaman & Kompleks Terbuka'
      ]
    },
    'ruang-1a': {
      badge: 'RUANG 1 A',
      verifyStatus: 'Status: Terverifikasi (38 Arsip Foto Asli)',
      title: 'Ruang Sejarah Pendirian & Lukisan Mitologi',
      desc: 'Ruang pamer awal yang menyajikan prasasti peresmian Museum Buleleng pada 30 Maret 2002, silsilah, serta koleksi lukisan Dewa Brahma, Dewi Saraswati, Wisnu, Siwa, Indra, Candi Bentar Banyuning, dan wayang kulit Bima-Gatotkaca.',
      items: [
        'Panel Sejarah Berdirinya Museum Buleleng (30 Maret 2002)',
        'Lukisan Dewa Brahma dan Dewi Saraswati',
        'Lukisan Dewa Wisnu Pemelihara Alam Semesta',
        'Lukisan Patung Siwa Mahadewa & Relief Pura',
        'Lukisan Candi Bentar Banyuning & Pura Khas Bali Utara',
        'Wayang Kulit Bali Utara Bima dan Anaknya Gatotkaca'
      ]
    },
    'ruang-1b': {
      badge: 'RUANG 1 B',
      verifyStatus: 'Status: Terverifikasi (38 Arsip Foto Asli)',
      title: 'Ruang Modernisasi, Transportasi & Seni Wayang Kulit',
      desc: 'Merekam sejarah masuknya modernitas ke Bali melalui pelabuhan Buleleng: mobil pertama, sepeda motor pertama, sepatu kulit perdana, pakaian dinas kolonial, kelahiran Gong Kebyar tahun 1915, dan wayang kulit Dalang Banjar.',
      items: [
        'Foto Dokumentasi Mobil Pertama Masuk ke Pulau Bali',
        'Cerita Sepeda Motor Pertama di Relief Pura Medue Karang',
        'Sepatu Model Pertama di Bali Utara',
        'Penjelasan Kancing & Jaket Dinas Tempo Doeloe',
        'Foto Pelopor Kelahiran Gamelan Gong Kebyar Tahun 1915',
        'Wayang Kulit Bali Utara dari Dalang Ida Putu Sweca Banjar'
      ]
    },
    'ruang-2a': {
      badge: 'RUANG 2 A',
      verifyStatus: 'Status: Terverifikasi (44 Arsip Foto Asli)',
      title: 'Ruang Peralatan Tradisional & Pahlawan Nasional',
      desc: 'Menampilkan baju dinas Mr. I Gusti Ketut Pudja (Pahlawan Nasional asal Buleleng), Petaka Bale Prabu Pura Agung Bungkulan, kendi ceret tanah liat kuno, gendek kayu, alat cetak gula merah, bungbung garam, dan foto brankas kuno.',
      items: [
        'Baju Kerja Asli Mr. I Gusti Ketut Pudja (Pahlawan Nasional)',
        'Petaka Bale Prabu Pura Agung Bungkulan Berprada Emas',
        'Kendi Ceret Tanah Liat Kuno Abad ke-14 - 16',
        'Gendek Kayu Pahat Tradisional Masyarakat Agraris',
        'Alat Cetak Gula Merah Tradisional & Bungbung Garam',
        'Koleksi Manik-manik Kuno & Perlengkapan Ritual Upacara'
      ]
    },
    'ruang-2b': {
      badge: 'RUANG 2 B',
      verifyStatus: 'Status: Terverifikasi (55 Arsip Foto Asli)',
      title: 'Ruang Arkeologi & Ekskavasi Situs Kuno Buleleng',
      desc: 'Pusat peninggalan arkeologi tertua di Buleleng: nekara perunggu Ularan, peripih emas Umejero, stupika Buddha Kalibubuk, batu gacuk Sembiran, beliung neolitikum Sukasada, batu endek Tamblingan, dan tembikar purbakala.',
      items: [
        'Nekara Perunggu Zaman Logam Situs Desa Ularan',
        'Peripih Emas Murni Bertuliskan Rajah Situs Umejero',
        'Stupika Tanah Liat Bermantra Buddha Candi Kalibubuk',
        'Batu Gacuk Permainan Kuno Desa Sembiran (Bali Aga)',
        'Beliung Persegi Zaman Neolitikum Desa Sukasada',
        'Wadah Kapur Sirih Antik dari Situs Pesisir Tejakula',
        'Batu Endek Bermotif Relief Tenun Danau Tamblingan'
      ]
    },
    'ruang-3': {
      badge: 'RUANG 3',
      verifyStatus: 'Status: Terverifikasi (26 Arsip Foto Asli)',
      title: 'Ruang Era Kolonial, Kemerdekaan & Regalia Puri',
      desc: 'Menyimpan perangkat radio gelombang pendek zaman Belanda dan radio buatan Indonesia masa kemerdekaan, tempat sirih kuningan kehormatan Puri Buleleng, ceroncong, sok kasi, dan wadah beruk tradisional.',
      items: [
        'Radio Tabung Komunikasi Era Kolonial Hindia Belanda',
        'Radio Antik Buatan Produksi Indonesia Era Kemerdekaan',
        'Tempat Sirih Antik Kuningan Berukir Kebesaran Puri',
        'Koleksi Beruk Batok Kelapa Tradisional Denbukit',
        'Ceroncong & Sok Kasi Perlengkapan Adat Tempo Doeloe',
        'Dokumentasi Pintu Gerbang Ukir & Arsitektur Ruang 3'
      ]
    },
    'ruang-4': {
      badge: 'RUANG 4',
      verifyStatus: 'Status: Terverifikasi (42 Arsip Foto Asli)',
      title: 'Ruang Dinasti Panji Sakti, Lukisan & Mesin Tik Kuno',
      desc: 'Menampilkan bagan silsilah kepemimpinan raja-raja Buleleng keturunan Ki Barak Panji Sakti, mesin ketik mekanik antik tahun 1870 & 1945, serta mahakarya seni pahat patung kayu mitologi klasik Bali Utara.',
      items: [
        'Bagan Silsilah Resmi Wangsa Ki Barak Panji Sakti',
        'Mesin Ketik Antik Tahun 1870 Pelabuhan Singaraja',
        'Mesin Ketik Bersejarah Masa Kemerdekaan Tahun 1945',
        'Seni Pahat Patung Kayu Klasik Mitologi Buleleng',
        'Koleksi Lukisan Seniman Maestro Bali Utara & Ramayana'
      ]
    },
    'lorong': {
      badge: 'RUANG LORONG LUKISAN',
      verifyStatus: 'Status: Terverifikasi (15 Arsip Foto Asli)',
      title: 'Galeri Seni Lukis Klasik & Koridor Penghubung',
      desc: 'Koridor galeri seni lukis yang memamerkan rangkaian 15 karya seni lukis klasik Bali Utara bernuansa cerita epos Mahabarata, Ramayana, dan lanskap alam Buleleng tempo doeloe.',
      items: [
        'Lukisan Kisah Epos Klasik Mahabharata & Ramayana',
        'Lukisan Lanskap Pesisir Pantai dan Alam Buleleng',
        'Lukisan Tradisional Kamasan Gaya Pesisir Bali Utara',
        'Dokumentasi Panel Galeri Dinding Koridor Pameran'
      ]
    }
  };

  const svgRooms = document.querySelectorAll('.svg-room');
  const panelRoomBadge = document.getElementById('panelRoomBadge');
  const panelVerifyBadge = document.getElementById('panelVerifyBadge');
  const panelRoomTitle = document.getElementById('panelRoomTitle');
  const panelRoomDesc = document.getElementById('panelRoomDesc');
  const panelCollectionList = document.getElementById('panelCollectionList');
  const btnResetMap = document.getElementById('btnResetMap');
  const btnViewRoomCollection = document.getElementById('btnViewRoomCollection');

  let activeSelectedRoom = 'ruang-1a';

  function selectRoom(roomId) {
    const room = roomsData[roomId];
    if (!room) return;

    activeSelectedRoom = roomId;

    svgRooms.forEach(r => r.classList.remove('is-active'));
    const activeGroup = document.querySelector(`.svg-room[data-room-id="${roomId}"]`);
    if (activeGroup) activeGroup.classList.add('is-active');

    if (panelRoomBadge) panelRoomBadge.textContent = room.badge;
    if (panelVerifyBadge) {
      panelVerifyBadge.textContent = room.verifyStatus;
      panelVerifyBadge.style.color = '#2E7D32';
    }
    if (panelRoomTitle) panelRoomTitle.textContent = room.title;
    if (panelRoomDesc) panelRoomDesc.textContent = room.desc;
    if (panelCollectionList) {
      panelCollectionList.innerHTML = room.items.map(it => `<li>${it}</li>`).join('');
    }
  }

  svgRooms.forEach(roomEl => {
    roomEl.addEventListener('click', () => {
      selectRoom(roomEl.getAttribute('data-room-id'));
    });
  });

  if (btnResetMap) {
    btnResetMap.addEventListener('click', () => {
      selectRoom('halaman');
    });
  }

  // Tombol "Lihat Koleksi Ruang Ini" pada panel peta
  if (btnViewRoomCollection) {
    btnViewRoomCollection.addEventListener('click', (e) => {
      e.preventDefault();
      filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === activeSelectedRoom) {
          btn.click();
        }
      });
      const targetSec = document.getElementById('koleksi');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // =========================================================================
  // 4. KUIS SEJARAH INTERAKTIF BERBASIS KOLEKSI ARSIP ASLI
  // =========================================================================
  const quizQuestions = [
    {
      category: "Pahlawan Nasional Buleleng",
      question: "Siapakah Pahlawan Nasional asal Buleleng yang ikut mendirikan Republik Indonesia dan baju kerjanya disimpan di Ruang 2 A?",
      options: [
        "Mr. I Gusti Ketut Pudja",
        "I Gusti Ketut Jelantik",
        "Anak Wungsu",
        "I Gusti Anglurah Panji Sakti"
      ],
      correctIndex: 0,
      explanation: "Mr. I Gusti Ketut Pudja adalah anggota PPKI yang hadir saat Proklamasi 17 Agustus 1945 dan diangkat sebagai Gubernur Sunda Kecil pertama. Baju kerjanya dipamerkan di Ruang 2 A."
    },
    {
      category: "Prasejarah Buleleng",
      question: "Peninggalan peti kubur batu megalitikum dari Desa Alas Angker, Gobleg, dan Selat dilestarikan di area...",
      options: [
        "Ruang 3 (Era Kolonial)",
        "Halaman Samping & Taman Arkeologi Terbuka",
        "Perpustakaan Gedong Kirtya",
        "Ruang 4 (Regalia Puri)"
      ],
      correctIndex: 1,
      explanation: "Sarkofagus batu monolit dari berbagai desa di Buleleng dipamerkan di area taman terbuka Halaman Samping Museum Buleleng."
    },
    {
      category: "Kesenian Buleleng",
      question: "Inovasi gamelan Bali berirama cepat dan dinamis yang pertama kali lahir di Buleleng pada tahun 1915 adalah...",
      options: [
        "Gong Kebyar",
        "Gamelan Selonding",
        "Gender Wayang",
        "Gamelan Gambang"
      ],
      correctIndex: 0,
      explanation: "Gong Kebyar lahir pertama kali di desa Bungkulan dan Jagaraga, Buleleng pada tahun 1915 dan menjadi revolusi kesenian gamelan Bali yang mendunia."
    },
    {
      category: "Arkeologi Buleleng",
      question: "Genderang perunggu era kebudayaan Dongson yang ditemukan di Desa Ularan dan dipamerkan di Ruang 2 B disebut...",
      options: [
        "Nekara Perunggu",
        "Batu Prasasti",
        "Stupika",
        "Kendi Tanah"
      ],
      correctIndex: 0,
      explanation: "Nekara perunggu dari Desa Ularan merupakan artefak zaman logam penting yang digunakan dalam ritual pemanggilan hujan masyarakat purba."
    },
    {
      category: "Wangsa Kerajaan Buleleng",
      question: "Bagan silsilah keturunan raja-raja Buleleng yang dipamerkan di Ruang 4 bersumber dari pendiri kerajaan termasyhur, yaitu...",
      options: [
        "Ki Barak Panji Sakti (I Gusti Anglurah Panji Sakti)",
        "Sri Kesari Warmadewa",
        "Raja Udayana Warmadewa",
        "Patih Kebo Iwa"
      ],
      correctIndex: 0,
      explanation: "Ki Barak Panji Sakti mendirikan Kerajaan Buleleng pada abad ke-17. Pohon silsilah lengkap keturunan beliau dipajang secara terhormat di Ruang 4."
    }
  ];

  let currentQIndex = 0;
  let userAnswers = [];

  const quizStartView = document.getElementById('quizStartView');
  const quizPlayView = document.getElementById('quizPlayView');
  const quizResultView = document.getElementById('quizResultView');
  const btnStartQuiz = document.getElementById('btnStartQuiz');
  const btnNextQuestion = document.getElementById('btnNextQuestion');
  const btnRestartQuiz = document.getElementById('btnRestartQuiz');
  const qCurrent = document.getElementById('qCurrent');
  const qTotal = document.getElementById('qTotal');
  const qCategoryTag = document.getElementById('qCategoryTag');
  const quizProgressBar = document.getElementById('quizProgressBar');
  const questionText = document.getElementById('questionText');
  const optionsGrid = document.getElementById('optionsGrid');
  const finalScoreVal = document.getElementById('finalScoreVal');
  const resultEvalText = document.getElementById('resultEvalText');
  const reviewList = document.getElementById('reviewList');

  if (qTotal) qTotal.textContent = quizQuestions.length;

  if (btnStartQuiz) {
    btnStartQuiz.addEventListener('click', () => {
      quizStartView.style.display = 'none';
      quizPlayView.style.display = 'block';
      currentQIndex = 0;
      userAnswers = [];
      displayQuestion();
    });
  }

  function displayQuestion() {
    const q = quizQuestions[currentQIndex];
    if (!q) return;

    if (qCurrent) qCurrent.textContent = currentQIndex + 1;
    if (qCategoryTag) qCategoryTag.textContent = q.category;
    if (quizProgressBar) {
      quizProgressBar.style.width = `${((currentQIndex + 1) / quizQuestions.length) * 100}%`;
    }

    if (questionText) questionText.textContent = q.question;
    if (btnNextQuestion) btnNextQuestion.style.display = 'none';

    const letters = ['A', 'B', 'C', 'D'];
    if (optionsGrid) {
      optionsGrid.innerHTML = q.options.map((opt, idx) => `
        <button class="option-btn" data-index="${idx}">
          <span class="opt-index">${letters[idx]}</span>
          <span>${opt}</span>
        </button>
      `).join('');

      document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          userAnswers[currentQIndex] = parseInt(btn.getAttribute('data-index'));

          if (btnNextQuestion) {
            btnNextQuestion.style.display = 'inline-flex';
            btnNextQuestion.textContent = (currentQIndex === quizQuestions.length - 1)
              ? 'Lihat Hasil & Pembahasan ➔'
              : 'Pertanyaan Berikutnya ➔';
          }
        });
      });
    }
  }

  if (btnNextQuestion) {
    btnNextQuestion.addEventListener('click', () => {
      currentQIndex++;
      if (currentQIndex < quizQuestions.length) {
        displayQuestion();
      } else {
        renderQuizResults();
      }
    });
  }

  function renderQuizResults() {
    quizPlayView.style.display = 'none';
    quizResultView.style.display = 'block';

    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) correctCount++;
    });

    const score = Math.round((correctCount / quizQuestions.length) * 100);
    if (finalScoreVal) finalScoreVal.textContent = score;

    let evalMessage = '';
    if (score >= 80) evalMessage = 'Pemahaman Istimewa • Sangat Menguasai Koleksi & Sejarah Buleleng';
    else if (score >= 60) evalMessage = 'Pemahaman Cukup Baik • Terus Pelajari Ruang Pamer Museum';
    else evalMessage = 'Perlu Pendalaman Materi • Disarankan Mengkaji Ulang Modul Koleksi';

    if (resultEvalText) resultEvalText.textContent = evalMessage;

    if (reviewList) {
      reviewList.innerHTML = quizQuestions.map((q, idx) => {
        const isUserCorrect = (userAnswers[idx] === q.correctIndex);
        return `
          <div class="review-item">
            <div class="review-q">
              ${idx + 1}. ${q.question} 
              <span style="color: ${isUserCorrect ? '#2E7D32' : '#800020'}; font-weight: bold;">
                (${isUserCorrect ? 'Jawaban Benar' : 'Jawaban Kurang Tepat'})
              </span>
            </div>
            <div class="review-ans">Kunci Jawaban: ${q.options[q.correctIndex]}</div>
            <div class="review-fact"><strong>Catatan Sejarah:</strong> ${q.explanation}</div>
          </div>
        `;
      }).join('');
    }
  }

  if (btnRestartQuiz) {
    btnRestartQuiz.addEventListener('click', () => {
      quizResultView.style.display = 'none';
      quizStartView.style.display = 'block';
      currentQIndex = 0;
      userAnswers = [];
    });
  }

  // =========================================================================
  // 5. TOGGLE MENU SELULER & AKTIF NAVBAR SCROLL
  // =========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.style.display = (mobileDrawer.style.display === 'block') ? 'none' : 'block';
    });
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.style.display = 'none';
      });
    });
  }

  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');

  window.addEventListener('scroll', () => {
    let scrollPos = window.pageYOffset;
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        desktopLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // =========================================================================
  // 6. KONTROL INTERAKTIF PEMUTAR TOUR MUSEUM BULELENG
  // =========================================================================
  const museumVideoPlayer = document.getElementById('museumVideoPlayer');
  const btnPlayVideoDirect = document.getElementById('btnPlayVideoDirect');

  if (museumVideoPlayer && btnPlayVideoDirect) {
    btnPlayVideoDirect.addEventListener('click', () => {
      if (museumVideoPlayer.paused) {
        museumVideoPlayer.play().catch(err => {
          console.warn('Autoplay terhalang peramban:', err);
        });
        btnPlayVideoDirect.innerHTML = '<span>⏸ Jeda Tour Video</span>';
      } else {
        museumVideoPlayer.pause();
        btnPlayVideoDirect.innerHTML = '<span>▶ Mulai Tour Video Sekarang</span>';
      }
    });

    museumVideoPlayer.addEventListener('play', () => {
      btnPlayVideoDirect.innerHTML = '<span>⏸ Jeda Tour Video</span>';
    });

    museumVideoPlayer.addEventListener('pause', () => {
      btnPlayVideoDirect.innerHTML = '<span>▶ Mulai Tour Video Sekarang</span>';
    });

    museumVideoPlayer.addEventListener('ended', () => {
      btnPlayVideoDirect.innerHTML = '<span>⟲ Putar Ulang Tour</span>';
    });
  }

});
