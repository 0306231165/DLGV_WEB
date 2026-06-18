import React, { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import khachHangApi from '../../../api/khachHangApi';
import { useAuth } from '../../../contexts/AuthContext';

// ─── Context để các trang con dùng lại data profile ──────────────────────────
export const AccountContext = createContext(null);
export const useAccount = () => useContext(AccountContext);

const navItems = [
  { to: '/account/profile',   icon: 'person',                   label: 'Thông tin cá nhân' },
  { to: '/account/addresses', icon: 'location_on',              label: 'Địa chỉ đã lưu' },
  { to: '/account/payment',   icon: 'account_balance_wallet',   label: 'Thanh toán & Ưu đãi' },
  { to: '/account/vouchers',  icon: 'local_offer',              label: 'Mã giảm giá của tôi' },
];

// Màu badge theo hạng
const TIER_STYLE = {
  'Thành viên Bạch Kim': { bg: 'bg-[#E8F5E9]', border: 'border-[#A5D6A7]', text: 'text-[#2E7D32]' },
  'Thành viên Vàng':     { bg: 'bg-[#FFF8E1]', border: 'border-[#FFE082]', text: 'text-[#F57F17]' },
  'Thành viên Bạc':      { bg: 'bg-[#F5F5F5]', border: 'border-[#BDBDBD]', text: 'text-[#616161]' },
  'Thành viên':          { bg: 'bg-[#E3F2FD]', border: 'border-[#90CAF9]', text: 'text-[#1565C0]' },
};

const AccountLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    khachHangApi.getProfile()
      .then(res => {
        console.log('RAW res:', res); // log để xem cấu trúc thật
        if (!cancelled) setProfile(res.data);
      })
      .catch(() => {
        // Token hết hạn / lỗi → redirect về login
        navigate('/login');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ─── Skeleton sidebar khi đang load ──────────────────────────────────────
  const SidebarSkeleton = () => (
    <div className="p-5 border-b border-outline-variant/20 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-surface-container-high shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-surface-container-high rounded-full w-3/4" />
        <div className="h-3 bg-surface-container-high rounded-full w-1/2" />
      </div>
    </div>
  );

  const tierKey   = profile?.hang_thanh_vien ?? 'Thành viên';
  const tierStyle = TIER_STYLE[tierKey] ?? TIER_STYLE['Thành viên'];

  // Lấy initials từ ho_ten để hiển thị khi không có avatar
  const initials = profile?.ho_ten
    ? profile.ho_ten.trim().split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <AccountContext.Provider value={{ profile, setProfile, loading }}>
      <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-[120px] pb-section-padding flex flex-col lg:flex-row gap-gutter">

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-[280px] flex-shrink-0">
          <div className="sticky top-[100px] bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">

            {/* User card */}
            {loading ? (
              <SidebarSkeleton />
            ) : (
              <div className="p-5 border-b border-outline-variant/20 flex items-center gap-4">
                <div className="relative group cursor-pointer shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant/30 bg-surface-variant">
                    {profile?.avatar
                      ? <img src={profile.avatar} alt={profile.ho_ten} className="w-full h-full object-cover" />
                      : (
                        <div className="w-full h-full flex items-center justify-center font-semibold text-base text-primary bg-primary/10">
                          {initials}
                        </div>
                      )
                    }
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface text-sm truncate">{profile?.ho_ten}</p>
                  <div className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 ${tierStyle.bg} border ${tierStyle.border} ${tierStyle.text} rounded-full`}>
                    <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <span className="text-[11px] font-bold">{tierKey}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Nav items */}
            <nav className="p-3 flex flex-col gap-1">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-3 py-2">Tài khoản của tôi</p>

              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all relative overflow-hidden
                    ${isActive
                      ? 'bg-surface-container-low text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full" />
                      )}
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}

              <div className="h-px bg-outline-variant/30 my-2" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-error hover:bg-error/5 transition-all w-full text-left"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Đăng xuất
              </button>
            </nav>
          </div>
        </aside>

        {/* ── Page content ── */}
        <main className="flex-1 min-w-0 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <Outlet />
        </main>
      </div>
    </AccountContext.Provider>
  );
};

export default AccountLayout;