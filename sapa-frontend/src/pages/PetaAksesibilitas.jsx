import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare, User, Info } from 'lucide-react';
import { 
  TrendingUp, 
  GripHorizontal, 
  Navigation, 
  Footprints, 
  Armchair, 
  Map as MapIcon, 
  Lightbulb, 
  Home, 
  UserCheck 
} from 'lucide-react';

export default function PetaAksesibilitas({ setActiveTab }) {
  const iframeRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [halteList, setHalteList] = useState([]);
  const [selectedHalte, setSelectedHalte] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapApiKey = import.meta.env?.VITE_MAPID_BASEMAP_KEY || '';
  const mapBackendUrl = '/map';
  const iframeSrc = mapApiKey ? `${mapBackendUrl}?key=${mapApiKey}` : mapBackendUrl;

  // Fetch Data dari API Laravel
  useEffect(() => {
    async function fetchHalte() {
      try {
        setLoading(true);
        const response = await fetch('/api/haltes');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          setHalteList(result.data);
          // Set halte pertama sebagai default untuk ditampilkan di panel kanan
          setSelectedHalte(result.data[0]); 
        }
      } catch (err) {
        console.error('Gagal mengambil data halte:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHalte();
  }, []);

  // TAMBAHKAN USE EFFECT INI: Menerima klik dari Peta (Iframe)
  useEffect(() => {
    const handleMessage = (event) => {
      // Pastikan pesannya bertipe HALTE_CLICKED
      if (event.data && event.data.type === 'HALTE_CLICKED') {
        const clickedId = event.data.id;
        
        // Cari halte dari list berdasarkan ID
        const selected = halteList.find(h => Number(h.id) === clickedId);
        
        if (selected) {
          setSelectedHalte(selected);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [halteList]); // Dependency ke halteList agar bisa melakukan pencarian

  // Komponen Helper untuk List Fasilitas
  const FasilitasItem = ({ icon: Icon, label }) => (
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#F0F5FF] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#0063F3]" />
      </div>
      <span style={{ color: '#4D4D4D', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400 }}>
        {label}
      </span>
      <Info className="w-[14px] h-[14px] text-[#C4C4C4] ml-1 shrink-0 cursor-pointer" />
    </div>
  );

  return (
    <div className="flex-1 bg-[#F6F6F6] min-h-screen p-8 flex flex-col space-y-6">
      
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <h1
          style={{
            color: '#292D32',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '100%',
          }}
        >
          Peta Aksesibilitas
        </h1>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div
            className="flex items-center px-4 space-x-3"
            style={{
              width: '375px',
              height: '42px',
              borderRadius: '10px',
              background: '#FFF',
              boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Search className="w-5 h-5 text-[#C4C4C4] shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none placeholder-[#C4C4C4]"
              style={{ color: '#292929', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
            />
          </div>

          <button className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Kolom Kiri: Peta Aksesibilitas */}
        <div 
          className="lg:col-span-8 bg-white rounded-[10px] p-[32px] flex flex-col h-full"
          style={{ boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 style={{ color: '#292929', fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 500 }}>
              Peta Aksesibilitas
            </h2>
            <button 
              className="text-[#9B9B9B] hover:underline"
              style={{ fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 400 }}
            >
              lihat selengkapnya
            </button>
          </div>

          {/* Wrapper Iframe */}
          <div className="w-full flex-1 min-h-[400px] rounded-[12px] bg-[#F5F5F5] relative overflow-hidden border border-gray-100 mb-6">
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title="Peta Aksesibilitas MAPID"
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
            />
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-[40px]">
              <div className="flex items-center gap-[8px]">
                <span className="w-[12px] h-[12px] rounded-full bg-[#10B981] shrink-0" />
                <span style={{ color: '#4D4D4D', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 400 }}>
                  Sangat Aksesibel (4.0 - 5.0)
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="w-[12px] h-[12px] rounded-full bg-[#EC2735] shrink-0" />
                <span style={{ color: '#4D4D4D', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 400 }}>
                  Kurang Aksesibel (1.0 - 2.4)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-[40px]">
              <div className="flex items-center gap-[8px]">
                <span className="w-[12px] h-[12px] rounded-full bg-[#F5BD4F] shrink-0" />
                <span style={{ color: '#4D4D4D', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 400 }}>
                  Cukup Aksesibel (2.5 - 3.9)
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="w-[12px] h-[12px] rounded-full bg-[#4D4D4D] shrink-0" />
                <span style={{ color: '#4D4D4D', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 400 }}>
                  Tidak tersedia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail Halte */}
        <div 
          className="lg:col-span-4 bg-white rounded-[10px] p-[32px] flex flex-col h-full overflow-y-auto"
          style={{ boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Memuat detail halte...</div>
          ) : selectedHalte ? (
            <>
              {/* Header Card Halte */}
              <div className="flex justify-between items-center mb-4">
                <h2 style={{ color: '#292929', fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600 }}>
                  {selectedHalte.nama || 'Nama Halte'}
                </h2>
                <span style={{ color: '#4D4D4D', fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 500 }}>
                  {selectedHalte.rating || '0.0'}
                </span>
              </div>

              {/* Foto Halte */}
              <div className="w-full h-[200px] bg-gray-100 rounded-[12px] mb-6 overflow-hidden relative">
                {selectedHalte.foto && selectedHalte.foto.length > 0 ? (
                  <img 
                    src={selectedHalte.foto[0]} 
                    alt="Foto Halte" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Tidak ada foto
                  </div>
                )}
              </div>

              {/* Fasilitas Aksesibilitas List */}
              <div>
                <h3 className="mb-4" style={{ color: '#292929', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600 }}>
                  Fasilitas Aksesibilitas
                </h3>
                
                <div className="flex flex-col">
                  {/* List sesuai gambar (Hardcoded urutannya, data bisa disesuaikan jika ingin dinamis) */}
                  <FasilitasItem icon={TrendingUp} label="Jalan Ramp" />
                  <FasilitasItem icon={GripHorizontal} label="Guiding Block (Jalur Pemandu)" />
                  <FasilitasItem icon={Navigation} label="Trotoar" />
                  <FasilitasItem icon={Footprints} label="Jalan Penyebrangan" />
                  <FasilitasItem icon={Armchair} label="Tempat duduk" />
                  <FasilitasItem icon={MapIcon} label="Papan Informasi" />
                  <FasilitasItem icon={Lightbulb} label="Lampu" />
                  <FasilitasItem icon={Home} label="Atap" />
                  <FasilitasItem icon={UserCheck} label="Pegawai Trans" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">Pilih halte di peta</div>
          )}
        </div>

      </div>
    </div>
  );
}