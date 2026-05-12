import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/account/profile',   icon: 'person',                   label: 'Thông tin cá nhân' },
  { to: '/account/addresses', icon: 'location_on',              label: 'Địa chỉ đã lưu' },
  { to: '/account/payment',   icon: 'account_balance_wallet',   label: 'Thanh toán & Ưu đãi' },
];

// Mock user — thay bằng context/store thực tế sau
const user = {
  name: 'Nguyễn Trần Hoàng Nam',
  initials: 'HN',
  tier: 'Thành viên Vàng',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAodb5nqaPcIeE9L-abLsf13OfhQc2rxWp19RsIgB9LYZuxUR8jnnaIfn_-nJcZJgWdSowviUeDPHE8zY-bu_pSH22JDX9vb6eCt6HnW7-vh-4crG4lL74nT0kvccugYygkgcuIXb-u9Db2WmRkGdArhhmS4vhznJgI4flKMjNVeRhrii0VgTLYDrmx3c7R2bOCM88tg421idaGpPYWmnP8VSZrzu4WUIMmo-Zx86on4omLVUStVcYTDtC8VzDKSqhgIHzLW1CnL9gS',
};

const AccountLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-[120px] pb-section-padding flex flex-col lg:flex-row gap-gutter">

      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-[280px] flex-shrink-0">
        <div className="sticky top-[100px] bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">

          {/* User card */}
          <div className="p-5 border-b border-outline-variant/20 flex items-center gap-4">
            <div className="relative group cursor-pointer shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant/30 bg-surface-variant">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center font-h3 text-h3 text-primary bg-primary-fixed">{user.initials}</div>
                }
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-on-surface text-sm truncate">{user.name}</p>
              <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-[#FFF8E1] border border-[#FFE082] text-[#F57F17] rounded-full">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <span className="text-[11px] font-bold">{user.tier}</span>
              </div>
            </div>
          </div>

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
              onClick={() => navigate('/logout')}
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
  );
};

export default AccountLayout;