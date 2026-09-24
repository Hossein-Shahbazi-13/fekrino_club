import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ClubPlayer } from '../types/mafia';

interface PlayerSkillBarChartProps {
  player: ClubPlayer;
}

interface RoleSkillDatum {
  roleNameFa: string;
  skillScore: number; // 0 - 100
  gamesPlayed: number;
  winRate: number; // 0 - 100
  side: 'CITIZEN' | 'MAFIA';
}

export const PlayerSkillBarChart: React.FC<PlayerSkillBarChartProps> = ({ player }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute stats across roles from matchHistory
  const computeRoleSkills = (): RoleSkillDatum[] => {
    const history = player.matchHistory || [];
    
    // Core roles to analyze
    const rolesConfig: { keyRegex: RegExp; nameFa: string; side: 'CITIZEN' | 'MAFIA'; baseSkill: number }[] = [
      { keyRegex: /شهروند|CITIZEN|ساده/i, nameFa: 'شهروند', side: 'CITIZEN', baseSkill: 65 },
      { keyRegex: /مافیا|MAFIA|پدرخوانده|رئیس/i, nameFa: 'مافیا', side: 'MAFIA', baseSkill: 60 },
      { keyRegex: /بازپرس|BAZPORS/i, nameFa: 'بازپرس', side: 'CITIZEN', baseSkill: 70 },
      { keyRegex: /کارآگاه|DETECTIVE/i, nameFa: 'کارآگاه', side: 'CITIZEN', baseSkill: 68 },
      { keyRegex: /پزشک|دکتر|DOCTOR/i, nameFa: 'پزشک', side: 'CITIZEN', baseSkill: 64 },
      { keyRegex: /تکاور|TAKAVER/i, nameFa: 'تکاور', side: 'CITIZEN', baseSkill: 72 },
      { keyRegex: /تک‌تیرانداز|SNIPER/i, nameFa: 'تک‌تیرانداز', side: 'CITIZEN', baseSkill: 66 },
      { keyRegex: /نماینده|NAMAYANDEH/i, nameFa: 'نماینده', side: 'CITIZEN', baseSkill: 65 }
    ];

    return rolesConfig.map(rc => {
      const matchesWithRole = history.filter(m => 
        rc.keyRegex.test(m.roleNameFa) || rc.keyRegex.test(m.roleKey)
      );

      const count = matchesWithRole.length;
      if (count === 0) {
        // Estimate baseline skill adjusted by overall player performance
        const scoreBonus = Math.min(25, Math.max(-15, Math.round(player.totalScore / 4)));
        const bestPlayerBonus = Math.min(15, player.bestPlayerCount * 4);
        const estimated = Math.max(30, Math.min(95, rc.baseSkill + scoreBonus + bestPlayerBonus));
        return {
          roleNameFa: rc.nameFa,
          skillScore: estimated,
          gamesPlayed: 0,
          winRate: 50,
          side: rc.side
        };
      }

      // Compute actual win rate & score performance
      const wins = matchesWithRole.filter(m => 
        (rc.side === 'CITIZEN' && m.gameResult === 'CITIZEN_WIN') ||
        (rc.side === 'MAFIA' && m.gameResult === 'MAFIA_WIN') ||
        m.pointsAwarded > 0
      ).length;

      const winRate = Math.round((wins / count) * 100);
      const totalPointsInRole = matchesWithRole.reduce((acc, m) => acc + m.pointsAwarded, 0);
      const avgPoints = totalPointsInRole / count;
      const bestCountInRole = matchesWithRole.filter(m => m.isBestPlayer).length;

      // Weighted skill score 0-100
      const calculatedSkill = Math.min(100, Math.max(20, Math.round(
        winRate * 0.5 + (avgPoints * 10) + (bestCountInRole * 15) + (count * 2)
      )));

      return {
        roleNameFa: rc.nameFa,
        skillScore: calculatedSkill,
        gamesPlayed: count,
        winRate,
        side: rc.side
      };
    });
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const data = computeRoleSkills();
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Dimensions
    const margin = { top: 20, right: 25, bottom: 45, left: 65 };
    const width = svgRef.current.clientWidth || 450;
    const height = 240;

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Roles)
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.roleNameFa))
      .range([0, innerWidth])
      .padding(0.28);

    // Y scale (Skill Score 0 - 100)
    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .nice()
      .range([innerHeight, 0]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#331d12')
      .attr('stroke-dasharray', '2,2')
      .attr('stroke-opacity', 0.6);

    g.select('.grid .domain').remove();

    // Bottom Axis (Role names)
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    xAxis
      .selectAll('text')
      .attr('transform', 'rotate(-25)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.4em')
      .attr('dy', '0.6em')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#d4c3b0')
      .attr('font-family', 'Vazirmatn');

    xAxis.select('.domain').attr('stroke', '#523321');
    xAxis.selectAll('.tick line').attr('stroke', '#523321');

    // Left Axis (Scores)
    const yAxis = g.append('g').call(
      d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `${d}٪`)
    );

    yAxis
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-mono', 'true')
      .attr('fill', '#9e8979')
      .attr('font-family', 'Vazirmatn');

    yAxis.select('.domain').attr('stroke', '#523321');
    yAxis.selectAll('.tick line').attr('stroke', '#523321');

    // Color gradients
    const defs = svg.append('defs');

    // Citizen gradient
    const citizenGradient = defs
      .append('linearGradient')
      .attr('id', 'citizenBarGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    citizenGradient.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8');
    citizenGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0284c7');

    // Mafia gradient
    const mafiaGradient = defs
      .append('linearGradient')
      .attr('id', 'mafiaBarGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    mafiaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e');
    mafiaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#9f1239');

    // Bazpors gradient
    const specialGradient = defs
      .append('linearGradient')
      .attr('id', 'specialBarGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    specialGradient.append('stop').attr('offset', '0%').attr('stop-color', '#fbbf24');
    specialGradient.append('stop').attr('offset', '100%').attr('stop-color', '#b45309');

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.roleNameFa) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.skillScore))
      .attr('height', d => innerHeight - y(d.skillScore))
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', d => {
        if (d.roleNameFa === 'بازپرس' || d.roleNameFa === 'تکاور') return 'url(#specialBarGrad)';
        if (d.side === 'MAFIA') return 'url(#mafiaBarGrad)';
        return 'url(#citizenBarGrad)';
      })
      .attr('stroke', d => (d.side === 'MAFIA' ? '#fda4af' : '#7dd3fc'))
      .attr('stroke-width', 0.8)
      .attr('opacity', 0.95);

    // Value Labels on top of bars
    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => (x(d.roleNameFa) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.skillScore) - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Vazirmatn')
      .attr('fill', d => (d.side === 'MAFIA' ? '#fda4af' : '#fde68a'))
      .text(d => `${d.skillScore}٪`);

  }, [player]);

  return (
    <div className="w-full bg-[#120603] border border-amber-900/40 rounded-2xl p-3 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h4 className="text-xs sm:text-sm font-black text-amber-200">
            نمودار مهارت در نقش‌های مختلف (طراحی شده با D3)
          </h4>
        </div>
        <span className="text-[10px] font-mono text-[#a89582]">D3.JS BAR CHART</span>
      </div>

      <div className="w-full overflow-x-auto flex justify-center">
        <svg ref={svgRef} className="w-full max-w-full overflow-visible" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] pt-1 text-[#c9b7a2]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gradient-to-r from-sky-400 to-sky-600 inline-block" />
          <span>نقش‌های شهروندی</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gradient-to-r from-rose-500 to-rose-700 inline-block" />
          <span>نقش‌های مافیایی</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gradient-to-r from-amber-400 to-amber-600 inline-block" />
          <span>نقش‌های ویژه و کلیدی (بازپرس / تکاور)</span>
        </div>
      </div>
    </div>
  );
};
