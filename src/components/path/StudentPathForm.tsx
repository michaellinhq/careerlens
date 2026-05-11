'use client';

import { courses, majorFamilies } from '@/lib/path-engine';
import type { Market, StudentPathInput } from '@/lib/path-engine';

type StudentPathFormProps = {
  onSubmit: (input: StudentPathInput) => void;
};

const defaultMarket: Market = 'CN';

export function StudentPathForm({ onSubmit }: StudentPathFormProps) {
  return (
    <section className="px-4 py-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">学</div>
          <div>
            <h2 className="text-xl font-bold tracking-normal text-slate-950">学生路径</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">先选专业族，再把课程翻译成技能和项目证据。</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {majorFamilies.map((major) => {
            const selectedCourses = courses.filter((course) => course.majorFamilyIds.includes(major.id)).slice(0, 3);

            return (
              <button
                key={major.id}
                type="button"
                onClick={() => {
                  onSubmit({
                    mode: 'student',
                    identity: 'university',
                    majorFamilyId: major.id,
                    stage: 'year-2',
                    courseIds: selectedCourses.map((course) => course.id),
                    interestSkillIds: major.skillIds.slice(0, 2),
                    market: defaultMarket,
                  });
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left font-sans transition active:scale-[0.99]"
              >
                <span className="block text-base font-bold text-slate-950">{major.labels.zh}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  {selectedCourses.length > 0
                    ? `默认带入 ${selectedCourses.map((course) => course.labels.zh).join('、')}`
                    : '点击生成专业到岗位路径'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
