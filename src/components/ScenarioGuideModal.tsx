import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  Crosshair, 
  Vote, 
  Moon, 
  HelpCircle, 
  BookOpen 
} from 'lucide-react';
import { ALL_ROLES, SCENARIOS } from '../data/scenarioData';
import { RoleArtwork } from './RoleArtwork';
import { FekriNoLogo } from './FekriNoLogo';
import { RoleKey, ScenarioType } from '../types/mafia';

interface ScenarioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioGuideModal: React.FC<ScenarioGuideModalProps> = ({ isOpen, onClose }) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('BAZPORS');
  const [selectedRoleKey, setSelectedRoleKey] = useState<RoleKey>('BAZPORS');

  if (!isOpen) return null;

  const currentRole = ALL_ROLES[selectedRoleKey] || ALL_ROLES.BAZPORS;
  const currentScenario = SCENARIOS[selectedScenario];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#1e110a] border-2 border-[#6b422a] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#faf6f0]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#4d2c19] flex items-center justify-between bg-[#140a05]">
          <div className="flex items-center gap-3">
            <FekriNoLogo size="sm" showSubtitle={false} />
            <div>
              <div className="text-[10px] font-black tracking-widest text-amber-400 uppercase font-mono">FEKRI NO • NOVA COGITATIO</div>
              <h2 className="text-base sm:text-lg font-black text-[#faf6f0]">
                راهنمای سناریوهای مافیا (کافه رستوران فکری نو)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#26150c] hover:bg-[#3d2214] text-[#d6c7b2] hover:text-white border border-[#523321] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario Switcher Tabs inside Modal */}
        <div className="flex border-b border-[#4d2c19] bg-[#140a05] px-3 pt-2 text-xs font-black gap-1 overflow-x-auto">
          {(['BAZPORS', 'TAKAVER', 'NAMAYANDEH'] as ScenarioType[]).map((st) => {
            const sc = SCENARIOS[st];
            const isSelected = selectedScenario === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setSelectedScenario(st);
                  // pick first role for this scenario
                  const firstRole = Object.keys(sc.presets[Object.keys(sc.presets)[0] as unknown as number]).find(
                    k => (sc.presets[Object.keys(sc.presets)[0] as unknown as number] as Record<string, number>)[k] > 0
                  ) as RoleKey;
                  if (firstRole) setSelectedRoleKey(firstRole);
                }}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-amber-400 text-amber-300 bg-[#1e110a] font-black'
                    : 'border-transparent text-[#a89782] hover:text-white'
                }`}
              >
                {st === 'BAZPORS' && <Scale className="w-3.5 h-3.5" />}
                {st === 'TAKAVER' && <Crosshair className="w-3.5 h-3.5" />}
                {st === 'NAMAYANDEH' && <Vote className="w-3.5 h-3.5" />}
                <span>{sc.nameFa}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-[#d4c3b0] leading-relaxed">
          {/* Scenario Overview Box */}
          <div className="bg-[#140a05] p-3.5 rounded-2xl border border-[#4d2c19]">
            <h4 className="font-black text-amber-300 text-sm mb-1">{currentScenario.nameFa}</h4>
            <p className="text-xs text-[#c9b7a2]">{currentScenario.description}</p>
          </div>

          {/* Role selector pills */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-amber-300">انتخاب نقش برای مطالعه جزئیات:</div>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {Object.keys(currentScenario.presets[Object.keys(currentScenario.presets)[0] as unknown as number])
                .filter(rk => {
                  // show all roles present in any preset of this scenario
                  return Object.values(currentScenario.presets).some(p => (p as Record<string, number>)[rk] > 0);
                })
                .map(rk => {
                  const r = ALL_ROLES[rk as RoleKey];
                  if (!r) return null;
                  const isSelected = selectedRoleKey === rk;
                  return (
                    <button
                      key={rk}
                      type="button"
                      onClick={() => setSelectedRoleKey(rk as RoleKey)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 border-amber-300 text-[#140a05] shadow-md'
                          : 'bg-[#140a05] border-[#4d2c19] text-[#d6c7b2] hover:text-white'
                      }`}
                    >
                      {r.nameFa}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Selected Role Card */}
          {currentRole && (
            <div className="bg-[#140a05] p-4 sm:p-5 rounded-2xl border border-[#4d2c19] space-y-3.5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <RoleArtwork roleKey={currentRole.key} size="md" className="shrink-0" />
                <div className="flex-1 text-center sm:text-right space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-[#faf6f0]">{currentRole.nameFa}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${
                        currentRole.side === 'MAFIA'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {currentRole.side === 'MAFIA' ? 'ساید مافیا' : 'ساید شهروند'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#a89782]">{currentRole.nameEn}</p>
                  <p className="text-xs text-amber-300/90 font-medium pt-1">{currentRole.shortDesc}</p>
                </div>
              </div>

              <p className="text-[#ded1c0] leading-relaxed font-normal pt-2 border-t border-[#381f12]">{currentRole.fullDesc}</p>

              {currentRole.nightActionDesc && (
                <div className="bg-[#241710] p-3 rounded-xl border border-[#4d3222]">
                  <span className="font-bold text-amber-300">اقدام شبانه: </span>
                  <span className="text-[#ded1c0]">{currentRole.nightActionDesc}</span>
                </div>
              )}

              {currentRole.dayActionDesc && (
                <div className="bg-[#241710] p-3 rounded-xl border border-[#4d3222]">
                  <span className="font-bold text-amber-400">اقدام روزانه: </span>
                  <span className="text-[#ded1c0]">{currentRole.dayActionDesc}</span>
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-[#faf6f0]">نکات استراتژیک:</span>
                <ul className="list-disc list-inside space-y-1 text-[#c9b7a2]">
                  {currentRole.strategyTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#140a05] border-t border-[#4d2c19] flex items-center justify-between">
          <div className="text-xs text-amber-400 font-bold font-mono tracking-wider">
            FEKRI NO • CAFÉ RESTAURANT
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#140a05] font-black text-xs shadow-md transition-colors cursor-pointer"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
