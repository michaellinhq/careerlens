'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getIndustryOption, identityProfiles, industryOptions } from '@/lib/rpg-sim';

const SESSION_KEY = 'career-sim-session-v1';
const RUN_KEY = 'career-sim-run-v1';

export interface CareerSimSession {
  name: string;
  email: string;
  identityId: string;
  industryId: string;
  targetRoleId: string;
  cityId: string;
  createdAt: string;
}

export { SESSION_KEY, RUN_KEY };

export default function RpgLoginPage() {
  const router = useRouter();
  const [name, setName] = useState('海青');
  const [email, setEmail] = useState('demo@careerlens.cn');
  const [identityId, setIdentityId] = useState(identityProfiles[0].id);
  const [industryId, setIndustryId] = useState(industryOptions[0].id);

  useEffect(() => {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) {
      router.prefetch('/rpg/app');
    }
  }, [router]);

  function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session: CareerSimSession = {
      name: name.trim() || '试玩玩家',
      email: email.trim() || 'demo@careerlens.cn',
      identityId,
      industryId,
      targetRoleId: getIndustryOption(industryId).primaryRoleId,
      cityId: 'shanghai',
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.localStorage.removeItem(RUN_KEY);
    router.push('/rpg/app');
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-slate-950">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <Link href="/rpg" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
            返回概念预览
          </Link>
          <h1 className="mt-7 text-4xl font-black leading-tight tracking-normal text-slate-950 md:text-6xl">
            先选行业，<br className="hidden md:block" />再生成路线
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-slate-600">
            第一版不让你在几个岗位里硬选。先选行业方向，系统再把城市、岗位、技能、项目证据和行动清单串起来。
          </p>
          <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
            {[
              ['90天', '倒计时'],
              ['6项', '资源数值'],
              ['16城', '市场地图'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-2xl font-black text-blue-600">{value}</div>
                <div className="mt-1 text-xs font-bold text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submitLogin} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black text-blue-600">CareerLens Playable Demo</div>
              <h2 className="mt-2 text-2xl font-black text-slate-950">登录并选择行业</h2>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Demo</div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-black text-slate-600">你的名字</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white"
                placeholder="输入名字"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black text-slate-600">邮箱</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white"
                placeholder="demo@careerlens.cn"
              />
            </label>

            <div>
              <div className="text-xs font-black text-slate-600">选择开局身份</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {identityProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setIdentityId(profile.id)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      profile.id === identityId ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-black text-slate-950">{profile.nameZh}</div>
                    <div className="mt-1 text-[11px] font-medium leading-4 text-slate-500">{profile.archetypeZh}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-black text-slate-600">选择行业方向</div>
              <div className="mt-2 grid max-h-[310px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {industryOptions.map((industry) => (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => setIndustryId(industry.id)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      industry.id === industryId ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-slate-950">{industry.titleZh}</div>
                        <div className="mt-1 text-[11px] font-medium leading-4 text-slate-500">{industry.subtitleZh}</div>
                      </div>
                      <div className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-700">需求{industry.demandScore}</div>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-emerald-700">{industry.signalZh}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="mt-6 h-14 w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
            生成我的90天路线
          </button>
          <p className="mt-3 text-center text-[11px] font-medium leading-5 text-slate-400">
            当前版本为投放验证 demo：登录信息仅保存在本机浏览器。
          </p>
        </form>
      </section>
    </main>
  );
}
