/* 카페인 반감기(5시간) 기반 체내 잔여량 및 수면 위험도 계산 */

const HALF_LIFE_HOURS = 5; // 카페인 평균 반감기: 5시간
const SAFE_THRESHOLD_MG = 50; // 숙면 권장 최대 잔여량 기준: 50mg

// "HH:MM" 문자열을 기준 날짜의 Date 객체로 변환
function parseTimeToTodayDate(timeStr, baseDate = new Date()) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// 1. 특정 기준 시각(targetDate)의 총 잔여 카페인 계산
function calculateRemainingCaffeine(records, targetDate = new Date()) {
  let totalRemaining = 0;

  records.forEach((record) => {
    const intakeDate = record.intakeTime.includes('T')
      ? new Date(record.intakeTime)
      : parseTimeToTodayDate(record.intakeTime, targetDate);

    const elapsedHours = (targetDate - intakeDate) / (1000 * 60 * 60);

    // 미래 기록 제외
    if (elapsedHours >= 0) {
      const remaining = record.caffeineMg * Math.pow(0.5, elapsedHours / HALF_LIFE_HOURS);
      totalRemaining += remaining;
    }
  });

  return Math.round(totalRemaining);
}

// 2. 목표 취침 시각 기준 예상 잔여량 및 수면 위험도 판정
function assessSleepRisk(records, bedtimeStr = '23:00', now = new Date()) {
  let bedtimeDate = parseTimeToTodayDate(bedtimeStr, now);

  // 목표 취침 시각이 새벽이면 다음 날로 자동 변경
  if (bedtimeDate < now && parseInt(bedtimeStr.split(':')[0], 10) < 12) {
    bedtimeDate.setDate(bedtimeDate.getDate() + 1);
  }

  const bedtimeRemaining = calculateRemainingCaffeine(records, bedtimeDate);

  let level = 'safe';
  let label = '안전 (숙면 가능)';

  if (bedtimeRemaining >= 100) {
    level = 'danger';
    label = '위험 (각성 주의)';
  } else if (bedtimeRemaining >= SAFE_THRESHOLD_MG) {
    level = 'warning';
    label = '주의 (입면 지연 가능)';
  }

  return {
    bedtimeRemaining,
    level, // 'safe' | 'warning' | 'danger'
    label,
  };
}

// 3. 숙면을 위한 마지막 카페인(아메리카노 1잔 150mg 기준) 섭취 마지노선 시각 역산
function calculateCutoffTime(bedtimeStr = '23:00', standardDoseMg = 150) {
  const [bedHours, bedMinutes] = bedtimeStr.split(':').map(Number);

  // 150mg이 50mg 이하로 떨어지는 데 필요한 시간: 5 * log2(150 / 50) = 7.92시간
  const requiredHours = HALF_LIFE_HOURS * Math.log2(standardDoseMg / SAFE_THRESHOLD_MG);
  const requiredMinutes = Math.round(requiredHours * 60);

  let totalBedMinutes = bedHours * 60 + bedMinutes;
  let cutoffTotalMinutes = totalBedMinutes - requiredMinutes;

  if (cutoffTotalMinutes < 0) {
    cutoffTotalMinutes += 24 * 60;
  }

  const cutoffH = String(Math.floor(cutoffTotalMinutes / 60)).padStart(2, '0');
  const cutoffM = String(cutoffTotalMinutes % 60).padStart(2, '0');

  return `${cutoffH}:${cutoffM}`;
}

module.exports = {
  calculateRemainingCaffeine,
  assessSleepRisk,
  calculateCutoffTime,
};
