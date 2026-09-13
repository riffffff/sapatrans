import React, { useState, useEffect } from 'react';
import { Search, Bell, MessageSquare, User } from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mapApiKey = import.meta.env.VITE_MAPID_BASEMAP_KEY;
  const mapBackendUrl = '/map';
  const iframeSrc = `${mapBackendUrl}?lat=-7.7913247&long=110.3667762${mapApiKey ? `&key=${mapApiKey}` : ''}`;

  // URL API Laravel (sesuai route: /api/dashboard)
  const API_URL = '/api/dashboard';

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.success) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || 'Gagal memuat data dashboard');
        }
      } catch (err) {
        console.error('Error fetching API:', err);
        setError(err.message || 'Tidak dapat terhubung ke server');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex-1 bg-[#F6F6F6] min-h-screen p-8 flex items-center justify-center text-gray-500 font-medium">
        Memuat data dashboard...
      </div>
    );
  }

  // Error State
  if (error || !dashboardData) {
    return (
      <div className="flex-1 bg-[#F6F6F6] min-h-screen p-8 flex flex-col items-center justify-center text-red-500">
        <p className="font-bold text-lg mb-2">Gagal memuat data</p>
        <p className="text-sm text-gray-500 mb-4">{error || 'Data tidak tersedia'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { kpi, haltePerhatian } = dashboardData;

  // Hitung persentase KPI (hindari division by zero)
  const pct = (val) =>
    kpi.totalHalte > 0 ? ((val / kpi.totalHalte) * 100).toFixed(1).replace('.', ',') : '0';

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
          Dashboard
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
              style={{
                color: '#292929',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
              }}
            />
          </div>

          <button className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 shadow-sm">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-[20px] w-full">

        {/* Card Jumlah Total Halte */}
        <div
          className="flex items-center justify-between lg:justify-center w-full lg:w-[388px] h-auto min-h-[120px] lg:h-[140px] bg-white rounded-[10px] p-4 sm:p-6 lg:p-[32px] gap-4 sm:gap-8 lg:gap-[32px] shrink-0"
          style={{ boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)' }}
        >
          <div className="flex items-end gap-[6px] h-[60px] lg:h-[80px] shrink-0">
            <div style={{ width: '15px', height: '29px', borderRadius: '12.158px', background: '#4D4D4D' }} />
            <div style={{ width: '15px', height: '51px', borderRadius: '12.158px', background: '#EC2735' }} />
            <div style={{ width: '14px', height: '67px', borderRadius: '12.158px', background: '#F5BD4F' }} />
            <div style={{ width: '15px', height: '80px', borderRadius: '12.158px', background: '#0063F3' }} />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-gray-600 font-medium text-sm sm:text-base lg:text-[19.453px] mb-1 lg:mb-2">
              Jumlah Total
            </p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl lg:text-[48px] font-semibold text-[#292929] leading-none">
                {kpi.totalHalte}
              </span>
              <span className="text-base sm:text-lg lg:text-[20px] font-semibold text-[#292929] leading-none">
                halte
              </span>
            </div>
          </div>
        </div>

        {/* Group 4 Card Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-3 lg:gap-[12px] w-full lg:w-auto shrink-0">

          {/* 1. Aksesibel */}
          <div
            className="flex flex-col justify-center items-start gap-[12px] w-full lg:w-auto h-[140px] pt-[16px] pr-[42px] pb-[16px] pl-[16px] bg-white rounded-[10px] shrink-0"
            style={{ boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="w-[48px] h-[48px] rounded-[6px] bg-[#F5F5F5] shrink-0" />
            <div>
              <div className="flex items-baseline space-x-2">
                <span style={{ color: '#292929', fontFamily: 'Nunito, sans-serif', fontSize: '32px', fontWeight: 600 }}>
                  {kpi.sangatAksesibel}
                </span>
                <span style={{ color: '#9B9B9B', fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 500 }}>
                  Aksesibel
                </span>
              </div>
              <p style={{ color: '#9B9B9B', fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 500, marginTop: '4px' }}>
                {pct(kpi.sangatAksesibel)}% dari 100%
              </p>
            </div>
          </div>

          {/* 2. Cukup Aksesibel */}
          <div
            className="flex flex-col justify-center items-start gap-[12px] w-full lg:w-auto h-[140px] pt-[16px] pr-[23px] pb-[16px] pl-[16px] bg-white rounded-[10px] shrink-0"
            style={{ boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="w-[48px] h-[48px] rounded-[6px] bg-[#F5F5F5] shrink-0" />
            <div>
              <div className="flex items-baseline space-x-2">
                <span style={{ color: '#292929', fontFamily: 'Nunito, sans-serif', fontSize: '32px', fontWeight: 600 }}>
                  {kpi.cukupAksesibel}
                </span>
                <span style={{ color: '#9B9B9B', fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 500 }}>
                  Cukup Aksesibel
                </span>
              </div>
              <p style={{ color: '#9B9B9B', fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 500, marginTop: '4px' }}>
                Dengan {pct(kpi.cukupAksesibel)}%
              </p>
            </div>
          </div>

          {/* 3. Kurang Aksesibel */}
          <div
            className="flex flex-col justify-center items-start gap-[12px] w-full lg:w-auto h-[140px] pt-[16px] pr-[19px] pb-[16px] pl-[16px] bg-white rounded-[10px] shrink-0"
            style={{ boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="w-[48px] h-[48px] rounded-[6px] bg-[#F5F5F5] shrink-0" />
            <div>
              <div className="flex items-baseline space-x-2">
                <span style={{ color: '#292929', fontFamily: 'Nunito, sans-serif', fontSize: '32px', fontWeight: 600 }}>
                  {kpi.kurangAksesibel}
                </span>
                <span style={{ color: '#9B9B9B', fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 500 }}>
                  Kurang Aksesibel
                </span>
              </div>
              <p style={{ color: '#9B9B9B', fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 500, marginTop: '4px' }}>
                Dengan {pct(kpi.kurangAksesibel)}%
              </p>
            </div>
          </div>

          {/* 4. Tidak Aksesibel */}
          <div
            className="flex flex-col justify-center items-start gap-[12px] w-full lg:w-auto h-[140px] pt-[16px] pr-[54px] pb-[16px] pl-[16px] bg-white rounded-[10px] shrink-0"
            style={{ boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="w-[48px] h-[48px] rounded-[6px] bg-[#F5F5F5] shrink-0" />
            <div>
              <div className="flex items-baseline space-x-2">
                <span style={{ color: '#292929', fontFamily: 'Nunito, sans-serif', fontSize: '32px', fontWeight: 600 }}>
                  {kpi.tidakTersedia}
                </span>
                <span style={{ color: '#9B9B9B', fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 500 }}>
                  Tidak Aksesibel
                </span>
              </div>
              <p style={{ color: '#9B9B9B', fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 500, marginTop: '4px' }}>
                Dengan {pct(kpi.tidakTersedia)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Map & Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Peta Aksesibilitas */}
        <div
          className="lg:col-span-7 w-full h-auto min-h-[464px] bg-white rounded-[10px] p-[24px] sm:p-[32px] flex flex-col justify-between shrink-0"
          style={{ boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.04)' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ color: '#292929', fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 500 }}>
              Peta Aksesibilitas
            </h2>
            <button
              onClick={() => setActiveTab('peta')}
              className="hover:underline shrink-0"
              style={{ color: '#9B9B9B', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 400 }}
            >
              lihat selengkapnya
            </button>
          </div>

          <div className="w-full h-[288px] rounded-[12px] bg-[#F5F5F5] relative overflow-hidden my-auto border border-gray-100">
            <iframe
              src={iframeSrc}
              title="MAPID Map"
              className="w-full h-full border-0 relative z-10"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[16px] mt-4">
            <div className="flex items-center gap-[20px]">
              <div className="flex items-center gap-[8px]">
                <span className="w-[10px] h-[10px] rounded-full bg-[#10B981] shrink-0" />
                <span style={{ color: '#9B9B9B', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 500 }}>
                  Sangat Aksesibel (4.0 - 5.0)
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="w-[10px] h-[10px] rounded-full bg-[#EC2735] shrink-0" />
                <span style={{ color: '#9B9B9B', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 500 }}>
                  Kurang Aksesibel (1.0 - 2.4)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-[20px]">
              <div className="flex items-center gap-[8px]">
                <span className="w-[10px] h-[10px] rounded-full bg-[#F5BD4F] shrink-0" />
                <span style={{ color: '#9B9B9B', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 500 }}>
                  Cukup Aksesibel (2.5 - 3.9)
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="w-[10px] h-[10px] rounded-full bg-[#4D4D4D] shrink-0" />
                <span style={{ color: '#9B9B9B', fontFamily: 'Rubik, sans-serif', fontSize: '12px', fontWeight: 500 }}>
                  Tidak Aksesibel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Pengunjung */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Total Pengunjung</h2>
            <button className="text-xs text-gray-400 hover:text-blue-600">lihat selengkapnya</button>
          </div>
          <div className="h-52 w-full flex items-end justify-between px-2 pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
              <path
                d="M 0 80 Q 30 65 60 40 T 120 50 T 180 20 T 240 55 T 300 45"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      </div>

      {/* Row 3: Attention Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Halte yang perlu diperhatikan</h2>
          <button
            onClick={() => setActiveTab('data-halte')}
            className="text-xs text-gray-400 hover:text-blue-600"
          >
            lihat selengkapnya
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="border-b border-gray-100 text-gray-400 font-medium">
              <tr>
                <th className="pb-3">Nama halte</th>
                <th className="pb-3">Skor Aksesibilitas</th>
                <th className="pb-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {haltePerhatian && haltePerhatian.length > 0 ? (
                haltePerhatian.map((halte) => (
                  <tr key={halte.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-medium text-gray-700">{halte.nama_halte}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
                        {halte.skor}/5
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{halte.keterangan || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-gray-400">
                    Semua halte dalam kondisi baik (Skor ≥ 2.5)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}